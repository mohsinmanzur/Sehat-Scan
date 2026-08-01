import * as SQLite from 'expo-sqlite';
import type { MeasurementUnit, ReferenceRange } from '../../types/types';
import { serializeJson, deserializeJson } from './database.service';

export async function upsertMeasurementUnits(
    db: SQLite.SQLiteDatabase,
    units: MeasurementUnit[]
): Promise<void> {
    for (const unit of units) {
        await db.runAsync(
            `INSERT INTO measurement_units (id, unit_name, symbol, measurement_group, color_light, color_dark, icon_name, synced_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
                 unit_name = excluded.unit_name,
                 symbol = excluded.symbol,
                 measurement_group = excluded.measurement_group,
                 color_light = excluded.color_light,
                 color_dark = excluded.color_dark,
                 icon_name = excluded.icon_name,
                 synced_at = excluded.synced_at`,
            [unit.id ?? '', unit.unit_name, unit.symbol, unit.measurement_group, unit.color_light ?? null, unit.color_dark ?? null, unit.icon_name ?? null, new Date().toISOString()]
        );
    }
}

export async function getAllMeasurementUnits(db: SQLite.SQLiteDatabase): Promise<MeasurementUnit[]> {
    const rows = await db.getAllAsync<Record<string, unknown>>('SELECT * FROM measurement_units');
    return rows.map(rowToUnit);
}

export async function getMeasurementUnitById(
    db: SQLite.SQLiteDatabase,
    id: string
): Promise<MeasurementUnit | null> {
    const row = await db.getFirstAsync<Record<string, unknown>>(
        'SELECT * FROM measurement_units WHERE id = ?',
        [id]
    );
    return row ? rowToUnit(row) : null;
}

export async function upsertReferenceRanges(
    db: SQLite.SQLiteDatabase,
    ranges: ReferenceRange[]
): Promise<void> {
    for (const range of ranges) {
        const unitId = range.measurement_unit?.id ?? '';
        await db.runAsync(
            `INSERT OR REPLACE INTO reference_ranges
                (id, unit_id, min_value, max_value, target_gender, min_age, max_age, special_conditions, synced_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                range.id ?? '',
                unitId,
                range.min_value,
                range.max_value,
                range.target_gender ?? null,
                range.min_age ?? null,
                range.max_age ?? null,
                serializeJson(range.special_conditions),
                new Date().toISOString(),
            ]
        );
    }
}

export async function getReferenceRangesByUnitId(
    db: SQLite.SQLiteDatabase,
    unitId: string
): Promise<ReferenceRange[]> {
    const rows = await db.getAllAsync<Record<string, unknown>>(
        'SELECT rr.*, mu.unit_name, mu.symbol, mu.measurement_group FROM reference_ranges rr LEFT JOIN measurement_units mu ON rr.unit_id = mu.id WHERE rr.unit_id = ?',
        [unitId]
    );
    return rows.map(rowToReferenceRange);
}

export async function getAllReferenceRanges(db: SQLite.SQLiteDatabase): Promise<ReferenceRange[]> {
    const rows = await db.getAllAsync<Record<string, unknown>>(
        'SELECT rr.*, mu.unit_name, mu.symbol, mu.measurement_group FROM reference_ranges rr LEFT JOIN measurement_units mu ON rr.unit_id = mu.id'
    );
    return rows.map(rowToReferenceRange);
}

function rowToUnit(row: Record<string, unknown>): MeasurementUnit {
    return {
        id: row.id as string,
        unit_name: row.unit_name as string,
        symbol: row.symbol as string,
        measurement_group: row.measurement_group as string,
        color_light: (row.color_light as string) ?? undefined,
        color_dark: (row.color_dark as string) ?? undefined,
        icon_name: (row.icon_name as string) ?? undefined,
    };
}

function rowToReferenceRange(row: Record<string, unknown>): ReferenceRange {
    return {
        id: row.id as string,
        measurement_unit: {
            id: row.unit_id as string,
            unit_name: (row.unit_name as string) ?? '',
            symbol: (row.symbol as string) ?? '',
            measurement_group: (row.measurement_group as string) ?? '',
        },
        min_value: row.min_value as number,
        max_value: row.max_value as number,
        target_gender: (row.target_gender as ReferenceRange['target_gender']) ?? undefined,
        min_age: (row.min_age as number) ?? undefined,
        max_age: (row.max_age as number) ?? undefined,
        special_conditions: deserializeJson<string[]>(row.special_conditions as string) ?? undefined,
    };
}
