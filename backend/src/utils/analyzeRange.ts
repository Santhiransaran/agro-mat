import {
  ParameterAnalysis,
} from "../types/recommendation.types.js";

interface AnalyzeRangeOptions {
  parameter: string;

  value: number;

  min: number;

  max: number;

  lowMessage: string;

  normalMessage: string;

  highMessage: string;
}

export const analyzeRange = (
  options: AnalyzeRangeOptions
): ParameterAnalysis => {
  const {
    parameter,
    value,
    min,
    max,
    lowMessage,
    normalMessage,
    highMessage,
  } = options;

  if (value < min) {
    return {
      parameter,
      value,
      min,
      max,
      status: "low",
      message: lowMessage,
    };
  }

  if (value > max) {
    return {
      parameter,
      value,
      min,
      max,
      status: "high",
      message: highMessage,
    };
  }

  return {
    parameter,
    value,
    min,
    max,
    status: "normal",
    message: normalMessage,
  };
};