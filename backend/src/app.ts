import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import deviceRoutes from "./routes/device.routes.js";
import cropRoutes from "./routes/crop.routes.js";
import sensorReadingRoutes from "./routes/sensorReading.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";
import alertRoutes from "./routes/alert.routes.js";
import reportRoutes from "./routes/report.routes.js";



const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/v1/devices", deviceRoutes);

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "IoT Smart Soil Monitoring API",
  });
});

app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Agro-Mat API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/crops", cropRoutes);

app.use(
  "/api/v1/readings",
  sensorReadingRoutes
);

app.use(
  "/api/v1/recommendations",
  recommendationRoutes
);

app.use(
  "/api/v1/alerts",
  alertRoutes
);

app.use(
  "/api/v1/reports",
  reportRoutes
);

export default app;