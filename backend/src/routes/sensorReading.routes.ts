import { Router } from "express";

import {
  createSensorReading,
  getLatestSensorReading,
  getSensorHistory,
} from "../controllers/sensorReading.controller.js";

import { validate } from "../middleware/validate.middleware.js";

import { createSensorReadingSchema } from "../validators/sensorReading.validator.js";

const router = Router();

router.post(
  "/",
  validate(createSensorReadingSchema),
  createSensorReading
);

router.get(
  "/:deviceId/latest",
  getLatestSensorReading
);

router.get(
  "/:deviceId/history",
  getSensorHistory
);

export default router;