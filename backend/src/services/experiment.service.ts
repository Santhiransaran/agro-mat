import { Types } from "mongoose";

import { ExperimentModel } from "../models/experiment.model.js";

import type {
  CreateExperimentInput,
  UpdateExperimentInput,
} from "../validators/experiment.validator.js";

interface ExperimentFilters {
  status?: string;
  cropType?: string;
  search?: string;
}

export async function createExperiment(
  data: CreateExperimentInput
) {
  const existingExperiment = await ExperimentModel.findOne({
    experimentCode: data.experimentCode.toUpperCase(),
  });

  if (existingExperiment) {
    const error = new Error("Experiment code already exists");
    error.name = "ConflictError";
    throw error;
  }

  return ExperimentModel.create(data);
}

export async function getExperiments(
  filters: ExperimentFilters = {}
) {
  const query: Record<string, unknown> = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.cropType) {
    query.cropType = filters.cropType;
  }

  if (filters.search) {
    query.$text = {
      $search: filters.search,
    };
  }

  return ExperimentModel.find(query).sort({
    createdAt: -1,
  });
}

export async function getExperimentById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid experiment ID");
    error.name = "ValidationError";
    throw error;
  }

  const experiment = await ExperimentModel.findById(id);

  if (!experiment) {
    const error = new Error("Experiment not found");
    error.name = "NotFoundError";
    throw error;
  }

  return experiment;
}

export async function updateExperiment(
  id: string,
  data: UpdateExperimentInput
) {
  if (!Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid experiment ID");
    error.name = "ValidationError";
    throw error;
  }

  const experiment = await ExperimentModel.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!experiment) {
    const error = new Error("Experiment not found");
    error.name = "NotFoundError";
    throw error;
  }

  return experiment;
}

export async function deleteExperiment(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid experiment ID");
    error.name = "ValidationError";
    throw error;
  }

  const experiment = await ExperimentModel.findByIdAndDelete(id);

  if (!experiment) {
    const error = new Error("Experiment not found");
    error.name = "NotFoundError";
    throw error;
  }

  return experiment;
}