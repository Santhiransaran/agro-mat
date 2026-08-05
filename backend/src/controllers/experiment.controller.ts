import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  createExperimentSchema,
  updateExperimentSchema,
} from "../validators/experiment.validator.js";

import {
  createExperiment,
  deleteExperiment,
  getExperimentById,
  getExperiments,
  updateExperiment,
} from "../services/experiment.service.js";

export async function createExperimentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validationResult = createExperimentSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten(),
      });
      return;
    }

    const experiment = await createExperiment(validationResult.data);

    res.status(201).json({
      success: true,
      message: "Experiment created successfully",
      data: experiment,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getExperimentsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters: {
      status?: string;
      cropType?: string;
      search?: string;
    } = {};

    if (typeof req.query.status === "string") {
      filters.status = req.query.status;
    }

    if (typeof req.query.cropType === "string") {
      filters.cropType = req.query.cropType;
    }

    if (typeof req.query.search === "string") {
      filters.search = req.query.search;
    }

    const experiments = await getExperiments(filters);

    res.status(200).json({
      success: true,
      count: experiments.length,
      data: experiments,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getExperimentByIdController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const experiment = await getExperimentById(id);

    res.status(200).json({
      success: true,
      data: experiment,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function updateExperimentController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const validationResult = updateExperimentSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten(),
      });
      return;
    }

    const experiment = await updateExperiment(
      id,
      validationResult.data
    );

    res.status(200).json({
      success: true,
      message: "Experiment updated successfully",
      data: experiment,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function deleteExperimentController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    await deleteExperiment(id);

    res.status(200).json({
      success: true,
      message: "Experiment deleted successfully",
    });
  } catch (error: unknown) {
    next(error);
  }
}