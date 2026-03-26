import { Alert } from '../types/models';

export const alerts: Alert[] = [
  {
    id: 'a1',
    title: 'Elevated Blood Pressure',
    description: 'Your last blood pressure reading was higher than the recommended range. Consider consulting your doctor.',
    date: '2025-11-10',
    severity: 'high'
  },
  {
    id: 'a2',
    title: 'Rising HbA1c Trend',
    description: 'Your HbA1c levels have gradually increased over the last 6 months.',
    date: '2025-10-28',
    severity: 'medium'
  }
];
