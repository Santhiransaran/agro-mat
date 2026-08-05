import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  createLabResultSchema,
  updateLabResultSchema,
} from "../validators/lab-result.validator.js";

import {
  createLabResult,
  deleteLabResult,
  getLabResultById,
  getLabResults,
  updateLabResult,
} from "../services/lab-result.service.js";

export async function createLabResultController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result =
      createLabResultSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });

      return;
    }

    const labResult = await createLabResult(
      result.data
    );

    res.status(201).json({
      success: true,
      message: "Lab result created successfully",
      data: labResult,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getLabResultsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters: {
      experimentId?: string;
      treatmentId?: string;
      plotId?: string;
      sampleType?: string;
      parameter?: string;
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

    if (
      typeof req.query.sampleType === "string"
    ) {
      filters.sampleType =
        req.query.sampleType;
    }

    if (
      typeof req.query.parameter === "string"
    ) {
      filters.parameter =
        req.query.parameter;
    }

    const labResults = await getLabResults(
      filters
    );

    res.status(200).json({
      success: true,
      count: labResults.length,
      data: labResults,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getLabResultByIdController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getLabResultById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function updateLabResultController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation =
      updateLabResultSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });

      return;
    }

    const result = await updateLabResult(
      req.params.id,
      validation.data
    );

    res.status(200).json({
      success: true,
      message: "Lab result updated successfully",
      data: result,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function deleteLabResultController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await deleteLabResult(req.params.id);

    res.status(200).json({
      success: true,
      message: "Lab result deleted successfully",
    });
  } catch (error: unknown) {
    next(error);
  }
}