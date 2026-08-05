import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  createWeatherSchema,
  updateWeatherSchema,
} from "../validators/weather.validator.js";

import {
  createWeatherRecord,
  deleteWeatherRecord,
  getWeatherRecordById,
  getWeatherRecords,
  updateWeatherRecord,
} from "../services/weather.service.js";

export async function createWeatherController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = createWeatherSchema.safeParse(
      req.body
    );

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });

      return;
    }

    const record = await createWeatherRecord(
      result.data
    );

    res.status(201).json({
      success: true,
      message:
        "Weather record created successfully",
      data: record,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getWeatherRecordsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters: {
      experimentId?: string;
      source?: string;
    } = {};

    if (
      typeof req.query.experimentId === "string"
    ) {
      filters.experimentId =
        req.query.experimentId;
    }

    if (typeof req.query.source === "string") {
      filters.source = req.query.source;
    }

    const records = await getWeatherRecords(
      filters
    );

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getWeatherByIdController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const record = await getWeatherRecordById(
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

export async function updateWeatherController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = updateWeatherSchema.safeParse(
      req.body
    );

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });

      return;
    }

    const record = await updateWeatherRecord(
      req.params.id,
      result.data
    );

    res.status(200).json({
      success: true,
      message:
        "Weather record updated successfully",
      data: record,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function deleteWeatherController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await deleteWeatherRecord(req.params.id);

    res.status(200).json({
      success: true,
      message:
        "Weather record deleted successfully",
    });
  } catch (error: unknown) {
    next(error);
  }
}