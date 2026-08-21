import { MeasurementUnit } from './types';

export const bloodGroups = [
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' },
    { label: 'O+', value: 'O+' },
    { label: 'O-', value: 'O-' },
]

export type UploadMedicalDocument = {
    id?: string;
    patient_id: string;
    file_name?: string;
    record_type: 'lab_report' | 'prescription' | 'imaging' | 'other';
    ocr_extracted_text?: string;
    date_issued?: Date;
    created_at?: Date;

    file: string;

}

export type AiExtractedMeasurement = {
    matched_unit: MeasurementUnit | null;
    numeric_value: number;
    numeric_value_2: number | null;
    confidence: number;
};

export type AiExtractionResult = {
    record_type: 'lab_report' | 'prescription' | 'imaging' | 'other';
    date_issued: string | null;
    notes: string | null;
    measurements: AiExtractedMeasurement[];
};