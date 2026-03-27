export type ReportSource = 'scanned' | 'manual';

export interface Report {
  id: string;
  title: string;
  type: string;
  date: string;
  source: ReportSource;
  status: 'processed' | 'pending';
  imageUri?: string; // optional image URI for scanned/uploaded reports
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  date: string;
  severity: 'high' | 'medium' | 'low';
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  location: string;
}

export interface InsightPoint {
  date: string;
  value: number;
}

export interface InsightSeries {
  id: string;
  title: string;
  description: string;
  unit: string;
  points: InsightPoint[];
}

export type HealthMeasurementDTO = {
    id?: string;
    patient_id: string;
    record_id?: string;
    unit_id: string;
    numeric_value: number;
    created_at?: Date;
};

export type MeasurementUnitDTO = {
    id?: string;
    unit_name: string;
    symbol: string;
    reference_range: number[];
};

export type MedicalRecordDTO = {
    id?: string;
    patient_id: string;
    file_name: string;
    file_url: string;
    record_type: 'lab_report' | 'prescription' | 'imaging' | 'other';
    ocr_extracted_text?: string;
    date_issued: Date;
    created_at?: Date;
};