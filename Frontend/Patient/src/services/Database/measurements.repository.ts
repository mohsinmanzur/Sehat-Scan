import * as SQLite from 'expo-sqlite';
import type { HealthMeasurement } from '../../types/types';
import { serializeJson, deserializeJson } from './database.service';
import { getAllMeasurementUnits } from './units.repository';

export async function upsertMeasurements(
    db: SQLite.SQLiteDatabase,
    measurements: HealthMeasurement[]
): Promise<void> {
    for (const m of measurements) {
        await db.runAsync(
            `INSERT OR REPLACE INTO health_measurements
                (id, patient_id, unit_id, document_id, numeric_value, numeric_value_2,
                 special_conditions, created_at, updated_at, is_local, synced_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
            [
                m.id ?? '',
                m.patient_id ?? m.patient?.id ?? '',
                m.unit_id ?? m.measurement_unit?.id ?? '',
                m.document_id ?? null,
                m.numeric_value,
                m.numeric_value_2 ?? null,
                serializeJson(m.special_conditions),
                m.created_at ? new Date(m.created_at).toISOString() : null,
                m.updated_at ? new Date(m.updated_at).toISOString() : null,
                new Date().toISOString(),
            ]
        );
    }
}

export async function getMeasurementsByPatient(
    db: SQLite.SQLiteDatabase,
    patientId: string
): Promise<HealthMeasurement[]> {
    const [rows, units] = await Promise.all([
        db.getAllAsync<Record<string, unknown>>(
            'SELECT * FROM health_measurements WHERE patient_id = ?',
            [patientId]
        ),
        getAllMeasurementUnits(db),
    ]);

    const unitMap = new Map(units.map(u => [u.id, u]));

    return rows.map(row => ({
        id: row.id as string,
        patient_id: row.patient_id as string,
        unit_id: row.unit_id as string,
        document_id: (row.document_id as string) ?? undefined,
        numeric_value: row.numeric_value as number,
        numeric_value_2: (row.numeric_value_2 as number) ?? undefined,
        measurement_unit: unitMap.get(row.unit_id as string) ?? {
            id: row.unit_id as string,
            unit_name: '',
            symbol: '',
            measurement_group: '',
        },
        special_conditions: deserializeJson<string[]>(row.special_conditions as string) ?? undefined,
        created_at: row.created_at ? new Date(row.created_at as string) : undefined,
        updated_at: row.updated_at ? new Date(row.updated_at as string) : undefined,
    }));
}

export async function getMeasurementById(
    db: SQLite.SQLiteDatabase,
    id: string
): Promise<HealthMeasurement | null> {
    const [row, units] = await Promise.all([
        db.getFirstAsync<Record<string, unknown>>(
            'SELECT * FROM health_measurements WHERE id = ?',
            [id]
        ),
        getAllMeasurementUnits(db),
    ]);
    if (!row) return null;
    const unitMap = new Map(units.map(u => [u.id, u]));
    return {
        id: row.id as string,
        patient_id: row.patient_id as string,
        unit_id: row.unit_id as string,
        document_id: (row.document_id as string) ?? undefined,
        numeric_value: row.numeric_value as number,
        numeric_value_2: (row.numeric_value_2 as number) ?? undefined,
        measurement_unit: unitMap.get(row.unit_id as string),
        special_conditions: deserializeJson<string[]>(row.special_conditions as string) ?? undefined,
        created_at: row.created_at ? new Date(row.created_at as string) : undefined,
        updated_at: row.updated_at ? new Date(row.updated_at as string) : undefined,
    };
}

export async function insertLocalMeasurement(
    db: SQLite.SQLiteDatabase,
    measurement: Partial<HealthMeasurement> & { local_id: string }
): Promise<void> {
    await db.runAsync(
        `INSERT INTO health_measurements
            (id, patient_id, unit_id, document_id, numeric_value, numeric_value_2,
             special_conditions, created_at, updated_at, is_local, synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NULL)`,
        [
            measurement.local_id,
            measurement.patient_id ?? '',
            measurement.unit_id ?? '',
            measurement.document_id ?? null,
            measurement.numeric_value ?? 0,
            measurement.numeric_value_2 ?? null,
            serializeJson(measurement.special_conditions),
            measurement.created_at ? new Date(measurement.created_at).toISOString() : new Date().toISOString(),
            null,
        ]
    );
}

export async function updateMeasurementLocal(
    db: SQLite.SQLiteDatabase,
    id: string,
    fields: Partial<HealthMeasurement>
): Promise<void> {
    await db.runAsync(
        `UPDATE health_measurements
         SET numeric_value = COALESCE(?, numeric_value),
             numeric_value_2 = COALESCE(?, numeric_value_2),
             special_conditions = COALESCE(?, special_conditions),
             created_at = COALESCE(?, created_at),
             updated_at = ?
         WHERE id = ?`,
        [
            fields.numeric_value ?? null,
            fields.numeric_value_2 !== undefined ? fields.numeric_value_2 : null,
            fields.special_conditions !== undefined ? serializeJson(fields.special_conditions) : null,
            fields.created_at ? new Date(fields.created_at).toISOString() : null,
            new Date().toISOString(),
            id,
        ]
    );
}

export async function deleteMeasurementLocal(
    db: SQLite.SQLiteDatabase,
    id: string
): Promise<void> {
    await db.runAsync('DELETE FROM health_measurements WHERE id = ?', [id]);
}

export async function getSyncedMeasurementIds(
    db: SQLite.SQLiteDatabase,
    patientId: string
): Promise<{ id: string; document_id: string | null }[]> {
    return db.getAllAsync<{ id: string; document_id: string | null }>(
        'SELECT id, document_id FROM health_measurements WHERE patient_id = ? AND is_local = 0',
        [patientId]
    );
}

export async function isLocalMeasurement(
    db: SQLite.SQLiteDatabase,
    id: string
): Promise<boolean> {
    const row = await db.getFirstAsync<{ is_local: number }>(
        'SELECT is_local FROM health_measurements WHERE id = ?',
        [id]
    );
    return row?.is_local === 1;
}

export async function reconcileLocalMeasurement(
    db: SQLite.SQLiteDatabase,
    localId: string,
    serverId: string,
    serverData: HealthMeasurement
): Promise<void> {
    await db.runAsync('DELETE FROM health_measurements WHERE id = ?', [localId]);
    await upsertMeasurements(db, [serverData]);
}
