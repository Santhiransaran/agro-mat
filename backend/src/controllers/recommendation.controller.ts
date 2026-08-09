import {
  Request,
  Response,
} from "express";

import {
  generateRecommendation,
} from "../services/recommendation.service.js";

export const getRecommendation =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const deviceId = String(
        req.params.deviceId
      ).toUpperCase();

      const recommendation =
        await generateRecommendation(
          deviceId
        );

      res.status(200).json({
        success: true,
        data: recommendation,
      });
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate recommendation";

      res.status(400).json({
        success: false,
        message,
      });
    }
  };