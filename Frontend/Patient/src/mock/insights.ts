import { InsightSeries } from '../types/models';

export const insights: InsightSeries[] = [
  {
    id: 'i1',
    title: 'HbA1c Trend (Last 6 Months)',
    description: 'Your HbA1c is gradually increasing. Consider lifestyle changes and follow-up with your doctor.',
    unit: '%',
    points: [
      { date: '2025-06-01', value: 5.8 },
      { date: '2025-07-01', value: 6.0 },
      { date: '2025-08-01', value: 6.2 },
      { date: '2025-09-01', value: 6.4 },
      { date: '2025-10-01', value: 6.6 },
      { date: '2025-11-01', value: 6.8 }
    ]
  },
  {
    id: 'i2',
    title: 'Total Cholesterol (mg/dL)',
    description: 'Your cholesterol has stayed near the upper limit of normal; discuss diet and exercise with your doctor.',
    unit: 'mg/dL',
    points: [
      { date: '2025-06-01', value: 190 },
      { date: '2025-07-01', value: 195 },
      { date: '2025-08-01', value: 200 },
      { date: '2025-09-01', value: 205 },
      { date: '2025-10-01', value: 210 },
      { date: '2025-11-01', value: 215 }
    ]
  }
];
