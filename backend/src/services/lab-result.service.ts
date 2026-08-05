import { Types } from "mongoose";

import { ExperimentModel } from "../models/experiment.model.js";
import { LabResultModel } from "../models/lab-result.model.js";
import { PlotModel } from "../models/plot.model.js";
import { TreatmentModel } from "../models/treatment.model.js";

import type {
  CreateLabResultInput,
  UpdateLabResultInput,
} from "../validators/lab-result.validator.js";

interface LabResultFilters {
  experimentId?: string;
  treatmentId?: string;
  plotId?: string;
  sampleType?: string;
  parameter?: string;
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

export async function createLabResult(
  data: CreateLabResultInput
) {
  validateObjectId(data.experimentId, "experiment");

  const experimentExists =
    await ExperimentModel.exists({
      _id: data.experimentId,
    });

  if (!experimentExists) {
    throw createNamedError(
      "NotFoundError",
      "Experiment not found"
    );
  }

  if (data.treatmentId) {
    validateObjectId(data.treatmentId, "treatment");

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
  }

  if (data.plotId) {
    validateObjectId(data.plotId, "plot");

    if (!data.treatmentId) {
      throw createNamedError(
        "ValidationError",
        "Treatment ID is required when plot ID is provided"
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
      plot.experimentId.toString() !==
      data.experimentId
    ) {
      throw createNamedError(
        "ValidationError",
        "Plot does not belong to this experiment"
      );
    }

    if (
      plot.treatmentId.toString() !==
      data.treatmentId
    ) {
      throw createNamedError(
        "ValidationError",
        "Plot does not belong to this treatment"
      );
    }
  }

  return LabResultModel.create(data);
}

export async function getLabResults(
  filters: LabResultFilters = {}
) {
  const query: Record<string, unknown> = {};

  if (filters.experimentId) {
    validateObjectId(
      filters.experimentId,
      "experiment"
    );
    query.experimentId = filters.experimentId;
  }

  if (filters.treatmentId) {
    validateObjectId(
      filters.treatmentId,
      "treatment"
    );
    query.treatmentId = filters.treatmentId;
  }

  if (filters.plotId) {
    validateObjectId(filters.plotId, "plot");
    query.plotId = filters.plotId;
  }

  if (filters.sampleType) {
    query.sampleType = filters.sampleType;
  }

  if (filters.parameter) {
    query.parameter = {
      $regex: filters.parameter,
      $options: "i",
    };
  }

  return LabResultModel.find(query)
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
      collectionDate: -1,
    });
}

export async function getLabResultById(
  id: string
) {
  validateObjectId(id, "lab result");

  const result = await LabResultModel.findById(id)
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

  if (!result) {
    throw createNamedError(
      "NotFoundError",
      "Lab result not found"
    );
  }

  return result;
}

export async function updateLabResult(
  id: string,
  data: UpdateLabResultInput
) {
  validateObjectId(id, "lab result");

  const result =
    await LabResultModel.findByIdAndUpdate(
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

  if (!result) {
    throw createNamedError(
      "NotFoundError",
      "Lab result not found"
    );
  }

  return result;
}

export async function deleteLabResult(
  id: string
) {
  validateObjectId(id, "lab result");

  const result =
    await LabResultModel.findByIdAndDelete(id);

  if (!result) {
    throw createNamedError(
      "NotFoundError",
      "Lab result not found"
    );
  }

  return result;
}