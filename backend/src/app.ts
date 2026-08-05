import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";


import experimentRouter from "./routes/experiment.routes.js";
import plotRouter from "./routes/plot.routes.js";
import treatmentRouter from "./routes/treatment.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:3000",
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(morgan("dev"));

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Agro-Mat API is running",
  });
});

app.use("/api/v1/experiments", experimentRouter);
app.use("/api/v1/treatments", treatmentRouter);
app.use("/api/v1/plots", plotRouter);


app.use(notFoundHandler);
app.use(errorHandler);

export default app;