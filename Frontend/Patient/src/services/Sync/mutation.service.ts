import * as SQLite from 'expo-sqlite';
import { handleError } from 'src/utils/errorHandler';
import backend from '../Backend/backend.service';
import {
    getPendingMutations,
    removeMutation,
    removeMutationByLocalId,
    incrementRetry,
    PendingMutation,
} from '../Database/mutations.repository';
import {
    reconcileLocalMeasurement,
    deleteMeasurementLocal,
} from '../Database/measurements.repository';
import { reconcileLocalDocument } from '../Database/documents.repository';

const MAX_RETRIES = 3;

export async function drainMutationQueue(
    db: SQLite.SQLiteDatabase,
    patientId: string
): Promise<{ succeeded: number; failed: number }> {
    const mutations = await getPendingMutations(db);
    let succeeded = 0;
    let failed = 0;

    for (const mutation of mutations) {
        if (mutation.retry_count >= MAX_RETRIES) {
            failed++;
            continue;
        }

        try {
            await processMutation(db, mutation, patientId);
            succeeded++;
        } catch (error) {
            handleError(error);
            const message = error instanceof Error ? error.message : String(error);
            await incrementRetry(db, mutation.id, message);
            failed++;
        }
    }

    return { succeeded, failed };
}

async function processMutation(
    db: SQLite.SQLiteDatabase,
    mutation: PendingMutation,
    patientId: string
): Promise<void> {
    if (mutation.entity_type === 'health_measurement') {
        await processHealthMeasurementMutation(db, mutation, patientId);
    } else if (mutation.entity_type === 'medical_document') {
        await processMedicalDocumentMutation(db, mutation, patientId);
    }
}

async function processHealthMeasurementMutation(
    db: SQLite.SQLiteDatabase,
    mutation: PendingMutation,
    patientId: string
): Promise<void> {
    const payload = JSON.parse(mutation.payload);

    if (mutation.operation === 'create') {
        const serverData = await backend.createHealthMeasurement(payload);
        await reconcileLocalMeasurement(db, mutation.local_id!, serverData.id, serverData);
        await removeMutation(db, mutation.id);

    } else if (mutation.operation === 'update') {
        if (mutation.server_id?.startsWith('local_')) {
            // The corresponding create hasn't been drained yet — skip, will retry next drain
            throw new Error('Waiting for create to drain first');
        }
        await backend.updateHealthMeasurement(mutation.server_id!, payload);
        await removeMutation(db, mutation.id);

    } else if (mutation.operation === 'delete') {
        if (mutation.server_id?.startsWith('local_')) {
            // Delete of an unsync'd local create — remove the create mutation and local row
            await removeMutationByLocalId(db, mutation.server_id);
            await deleteMeasurementLocal(db, mutation.server_id);
            await removeMutation(db, mutation.id);
        } else {
            await backend.deleteHealthMeasurement(mutation.server_id!);
            await removeMutation(db, mutation.id);
        }
    }
}

async function processMedicalDocumentMutation(
    db: SQLite.SQLiteDatabase,
    mutation: PendingMutation,
    patientId: string
): Promise<void> {
    const payload = JSON.parse(mutation.payload);

    if (mutation.operation === 'create') {
        const serverDoc = await backend.createandUploadMedicalDocument({
            patient_id: patientId,
            record_type: payload.record_type,
            file: payload.local_file_path,
            ocr_extracted_text: payload.ocr_extracted_text,
        });
        await reconcileLocalDocument(db, mutation.local_id!, serverDoc.id, serverDoc, patientId);
        await removeMutation(db, mutation.id);
    }
}
