export type MeasurementUnitDTO = {
    id?: string;
    unit_name: string;
    symbol: string;
    measurement_group: string;
    color_light?: string;
    color_dark?: string;
    icon_name?: string;
    has_secondary_value?: boolean;
};

export type HealthMeasurementDTO = {
    id?: string;
    document_id?: string | null;
    patient_id: string;
    unit_id: string;
    numeric_value: number;
    numeric_value_2?: number;
    special_conditions?: string[];
    created_at?: Date;
    updated_at?: Date;
};

export type ReferenceRangeDTO = {
    id?: string;
    unit_id: string;
    min_value: number;
    max_value: number;
    target_gender?: 'male' | 'female' | 'other';
    min_age?: number;
    max_age?: number;
    special_conditions?: string[];
};
