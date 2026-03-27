// src/types/patient.ts
export type ConditionType = 'diabetes' | 'hypertension' | 'both';
export type RiskLevel = 'normal' | 'borderline' | 'high';
export type Trend = 'improving' | 'stable' | 'worsening';

export interface VitalSummary {
    lastValue: number;
    unit: string;
    trend: Trend;
    riskLevel: RiskLevel;
}

export type PatientDTO = {
    id?: string;
    email: string;
    name: string;
    date_of_birth: Date;
    blood_group?: string;
    emergency_contact?: string;
    reward_points?: number;
    is_research_opt_in?: boolean;
    created_at?: Date;
    updated_at?: Date;
};