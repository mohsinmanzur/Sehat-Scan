// src/mock/reports.ts
import { patients } from '@mock/patients';

export type ReportRisk = 'normal' | 'borderline' | 'high';

export interface Report {
  id: string;
  patientId: string;
  title: string;
  date: string; // ISO date string
  type: 'bp' | 'sugar' | 'other';
  risk: ReportRisk;
  source: 'scanned' | 'manual';
  values: number[]; // for graph
  imageUri?: string;
}

const risks: ReportRisk[] = ['normal', 'borderline', 'high'];
const sources: Array<'scanned' | 'manual'> = ['scanned', 'manual'];
const types: Array<'bp' | 'sugar' | 'other'> = ['bp', 'sugar', 'other'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 2 years worth of months, 2 dates per month
const monthDates: string[] = [
  '2023-01-05', '2023-01-21',
  '2023-02-08', '2023-02-24',
  '2023-03-07', '2023-03-22',
  '2023-04-04', '2023-04-19',
  '2023-05-03', '2023-05-18',
  '2023-06-06', '2023-06-20',
  '2023-07-05', '2023-07-19',
  '2023-08-02', '2023-08-17',
  '2023-09-06', '2023-09-21',
  '2023-10-05', '2023-10-19',
  '2023-11-07', '2023-11-22',
  '2023-12-05', '2023-12-19',
  '2024-01-06', '2024-01-20',
  '2024-02-05', '2024-02-19',
  '2024-03-06', '2024-03-20',
  '2024-04-04', '2024-04-18',
  '2024-05-06', '2024-05-20',
  '2024-06-04', '2024-06-18',
  '2024-07-03', '2024-07-17',
  '2024-08-05', '2024-08-19',
  '2024-09-04', '2024-09-18',
  '2024-10-03', '2024-10-17',
  '2024-11-05', '2024-11-19',
  '2024-12-04', '2024-12-18',
];

export const reports: Report[] = (() => {
  const result: Report[] = [];
  let idCounter = 1;

  patients.forEach((p, pIndex) => {
    monthDates.forEach((date) => {
      // more dense data; only skip 20% of dates
      if (Math.random() < 0.2) return;

      const type = randomItem(types);
      const risk = randomItem(risks);
      const source = randomItem(sources);

      const values = Array.from({ length: 8 }).map(() => {
        if (type === 'bp') return 100 + Math.round(Math.random() * 55);
        if (type === 'sugar') return 75 + Math.round(Math.random() * 130);
        return 1 + Math.round(Math.random() * 100);
      });

      const baseTitle =
        type === 'bp'
          ? 'Blood Pressure Check'
          : type === 'sugar'
            ? 'Blood Sugar Test'
            : 'Lab Test';

      result.push({
        id: `${idCounter++}`,
        patientId: p.id,
        title: `${baseTitle} – Visit ${pIndex + 1}`,
        date,
        type,
        risk,
        source,
        values,
        imageUri: undefined,
      });
    });
  });

  return result;
})();
