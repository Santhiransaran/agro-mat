import { Router } from "express";

import {
  createObservationController,
  deleteObservationController,
  getObservationByIdController,
  getObservationsController,
  updateObservationController,
} from "../controllers/observation.controller.js";

const observationRouter = Router();

observationRouter
  .route("/")
  .post(createObservationController)
  .get(getObservationsController);

observationRouter
  .route("/:id")
  .get(getObservationByIdController)
  .patch(updateObservationController)
  .delete(deleteObservationController);

export default observationRouter;