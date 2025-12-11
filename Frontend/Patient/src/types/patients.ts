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

export interface PatientProfile {
    id: string;
    name: string;
    email: string;
    condition: ConditionType;
    yearsOfData: number; // 1–2
    bpSummary?: VitalSummary;
    sugarSummary?: VitalSummary;
    heartSummary?: VitalSummary;
}
