import {
  Request,
  Response,
  NextFunction,
} from "express";

import { ZodType } from "zod";

export const validate =
  (schema: ZodType) =>
  (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });

      return;
    }

    next();
  };