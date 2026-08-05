import { Router } from "express";

import {
  treatmentComparisonController,
} from "../controllers/analytics.controller.js";

const analyticsRouter = Router();

analyticsRouter.get(
  "/treatment-comparison",
  treatmentComparisonController
);

export default analyticsRouter;