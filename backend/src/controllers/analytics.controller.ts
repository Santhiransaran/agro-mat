import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  compareTreatments,
  isAllowedMetric,
} from "../services/analytics.service.js";

export async function treatmentComparisonController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const experimentId =
      typeof req.query.experimentId === "string"
        ? req.query.experimentId
        : undefined;

    const metric =
      typeof req.query.metric === "string"
        ? req.query.metric
        : undefined;

    if (!experimentId) {
      res.status(400).json({
        success: false,
        message: "experimentId query parameter is required",
      });

      return;
    }

    if (!metric) {
      res.status(400).json({
        success: false,
        message: "metric query parameter is required",
      });

      return;
    }

    if (!isAllowedMetric(metric)) {
      res.status(400).json({
        success: false,
        message: "Unsupported comparison metric",
        allowedMetrics: [
          "plantHeightCm",
          "leafCount",
          "stemDiameterMm",
          "canopyWidthCm",
          "floweringPlantCount",
          "fruitCount",
          "freshBiomassG",
          "dryBiomassG",
          "yieldKg",
          "yieldPerHectareKg",
          "survivalRatePercent",
        ],
      });

      return;
    }

    const data = await compareTreatments({
      experimentId,
      metric,
    });

    res.status(200).json({
      success: true,
      experimentId,
      metric,
      count: data.length,
      data,
    });
  } catch (error: unknown) {
    next(error);
  }
}