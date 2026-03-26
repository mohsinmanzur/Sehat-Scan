// src/mock/patients.ts
import { PatientProfile, ConditionType, RiskLevel, Trend } from '../types/patients';

const firstNames = ['Ali', 'Sara', 'Ahmed', 'Fatima', 'Usman', 'Zara', 'Bilal', 'Ayesha', 'Hamza', 'Noor'];
const lastNames = ['Khan', 'Ahmed', 'Hussain', 'Malik', 'Raza', 'Shaikh', 'Qureshi', 'Siddiqui', 'Janjua', 'Ansari'];

const conditions: ConditionType[] = ['diabetes', 'hypertension', 'both'];
const riskLevels: RiskLevel[] = ['normal', 'borderline', 'high'];
const trends: Trend[] = ['improving', 'stable', 'worsening'];

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export const patients: PatientProfile[] = Array.from({ length: 50 }).map((_, idx) => {
    const first = randomItem(firstNames);
    const last = randomItem(lastNames);
    const condition = randomItem(conditions);
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${idx + 1}@example.com`;

    const yearsOfData = Math.random() > 0.5 ? 1 : 2;

    const bpSummary =
        condition === 'hypertension' || condition === 'both'
            ? {
                lastValue: 100 + Math.round(Math.random() * 60),
                unit: 'mmHg',
                trend: randomItem(trends),
                riskLevel: randomItem(riskLevels),
            }
            : undefined;

    const sugarSummary =
        condition === 'diabetes' || condition === 'both'
            ? {
                lastValue: 80 + Math.round(Math.random() * 120),
                unit: 'mg/dL',
                trend: randomItem(trends),
                riskLevel: randomItem(riskLevels),
            }
            : undefined;

    const heartSummary: PatientProfile['heartSummary'] = {
        lastValue: 60 + Math.round(Math.random() * 50),
        unit: 'bpm',
        trend: randomItem(trends),
        riskLevel: randomItem(riskLevels),
    };

    return {
        id: `patient-${idx + 1}`,
        name: `${first} ${last}`,
        email,
        condition,
        yearsOfData,
        bpSummary,
        sugarSummary,
        heartSummary,
    };
});
