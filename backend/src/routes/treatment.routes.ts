import { Router } from "express";

import {
  createTreatmentController,
  deleteTreatmentController,
  getTreatmentByIdController,
  getTreatmentsController,
  updateTreatmentController,
} from "../controllers/treatment.controller.js";

const treatmentRouter = Router();

treatmentRouter
  .route("/")
  .post(createTreatmentController)
  .get(getTreatmentsController);

treatmentRouter
  .route("/:id")
  .get(getTreatmentByIdController)
  .patch(updateTreatmentController)
  .delete(deleteTreatmentController);

export default treatmentRouter;