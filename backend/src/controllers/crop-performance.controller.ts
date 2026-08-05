import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  createCropPerformanceSchema,
  updateCropPerformanceSchema,
} from "../validators/crop-performance.validator.js";

import {
  createCropPerformance,
  deleteCropPerformance,
  getCropPerformanceById,
  getCropPerformanceRecords,
  updateCropPerformance,
} from "../services/crop-performance.service.js";

export async function createCropPerformanceController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result =
      createCropPerformanceSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
      return;
    }

    const record = await createCropPerformance(
      result.data
    );

    res.status(201).json({
      success: true,
      message:
        "Crop performance record created successfully",
      data: record,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getCropPerformanceRecordsController(
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

    const records =
      await getCropPerformanceRecords(filters);

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getCropPerformanceByIdController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const record = await getCropPerformanceById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function updateCropPerformanceController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result =
      updateCropPerformanceSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
      return;
    }

    const record = await updateCropPerformance(
      req.params.id,
      result.data
    );

    res.status(200).json({
      success: true,
      message:
        "Crop performance record updated successfully",
      data: record,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function deleteCropPerformanceController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await deleteCropPerformance(req.params.id);

    res.status(200).json({
      success: true,
      message:
        "Crop performance record deleted successfully",
    });
  } catch (error: unknown) {
    next(error);
  }
}