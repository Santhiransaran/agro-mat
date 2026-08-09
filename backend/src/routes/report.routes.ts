import { Router } from "express";

import {
  getReportData,
} from "../controllers/report.controller.js";

const router = Router();

router.get(
  "/:deviceId",
  getReportData
);

export default router;