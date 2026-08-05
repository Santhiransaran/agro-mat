import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  createPlotSchema,
  updatePlotSchema,
} from "../validators/plot.validator.js";

import {
  createPlot,
  deletePlot,
  getPlotById,
  getPlots,
  updatePlot,
} from "../services/plot.service.js";

export async function createPlotController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validationResult =
      createPlotSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten(),
      });

      return;
    }

    const plot = await createPlot(
      validationResult.data
    );

    res.status(201).json({
      success: true,
      message: "Plot created successfully",
      data: plot,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getPlotsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters: {
      experimentId?: string;
      treatmentId?: string;
    } = {};

    if (
      typeof req.query.experimentId === "string"
    ) {
      filters.experimentId =
        req.query.experimentId;
    }

    if (
      typeof req.query.treatmentId === "string"
    ) {
      filters.treatmentId =
        req.query.treatmentId;
    }

    const plots = await getPlots(filters);

    res.status(200).json({
      success: true,
      count: plots.length,
      data: plots,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getPlotByIdController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const plot = await getPlotById(req.params.id);

    res.status(200).json({
      success: true,
      data: plot,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function updatePlotController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validationResult =
      updatePlotSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten(),
      });

      return;
    }

    const plot = await updatePlot(
      req.params.id,
      validationResult.data
    );

    res.status(200).json({
      success: true,
      message: "Plot updated successfully",
      data: plot,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function deletePlotController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await deletePlot(req.params.id);

    res.status(200).json({
      success: true,
      message: "Plot deleted successfully",
    });
  } catch (error: unknown) {
    next(error);
  }
}