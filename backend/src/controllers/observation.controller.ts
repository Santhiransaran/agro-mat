import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  createObservationSchema,
  updateObservationSchema,
} from "../validators/observation.validator.js";

import {
  createObservation,
  deleteObservation,
  getObservationById,
  getObservations,
  updateObservation,
} from "../services/observation.service.js";

export async function createObservationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validationResult =
      createObservationSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten(),
      });

      return;
    }

    const observation = await createObservation(
      validationResult.data
    );

    res.status(201).json({
      success: true,
      message: "Observation created successfully",
      data: observation,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getObservationsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters: {
      experimentId?: string;
      treatmentId?: string;
      plotId?: string;
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

    if (typeof req.query.plotId === "string") {
      filters.plotId = req.query.plotId;
    }

    const observations =
      await getObservations(filters);

    res.status(200).json({
      success: true,
      count: observations.length,
      data: observations,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getObservationByIdController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const observation =
      await getObservationById(req.params.id);

    res.status(200).json({
      success: true,
      data: observation,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function updateObservationController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validationResult =
      updateObservationSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten(),
      });

      return;
    }

    const observation = await updateObservation(
      req.params.id,
      validationResult.data
    );

    res.status(200).json({
      success: true,
      message: "Observation updated successfully",
      data: observation,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function deleteObservationController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await deleteObservation(req.params.id);

    res.status(200).json({
      success: true,
      message: "Observation deleted successfully",
    });
  } catch (error: unknown) {
    next(error);
  }
}