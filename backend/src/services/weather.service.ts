import { Types } from "mongoose";

import { ExperimentModel } from "../models/experiment.model.js";
import { WeatherModel } from "../models/weather.model.js";

import type {
  CreateWeatherInput,
  UpdateWeatherInput,
} from "../validators/weather.validator.js";

interface WeatherFilters {
  experimentId?: string;
  source?: string;
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

export async function createWeatherRecord(
  data: CreateWeatherInput
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

  return WeatherModel.create(data);
}

export async function getWeatherRecords(
  filters: WeatherFilters = {}
) {
  const query: Record<string, unknown> = {};

  if (filters.experimentId) {
    validateObjectId(
      filters.experimentId,
      "experiment"
    );

    query.experimentId = filters.experimentId;
  }

  if (filters.source) {
    query.source = filters.source;
  }

  return WeatherModel.find(query)
    .populate(
      "experimentId",
      "experimentCode title cropType status"
    )
    .sort({
      recordedAt: -1,
    });
}

export async function getWeatherRecordById(
  id: string
) {
  validateObjectId(id, "weather record");

  const record = await WeatherModel.findById(id)
    .populate(
      "experimentId",
      "experimentCode title cropType status"
    );

  if (!record) {
    throw createNamedError(
      "NotFoundError",
      "Weather record not found"
    );
  }

  return record;
}

export async function updateWeatherRecord(
  id: string,
  data: UpdateWeatherInput
) {
  validateObjectId(id, "weather record");

  const record =
    await WeatherModel.findByIdAndUpdate(
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

  if (!record) {
    throw createNamedError(
      "NotFoundError",
      "Weather record not found"
    );
  }

  return record;
}

export async function deleteWeatherRecord(
  id: string
) {
  validateObjectId(id, "weather record");

  const record =
    await WeatherModel.findByIdAndDelete(id);

  if (!record) {
    throw createNamedError(
      "NotFoundError",
      "Weather record not found"
    );
  }

  return record;
}