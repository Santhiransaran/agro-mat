import { Types } from "mongoose";

import { CropPerformanceModel } from "../models/crop-performance.model.js";
import { ExperimentModel } from "../models/experiment.model.js";

const allowedMetrics = [
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
] as const;

export type ComparisonMetric =
  (typeof allowedMetrics)[number];

interface TreatmentComparisonInput {
  experimentId: string;
  metric: ComparisonMetric;
}

function createNamedError(
  name: string,
  message: string
): Error {
  const error = new Error(message);
  error.name = name;
  return error;
}

export function isAllowedMetric(
  metric: string
): metric is ComparisonMetric {
  return allowedMetrics.includes(
    metric as ComparisonMetric
  );
}

export async function compareTreatments({
  experimentId,
  metric,
}: TreatmentComparisonInput) {
  if (!Types.ObjectId.isValid(experimentId)) {
    throw createNamedError(
      "ValidationError",
      "Invalid experiment ID"
    );
  }

  const experimentExists =
    await ExperimentModel.exists({
      _id: experimentId,
    });

  if (!experimentExists) {
    throw createNamedError(
      "NotFoundError",
      "Experiment not found"
    );
  }

  const result =
    await CropPerformanceModel.aggregate([
      {
        $match: {
          experimentId: new Types.ObjectId(
            experimentId
          ),
          [metric]: {
            $exists: true,
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: "$treatmentId",

          sampleCount: {
            $sum: 1,
          },

          mean: {
            $avg: `$${metric}`,
          },

          minimum: {
            $min: `$${metric}`,
          },

          maximum: {
            $max: `$${metric}`,
          },

          standardDeviation: {
            $stdDevSamp: `$${metric}`,
          },
        },
      },
      {
        $lookup: {
          from: "treatments",
          localField: "_id",
          foreignField: "_id",
          as: "treatment",
        },
      },
      {
        $unwind: "$treatment",
      },
      {
        $project: {
          _id: 0,

          treatmentId: "$_id",

          treatmentCode:
            "$treatment.treatmentCode",

          treatmentName: "$treatment.name",

          isControl: "$treatment.isControl",

          sampleCount: 1,

          mean: {
            $round: ["$mean", 2],
          },

          minimum: {
            $round: ["$minimum", 2],
          },

          maximum: {
            $round: ["$maximum", 2],
          },

          standardDeviation: {
            $round: [
              {
                $ifNull: [
                  "$standardDeviation",
                  0,
                ],
              },
              2,
            ],
          },
        },
      },
      {
        $sort: {
          treatmentCode: 1,
        },
      },
    ]);

  return result;
}