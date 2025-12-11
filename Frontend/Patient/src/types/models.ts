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
