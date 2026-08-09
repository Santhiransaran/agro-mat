import { Router } from "express";

import {
  getAlerts,
  getDeviceAlerts,
} from "../controllers/alert.controller.js";

const router = Router();

router.get("/", getAlerts);

router.get(
  "/device/:deviceId",
  getDeviceAlerts
);

export default router;