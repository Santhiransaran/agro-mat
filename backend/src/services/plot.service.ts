import { Types } from "mongoose";

import { ExperimentModel } from "../models/experiment.model.js";
import { PlotModel } from "../models/plot.model.js";
import { TreatmentModel } from "../models/treatment.model.js";

import type {
  CreatePlotInput,
  UpdatePlotInput,
} from "../validators/plot.validator.js";

interface PlotFilters {
  experimentId?: string;
  treatmentId?: string;
}

function createNamedError(
  name: string,
  message: string
): Error {
  const error = new Error(message);
  error.name = name;
  return error;
}

export async function createPlot(
  data: CreatePlotInput
) {
  if (!Types.ObjectId.isValid(data.experimentId)) {
    throw createNamedError(
      "ValidationError",
      "Invalid experiment ID"
    );
  }

  if (!Types.ObjectId.isValid(data.treatmentId)) {
    throw createNamedError(
      "ValidationError",
      "Invalid treatment ID"
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

  const duplicatePlot = await PlotModel.findOne({
    experimentId: data.experimentId,
    plotCode: data.plotCode.toUpperCase(),
  });

  if (duplicatePlot) {
    throw createNamedError(
      "ConflictError",
      "Plot code already exists for this experiment"
    );
  }

  return PlotModel.create(data);
}

export async function getPlots(
  filters: PlotFilters = {}
) {
  const query: Record<string, unknown> = {};

  if (filters.experimentId) {
    if (
      !Types.ObjectId.isValid(filters.experimentId)
    ) {
      throw createNamedError(
        "ValidationError",
        "Invalid experiment ID"
      );
    }

    query.experimentId = filters.experimentId;
  }

  if (filters.treatmentId) {
    if (
      !Types.ObjectId.isValid(filters.treatmentId)
    ) {
      throw createNamedError(
        "ValidationError",
        "Invalid treatment ID"
      );
    }

    query.treatmentId = filters.treatmentId;
  }

  return PlotModel.find(query)
    .populate(
      "experimentId",
      "experimentCode title cropType status"
    )
    .populate(
      "treatmentId",
      "treatmentCode name isControl agroMatType"
    )
    .sort({
      plotCode: 1,
    });
}

export async function getPlotById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw createNamedError(
      "ValidationError",
      "Invalid plot ID"
    );
  }

  const plot = await PlotModel.findById(id)
    .populate(
      "experimentId",
      "experimentCode title cropType status"
    )
    .populate(
      "treatmentId",
      "treatmentCode name isControl agroMatType"
    );

  if (!plot) {
    throw createNamedError(
      "NotFoundError",
      "Plot not found"
    );
  }

  return plot;
}

export async function updatePlot(
  id: string,
  data: UpdatePlotInput
) {
  if (!Types.ObjectId.isValid(id)) {
    throw createNamedError(
      "ValidationError",
      "Invalid plot ID"
    );
  }

  const plot = await PlotModel.findByIdAndUpdate(
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
    );

  if (!plot) {
    throw createNamedError(
      "NotFoundError",
      "Plot not found"
    );
  }

  return plot;
}

export async function deletePlot(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw createNamedError(
      "ValidationError",
      "Invalid plot ID"
    );
  }

  const plot = await PlotModel.findByIdAndDelete(id);

  if (!plot) {
    throw createNamedError(
      "NotFoundError",
      "Plot not found"
    );
  }

  return plot;
}