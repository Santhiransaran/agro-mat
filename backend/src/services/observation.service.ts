import { Types } from "mongoose";

import { ExperimentModel } from "../models/experiment.model.js";
import { ObservationModel } from "../models/observation.model.js";
import { PlotModel } from "../models/plot.model.js";
import { TreatmentModel } from "../models/treatment.model.js";

import type {
  CreateObservationInput,
  UpdateObservationInput,
} from "../validators/observation.validator.js";

interface ObservationFilters {
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

export async function createObservation(
  data: CreateObservationInput
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

  return ObservationModel.create(data);
}

export async function getObservations(
  filters: ObservationFilters = {}
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

  return ObservationModel.find(query)
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
      observationDate: -1,
    });
}

export async function getObservationById(id: string) {
  validateObjectId(id, "observation");

  const observation = await ObservationModel.findById(id)
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

  if (!observation) {
    throw createNamedError(
      "NotFoundError",
      "Observation not found"
    );
  }

  return observation;
}

export async function updateObservation(
  id: string,
  data: UpdateObservationInput
) {
  validateObjectId(id, "observation");

  const observation =
    await ObservationModel.findByIdAndUpdate(
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

  if (!observation) {
    throw createNamedError(
      "NotFoundError",
      "Observation not found"
    );
  }

  return observation;
}

export async function deleteObservation(id: string) {
  validateObjectId(id, "observation");

  const observation =
    await ObservationModel.findByIdAndDelete(id);

  if (!observation) {
    throw createNamedError(
      "NotFoundError",
      "Observation not found"
    );
  }

  return observation;
}