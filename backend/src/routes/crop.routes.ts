import { Router } from "express";

import {
  createCrop,
  getCrops,
  getActiveCrop,
  completeCrop,
} from "../controllers/crop.controller.js";

import { validate } from "../middleware/validate.middleware.js";

import { createCropSchema } from "../validators/crop.validator.js";

const router = Router();

router.get("/", getCrops);

router.get("/active", getActiveCrop);

router.post(
  "/",
  validate(createCropSchema),
  createCrop
);

router.patch(
  "/active/complete",
  completeCrop
);

export default router;