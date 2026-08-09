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

export interface RecommendationResult {
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

  generatedAt: Date;
}