import { Types } from "mongoose";

import { ExperimentModel } from "../models/experiment.model.js";
import { TreatmentModel } from "../models/treatment.model.js";

import type {
  CreateTreatmentInput,
  UpdateTreatmentInput,
} from "../validators/treatment.validator.js";

interface TreatmentFilters {
  experimentId?: string;
  isControl?: boolean;
}

function createNamedError(
  name: string,
  message: string
): Error {
  const error = new Error(message);
  error.name = name;
  return error;
}

export async function createTreatment(
  data: CreateTreatmentInput
) {
  if (!Types.ObjectId.isValid(data.experimentId)) {
    throw createNamedError(
      "ValidationError",
      "Invalid experiment ID"
    );
  }

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

  const duplicateTreatment =
    await TreatmentModel.findOne({
      experimentId: data.experimentId,
      treatmentCode: data.treatmentCode.toUpperCase(),
    });

  if (duplicateTreatment) {
    throw createNamedError(
      "ConflictError",
      "Treatment code already exists for this experiment"
    );
  }

  return TreatmentModel.create(data);
}

export async function getTreatments(
  filters: TreatmentFilters = {}
) {
  const query: Record<string, unknown> = {};

  if (filters.experimentId) {
    if (
      !Types.ObjectId.isValid(
        filters.experimentId
      )
    ) {
      throw createNamedError(
        "ValidationError",
        "Invalid experiment ID"
      );
    }

    query.experimentId =
      filters.experimentId;
  }

  if (
    typeof filters.isControl === "boolean"
  ) {
    query.isControl = filters.isControl;
  }

  return TreatmentModel.find(query)
    .populate(
      "experimentId",
      "experimentCode title cropType status"
    )
    .sort({
      createdAt: -1,
    });
}

export async function getTreatmentById(
  id: string
) {
  if (!Types.ObjectId.isValid(id)) {
    throw createNamedError(
      "ValidationError",
      "Invalid treatment ID"
    );
  }

  const treatment =
    await TreatmentModel.findById(id).populate(
      "experimentId",
      "experimentCode title cropType status"
    );

  if (!treatment) {
    throw createNamedError(
      "NotFoundError",
      "Treatment not found"
    );
  }

  return treatment;
}

export async function updateTreatment(
  id: string,
  data: UpdateTreatmentInput
) {
  if (!Types.ObjectId.isValid(id)) {
    throw createNamedError(
      "ValidationError",
      "Invalid treatment ID"
    );
  }

  const treatment =
    await TreatmentModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
      }
    ).populate(
      "experimentId",
      "experimentCode title cropType status"
    );

  if (!treatment) {
    throw createNamedError(
      "NotFoundError",
      "Treatment not found"
    );
  }

  return treatment;
}

export async function deleteTreatment(
  id: string
) {
  if (!Types.ObjectId.isValid(id)) {
    throw createNamedError(
      "ValidationError",
      "Invalid treatment ID"
    );
  }

  const treatment =
    await TreatmentModel.findByIdAndDelete(id);

  if (!treatment) {
    throw createNamedError(
      "NotFoundError",
      "Treatment not found"
    );
  }

  return treatment;
}