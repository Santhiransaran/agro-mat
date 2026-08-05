export type ExperimentStatus =
  | "planned"
  | "active"
  | "completed"
  | "cancelled";

export interface ExperimentLocation {
  siteName: string;
  district?: string;
  latitude?: number;
  longitude?: number;
}

export interface Experiment {
  _id: string;
  experimentCode: string;
  title: string;
  description?: string;
  cropType: string;
  cropVariety?: string;
  location: ExperimentLocation;
  startDate: string;
  endDate?: string;
  objective?: string;
  methodology?: string;
  status: ExperimentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentsResponse {
  success: boolean;
  count: number;
  data: Experiment[];
}