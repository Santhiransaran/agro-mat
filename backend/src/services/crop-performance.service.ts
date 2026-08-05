import { Types } from "mongoose";

import { CropPerformanceModel } from "../models/crop-performance.model.js";
import { ExperimentModel } from "../models/experiment.model.js";
import { PlotModel } from "../models/plot.model.js";
import { TreatmentModel } from "../models/treatment.model.js";

import type {
  CreateCropPerformanceInput,
  UpdateCropPerformanceInput,
} from "../validators/crop-performance.validator.js";

interface CropPerformanceFilters {
  experimentId?: string;
  treatmentId?: string;
  plotId?: string;
}

function createNamedError(
  name: string,
  message: string
): Error {
  const error = new Error(message);
  error.name = name;
  return error;
}

function validateObjectId(
  id: string,
  label: string
): void {
  if (!Types.ObjectId.isValid(id)) {
    throw createNamedError(
      "ValidationError",
      `Invalid ${label} ID`
    );
  }
}

export async function createCropPerformance(
  data: CreateCropPerformanceInput
) {
  validateObjectId(data.experimentId, "experiment");
  validateObjectId(data.treatmentId, "treatment");
  validateObjectId(data.plotId, "plot");

  const experimentExists = await ExperimentModel.exists({
    _id: data.experimentId,
  });

  if (!experimentExists) {
    throw createNamedError(
      "NotFoundError",
      "Experiment not found"
    );
  }

  const treatment = await TreatmentModel.findById(
    data.treatmentId
  );

  if (!treatment) {
    throw createNamedError(
      "NotFoundError",
      "Treatment not found"
    );
  }

  if (
    treatment.experimentId.toString() !==
    data.experimentId
  ) {
    throw createNamedError(
      "ValidationError",
      "Treatment does not belong to this experiment"
    );
  }

  const plot = await PlotModel.findById(data.plotId);

  if (!plot) {
    throw createNamedError(
      "NotFoundError",
      "Plot not found"
    );
  }

  if (
    plot.experimentId.toString() !== data.experimentId
  ) {
    throw createNamedError(
      "ValidationError",
      "Plot does not belong to this experiment"
    );
  }

  if (
    plot.treatmentId.toString() !== data.treatmentId
  ) {
    throw createNamedError(
      "ValidationError",
      "Plot does not belong to this treatment"
    );
  }

  return CropPerformanceModel.create(data);
}

export async function getCropPerformanceRecords(
  filters: CropPerformanceFilters = {}
) {
  const query: Record<string, unknown> = {};

  if (filters.experimentId) {
    validateObjectId(filters.experimentId, "experiment");
    query.experimentId = filters.experimentId;
  }

  if (filters.treatmentId) {
    validateObjectId(filters.treatmentId, "treatment");
    query.treatmentId = filters.treatmentId;
  }

  if (filters.plotId) {
    validateObjectId(filters.plotId, "plot");
    query.plotId = filters.plotId;
  }

  return CropPerformanceModel.find(query)
    .populate(
      "experimentId",
      "experimentCode title cropType status"
    )
    .populate(
      "treatmentId",
      "treatmentCode name isControl agroMatType"
    )
    .populate(
      "plotId",
      "plotCode replicateNumber areaSquareMeters"
    )
    .sort({
      measurementDate: -1,
    });
}

export async function getCropPerformanceById(
  id: string
) {
  validateObjectId(id, "crop performance");

  const record = await CropPerformanceModel.findById(id)
    .populate(
      "experimentId",
      "experimentCode title cropType status"
    )
    .populate(
      "treatmentId",
      "treatmentCode name isControl agroMatType"
    )
    .populate(
      "plotId",
      "plotCode replicateNumber areaSquareMeters"
    );

  if (!record) {
    throw createNamedError(
      "NotFoundError",
      "Crop performance record not found"
    );
  }

  return record;
}

export async function updateCropPerformance(
  id: string,
  data: UpdateCropPerformanceInput
) {
  validateObjectId(id, "crop performance");

  const record =
    await CropPerformanceModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate(
        "experimentId",
        "experimentCode title cropType status"
      )
      .populate(
        "treatmentId",
        "treatmentCode name isControl agroMatType"
      )
      .populate(
        "plotId",
        "plotCode replicateNumber areaSquareMeters"
      );

  if (!record) {
    throw createNamedError(
      "NotFoundError",
      "Crop performance record not found"
    );
  }

  return record;
}

export async function deleteCropPerformance(
  id: string
) {
  validateObjectId(id, "crop performance");

  const record =
    await CropPerformanceModel.findByIdAndDelete(id);

  if (!record) {
    throw createNamedError(
      "NotFoundError",
      "Crop performance record not found"
    );
  }

  return record;
}
