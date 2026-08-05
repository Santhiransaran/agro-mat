import type {
  NextFunction,
  Request,
  Response,
} from "express";

interface ErrorWithCode extends Error {
  code?: number;
}

export function errorHandler(
  error: ErrorWithCode,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(error);

  if (error.name === "NotFoundError") {
    res.status(404).json({
      success: false,
      message: error.message,
    });

    return;
  }

  if (error.name === "ValidationError") {
    res.status(400).json({
      success: false,
      message: error.message,
    });

    return;
  }

  if (
    error.name === "ConflictError" ||
    error.code === 11000
  ) {
    res.status(409).json({
      success: false,
      message: error.message || "Duplicate record",
    });

    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}