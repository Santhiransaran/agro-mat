import { Router } from "express";

import {
  createCrop,
  getCrops,
  getActiveCrop,
  completeCrop,
} from "../controllers/crop.controller.js";

import {
  createCropWithDevice,
  getActiveCropsWithDevices,
  getActiveCropByDevice,
} from "../controllers/cropDevice.controller.js";

import { validate } from "../middleware/validate.middleware.js";

import { createCropSchema } from "../validators/crop.validator.js";


const router = Router();


// ============================================================
// Get All Crops
// ============================================================

router.get(
  "/",
  getCrops
);


// ============================================================
// Get All Active Crops With Assigned Devices
// ============================================================

router.get(
  "/active-with-devices",
  getActiveCropsWithDevices
);


// ============================================================
// Get Current Active Crop
// Old MVP route - kept for compatibility
// ============================================================

router.get(
  "/active",
  getActiveCrop
);


// ============================================================
// Get Active Crop By Device ID
//
// Example:
// GET /api/v1/crops/device/AGRO-002/active
// ============================================================

router.get(
  "/device/:deviceId/active",
  getActiveCropByDevice
);


// ============================================================
// Create Crop + Register / Reuse IoT Device
//
// Website should use THIS endpoint.
//
// POST /api/v1/crops/with-device
// ============================================================

router.post(
  "/with-device",
  createCropWithDevice
);


// ============================================================
// Old Crop Creation Endpoint
//
// Kept for backward compatibility.
// New website form should NOT use this.
// ============================================================

router.post(
  "/",
  validate(createCropSchema),
  createCrop
);


// ============================================================
// Complete Current Crop
//
// Old MVP route - later we can make this device-specific.
// ============================================================

router.patch(
  "/active/complete",
  completeCrop
);


export default router;