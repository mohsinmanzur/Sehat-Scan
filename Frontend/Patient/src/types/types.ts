export type Patient = {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    date_of_birth: Date;
    blood_group?: string;
    emergency_contacts?: Record<string, string>[];
    reward_points?: number;
    is_research_opt_in?: boolean;
    gender: 'male' | 'female' | 'other';
    created_at?: Date;
    updated_at?: Date;
};

export type Doctor = {
    id?: string;
    name: string;
    email: string;
    phone: string;
    gender: 'male' | 'female' | 'other';
    license_number: string;
    associated_hospital?: string;
    specialization?: string;
    is_verified?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export type MedicalDocument = {
    id?: string;
    patient: Patient;
    file_name: string;
    file_url: string;
    record_type: 'lab_report' | 'prescription' | 'imaging' | 'other';
    ocr_extracted_text?: string;
    date_issued?: Date;
    created_at?: Date;
    updated_at?: Date;
};

export type HealthMeasurement = {
    id?: string;
    document_id?: string;
    medical_document?: MedicalDocument;
    patient_id?: string;
    patient?: Patient;
    unit_id?: string;
    measurement_unit?: MeasurementUnit;
    numeric_value: number;
    numeric_value_2?: number;
    created_at?: Date;
    updated_at?: Date;
    special_conditions?: string[];
};

export type MeasurementUnit = {
    id?: string;
    unit_name: string;
    symbol: string;
    measurement_group: string;
    color_light?: string;
    color_dark?: string;
    icon_name?: string;
    has_secondary_value?: boolean;
};

export type ReferenceRange = {
    id?: string;
    measurement_unit: MeasurementUnit;
    min_value: number;
    max_value: number;
    min_value_2?: number;
    max_value_2?: number;
    target_gender?: 'male' | 'female' | 'other';
    min_age?: number;
    max_age?: number;
    special_conditions?: string[];
}

export type AIAnalysis = {
    id?: string;
    medical_document: MedicalDocument;
    anomaly_detected: boolean;
    suggested_text?: string;
    severity_score: number;
    created_at?: Date;
    updated_at?: Date;
}

export type AccessGrant = {
    id?: string;
    doctor?: Doctor;
    patient?: Patient;
    measurements?: HealthMeasurement[];
    measurement_ids?: string[];
    access_token?: string;
    permission: 'view_only' | 'emergency' | 'full_access';
    is_revoked?: boolean;
    expires_at?: Date;
}

export type ShareMeasurementDTO = {
    doctorEmail: string;
    measurement_ids?: string[];
    permission?: 'view_only' | 'emergency' | 'full_access';
    expires_at: Date;
}