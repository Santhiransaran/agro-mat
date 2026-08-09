import { Router } from "express";

import {
  createDevice,
  getDevices,
} from "../controllers/device.controller.js";

import { validate } from "../middleware/validate.middleware.js";

import { createDeviceSchema } from "../validators/device.validator.js";

const router = Router();

router.get("/", getDevices);

router.post(
  "/",
  validate(createDeviceSchema),
  createDevice
);

export default router;