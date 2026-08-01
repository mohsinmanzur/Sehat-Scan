import * as SQLite from 'expo-sqlite';
import { Paths, Directory } from 'expo-file-system';

let db: SQLite.SQLiteDatabase | null = null;

export async function openAndInitDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (db) return db;

    db = await SQLite.openDatabaseAsync('sehat.db');

    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync('PRAGMA foreign_keys = ON;');

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS patients (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            date_of_birth TEXT,
            blood_group TEXT,
            gender TEXT,
            reward_points INTEGER DEFAULT 0,
            is_research_opt_in INTEGER DEFAULT 0,
            emergency_contacts TEXT,
            created_at TEXT,
            updated_at TEXT,
            synced_at TEXT
        );

        CREATE TABLE IF NOT EXISTS measurement_units (
            id TEXT PRIMARY KEY,
            unit_name TEXT NOT NULL,
            symbol TEXT NOT NULL,
            measurement_group TEXT NOT NULL,
            color_light TEXT,
            color_dark TEXT,
            icon_name TEXT,
            synced_at TEXT
        );

        CREATE TABLE IF NOT EXISTS reference_ranges (
            id TEXT PRIMARY KEY,
            unit_id TEXT NOT NULL,
            min_value REAL NOT NULL,
            max_value REAL NOT NULL,
            target_gender TEXT,
            min_age INTEGER,
            max_age INTEGER,
            special_conditions TEXT,
            synced_at TEXT,
            FOREIGN KEY (unit_id) REFERENCES measurement_units(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS medical_documents (
            id TEXT PRIMARY KEY,
            patient_id TEXT,
            file_name TEXT,
            file_url TEXT,
            local_file_path TEXT,
            record_type TEXT,
            ocr_extracted_text TEXT,
            date_issued TEXT,
            synced_at TEXT,
            FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS health_measurements (
            id TEXT PRIMARY KEY,
            patient_id TEXT NOT NULL,
            unit_id TEXT NOT NULL,
            document_id TEXT,
            numeric_value REAL NOT NULL,
            special_conditions TEXT,
            created_at TEXT,
            updated_at TEXT,
            is_local INTEGER DEFAULT 0,
            synced_at TEXT,
            FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
            FOREIGN KEY (unit_id) REFERENCES measurement_units(id),
            FOREIGN KEY (document_id) REFERENCES medical_documents(id)
        );

        CREATE TABLE IF NOT EXISTS access_grants (
            id TEXT PRIMARY KEY,
            patient_id TEXT NOT NULL,
            doctor_json TEXT,
            permission TEXT NOT NULL,
            is_revoked INTEGER DEFAULT 0,
            expires_at TEXT,
            created_at TEXT,
            access_token TEXT,
            measurement_ids TEXT,
            synced_at TEXT,
            FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS pending_mutations (
            id TEXT PRIMARY KEY,
            entity_type TEXT NOT NULL,
            operation TEXT NOT NULL,
            payload TEXT NOT NULL,
            local_id TEXT,
            server_id TEXT,
            created_at TEXT NOT NULL,
            retry_count INTEGER DEFAULT 0,
            last_error TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_hm_patient ON health_measurements(patient_id);
        CREATE INDEX IF NOT EXISTS idx_rr_unit ON reference_ranges(unit_id);
        CREATE INDEX IF NOT EXISTS idx_pm_created ON pending_mutations(created_at);
        CREATE INDEX IF NOT EXISTS idx_docs_patient ON medical_documents(patient_id);
    `);

    // --- Schema migrations for existing installs ---
    const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    const currentVersion = versionRow?.user_version ?? 0;

    if (currentVersion < 1) {
        // v1: add color and icon columns to measurement_units
        await db.execAsync(`
            ALTER TABLE measurement_units ADD COLUMN IF NOT EXISTS color_light TEXT;
            ALTER TABLE measurement_units ADD COLUMN IF NOT EXISTS color_dark TEXT;
            ALTER TABLE measurement_units ADD COLUMN IF NOT EXISTS icon_name TEXT;
        `);
        await db.execAsync('PRAGMA user_version = 1');
    }

    return db;
}

export async function clearAllData(db: SQLite.SQLiteDatabase): Promise<void> {
    // Delete order respects FK constraints:
    // pending_mutations has no FKs; deleting patients cascades to
    // health_measurements, medical_documents, access_grants;
    // deleting measurement_units cascades to reference_ranges.
    await db.execAsync(`
        DELETE FROM pending_mutations;
        DELETE FROM patients;
        DELETE FROM measurement_units;
    `);

    // Remove locally cached document images
    try {
        const docsDir = new Directory(Paths.document, 'medical_docs');
        if (docsDir.exists) docsDir.delete();
    } catch {
        // non-critical — files will be re-downloaded on next login
    }
}

export function serializeJson(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    return JSON.stringify(value);
}

export function deserializeJson<T>(value: string | null | undefined): T | null {
    if (!value) return null;
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}
