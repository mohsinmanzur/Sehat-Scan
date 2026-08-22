import * as SQLite from 'expo-sqlite';
import { handleError } from 'src/utils/errorHandler';
import type { HealthMeasurement } from '../../types/types';
import backend from '../Backend/backend.service';
import {
    upsertMeasurements,
    getSyncedMeasurementIds,
    deleteMeasurementLocal,
} from '../Database/measurements.repository';
import { upsertMeasurementUnits, upsertReferenceRanges } from '../Database/units.repository';
import { upsertAccessGrants } from '../Database/shares.repository';
import { upsertDocuments, deleteDocumentIfOrphaned } from '../Database/documents.repository';
import { upsertPatient } from '../Database/patient.repository';
import { removeMutationsByServerId } from '../Database/mutations.repository';
import { ensureLocalDocumentImages, deleteLocalImageFile } from './image.service';

export async function syncAllForPatient(
    db: SQLite.SQLiteDatabase,
    patientId: string
): Promise<void> {
    await syncPatientProfile(db, patientId); // patient row must exist before FK-dependent writes
    await syncDocuments(db, patientId);      // documents before measurements (measurement.document_id FK)
    await syncMeasurements(db, patientId);   // syncs units/ranges first (measurement.unit_id FK)
    await syncShares(db, patientId);
}

export async function syncMeasurements(
    db: SQLite.SQLiteDatabase,
    patientId: string
): Promise<void> {
    // Units and reference ranges are a priority — measurements FK-reference them and
    // they should always be available offline, so pull them before the measurements themselves.
    await syncUnitsAndRanges(db);
    try {
        const measurements = await backend.getMeasurementsByPatient(patientId);
        if (measurements?.length) {
            await upsertMeasurements(db, measurements);
        }
        await pruneDeletedMeasurements(db, patientId, measurements ?? []);
    } catch (error) {
        handleError(error);
        // offline — SQLite data already in place
    }
}

// Reconciles measurements deleted directly on the server (outside the app's own
// delete flow) that would otherwise never be removed by the upsert-only pull sync above.
async function pruneDeletedMeasurements(
    db: SQLite.SQLiteDatabase,
    patientId: string,
    serverMeasurements: HealthMeasurement[]
): Promise<void> {
    const serverIds = new Set(serverMeasurements.map(m => m.id));
    const localRows = await getSyncedMeasurementIds(db, patientId);

    for (const row of localRows) {
        if (serverIds.has(row.id)) continue;

        await deleteMeasurementLocal(db, row.id);
        await removeMutationsByServerId(db, row.id, 'health_measurement');

        if (row.document_id) {
            const orphanedPath = await deleteDocumentIfOrphaned(db, row.document_id);
            if (orphanedPath) deleteLocalImageFile(orphanedPath);
        }
    }
}

export async function syncUnitsAndRanges(db: SQLite.SQLiteDatabase): Promise<void> {
    try {
        const [units, ranges] = await Promise.all([
            backend.getMeasurementUnits(),
            backend.getReferenceRanges(),
        ]);
        if (units?.length) await upsertMeasurementUnits(db, units);
        if (ranges?.length) await upsertReferenceRanges(db, ranges);
    } catch (error) {
        handleError(error);
        // offline — unit/range data may already be cached
    }
}

export async function syncShares(
    db: SQLite.SQLiteDatabase,
    patientId: string
): Promise<void> {
    try {
        const grants = await backend.getPatientShares(patientId);
        if (grants) {
            await upsertAccessGrants(db, grants, patientId);
        }
    } catch (error) {
        handleError(error);
        // offline — shares data may already be cached
    }
}

export async function syncDocuments(
    db: SQLite.SQLiteDatabase,
    patientId: string
): Promise<void> {
    try {
        const docs = await backend.getMedicalDocumentsByPatient(patientId);
        if (docs?.length) {
            await upsertDocuments(db, docs, patientId);
            await ensureLocalDocumentImages(db, docs);
        }
    } catch (error) {
        handleError(error);
        // offline — document data may already be cached
    }
}

export async function syncPatientProfile(
    db: SQLite.SQLiteDatabase,
    patientId: string
): Promise<void> {
    try {
        const patient = await backend.getPatientById(patientId);
        if (patient) await upsertPatient(db, patient);
    } catch (error) {
        handleError(error);
        // offline — patient profile may already be cached
    }
}
