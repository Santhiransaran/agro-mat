export interface Device {
  _id: string;
  deviceId: string;
  name: string;
  location?: string;
  status: "online" | "offline";
  lastSeen?: string;
  firmwareVersion?: string;
}

export interface Crop {
  _id: string;
  name: string;
  variety?: string;
  plantingDate: string;
  expectedHarvestDate?: string;
  actualHarvestDate?: string;
  farmArea: number;
  areaUnit: "acre" | "hectare" | "square_meter";
  status: "planned" | "active" | "completed";
}

export interface SensorReading {
  _id: string;

  recordedAt: string;

  nitrogen: number;
  phosphorus: number;
  potassium: number;

  ph: number;
  ec: number;

  soilMoisture: number;
  soilTemperature?: number;

  airTemperature: number;
  humidity: number;
}

export type ParameterStatus =
  | "low"
  | "normal"
  | "high";

export interface ParameterAnalysis {
  parameter: string;
  value: number;
  min: number;
  max: number;
  status: ParameterStatus;
  message: string;
}

export interface Recommendation {
  crop: string;

  overallStatus:
    | "good"
    | "attention"
    | "critical";

  nutrients: {
    nitrogen: ParameterAnalysis;
    phosphorus: ParameterAnalysis;
    potassium: ParameterAnalysis;
  };

  ph: ParameterAnalysis;
  ec: ParameterAnalysis;
  irrigation: ParameterAnalysis;

  generatedAt: string;
}

export interface Alert {
  _id: string;

  type: string;

  severity:
    | "info"
    | "warning"
    | "critical";

  message: string;

  isResolved: boolean;

  resolvedAt?: string;

  createdAt: string;
}