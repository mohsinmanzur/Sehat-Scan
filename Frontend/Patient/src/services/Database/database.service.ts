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
            has_secondary_value INTEGER DEFAULT 0,
            synced_at TEXT
        );

        CREATE TABLE IF NOT EXISTS reference_ranges (
            id TEXT PRIMARY KEY,
            unit_id TEXT NOT NULL,
            min_value REAL NOT NULL,
            max_value REAL NOT NULL,
            min_value_2 REAL,
            max_value_2 REAL,
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
            numeric_value_2 REAL,
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
        const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(measurement_units)');
        const columnNames = columns.map(c => c.name);

        if (!columnNames.includes('color_light')) {
            await db.execAsync('ALTER TABLE measurement_units ADD COLUMN color_light TEXT;');
        }
        if (!columnNames.includes('color_dark')) {
            await db.execAsync('ALTER TABLE measurement_units ADD COLUMN color_dark TEXT;');
        }
        if (!columnNames.includes('icon_name')) {
            await db.execAsync('ALTER TABLE measurement_units ADD COLUMN icon_name TEXT;');
        }
        await db.execAsync('PRAGMA user_version = 1');
    }

    if (currentVersion < 2) {
        // v2: add numeric_value_2 and has_secondary_value, merge Diastolic records
        const hmCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(health_measurements)');
        if (!hmCols.map(c => c.name).includes('numeric_value_2')) {
            await db.execAsync('ALTER TABLE health_measurements ADD COLUMN numeric_value_2 REAL;');
        }

        const muCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(measurement_units)');
        if (!muCols.map(c => c.name).includes('has_secondary_value')) {
            await db.execAsync('ALTER TABLE measurement_units ADD COLUMN has_secondary_value INTEGER DEFAULT 0;');
        }

        // Merge existing Diastolic records into Systolic records locally
        await db.execAsync(`
            UPDATE health_measurements
            SET numeric_value_2 = (
                SELECT hm_dia.numeric_value 
                FROM health_measurements hm_dia
                JOIN measurement_units u_dia ON hm_dia.unit_id = u_dia.id
                WHERE u_dia.unit_name = 'Diastolic'
                  AND hm_dia.patient_id = health_measurements.patient_id
                  AND hm_dia.created_at = health_measurements.created_at
            )
            WHERE unit_id IN (SELECT id FROM measurement_units WHERE unit_name = 'Systolic');
        `);

        // Delete Diastolic records (they are now merged into numeric_value_2)
        await db.execAsync(`
            DELETE FROM health_measurements
            WHERE unit_id IN (SELECT id FROM measurement_units WHERE unit_name = 'Diastolic');
        `);

        // Clean up the measurement_units table
        await db.execAsync(`
            DELETE FROM measurement_units WHERE unit_name = 'Diastolic';
            UPDATE measurement_units SET unit_name = 'Blood Pressure', has_secondary_value = 1 WHERE unit_name = 'Systolic';
        `);

        await db.execAsync('PRAGMA user_version = 2');
    }

    if (currentVersion < 3) {
        // v3: add min_value_2 and max_value_2 to reference_ranges, merge Diastolic ranges
        const rrCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(reference_ranges)');
        const colNames = rrCols.map(c => c.name);
        if (!colNames.includes('min_value_2')) {
            await db.execAsync('ALTER TABLE reference_ranges ADD COLUMN min_value_2 REAL DEFAULT 0;');
        }
        if (!colNames.includes('max_value_2')) {
            await db.execAsync('ALTER TABLE reference_ranges ADD COLUMN max_value_2 REAL DEFAULT 0;');
        }

        // Merge existing Diastolic reference ranges into Systolic (now Blood Pressure) ranges locally
        await db.execAsync(`
            UPDATE reference_ranges
            SET min_value_2 = (
                SELECT rr_dia.min_value 
                FROM reference_ranges rr_dia
                JOIN measurement_units u_dia ON rr_dia.unit_id = u_dia.id
                WHERE u_dia.unit_name = 'Diastolic'
                  AND rr_dia.target_gender IS reference_ranges.target_gender
                  AND rr_dia.min_age IS reference_ranges.min_age
                  AND rr_dia.max_age IS reference_ranges.max_age
                  AND rr_dia.special_conditions IS reference_ranges.special_conditions
            ),
            max_value_2 = (
                SELECT rr_dia.max_value 
                FROM reference_ranges rr_dia
                JOIN measurement_units u_dia ON rr_dia.unit_id = u_dia.id
                WHERE u_dia.unit_name = 'Diastolic'
                  AND rr_dia.target_gender IS reference_ranges.target_gender
                  AND rr_dia.min_age IS reference_ranges.min_age
                  AND rr_dia.max_age IS reference_ranges.max_age
                  AND rr_dia.special_conditions IS reference_ranges.special_conditions
            )
            WHERE unit_id IN (SELECT id FROM measurement_units WHERE unit_name = 'Blood Pressure' OR unit_name = 'Systolic');
        `);

        // Delete Diastolic reference ranges
        await db.execAsync(`
            DELETE FROM reference_ranges
            WHERE unit_id IN (SELECT id FROM measurement_units WHERE unit_name = 'Diastolic');
        `);

        await db.execAsync('PRAGMA user_version = 3');
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
