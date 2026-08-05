import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  createTreatmentSchema,
  updateTreatmentSchema,
} from "../validators/treatment.validator.js";

import {
  createTreatment,
  deleteTreatment,
  getTreatmentById,
  getTreatments,
  updateTreatment,
} from "../services/treatment.service.js";

export async function createTreatmentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validationResult =
      createTreatmentSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          validationResult.error.flatten(),
      });

      return;
    }

    const treatment = await createTreatment(
      validationResult.data
    );

    res.status(201).json({
      success: true,
      message:
        "Treatment created successfully",
      data: treatment,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getTreatmentsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters: {
      experimentId?: string;
      isControl?: boolean;
    } = {};

    if (
      typeof req.query.experimentId ===
      "string"
    ) {
      filters.experimentId =
        req.query.experimentId;
    }

    if (
      typeof req.query.isControl ===
      "string"
    ) {
      filters.isControl =
        req.query.isControl === "true";
    }

    const treatments =
      await getTreatments(filters);

    res.status(200).json({
      success: true,
      count: treatments.length,
      data: treatments,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getTreatmentByIdController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const treatment =
      await getTreatmentById(req.params.id);

    res.status(200).json({
      success: true,
      data: treatment,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function updateTreatmentController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validationResult =
      updateTreatmentSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          validationResult.error.flatten(),
      });

      return;
    }

    const treatment =
      await updateTreatment(
        req.params.id,
        validationResult.data
      );

    res.status(200).json({
      success: true,
      message:
        "Treatment updated successfully",
      data: treatment,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function deleteTreatmentController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await deleteTreatment(req.params.id);

    res.status(200).json({
      success: true,
      message:
        "Treatment deleted successfully",
    });
  } catch (error: unknown) {
    next(error);
  }
}