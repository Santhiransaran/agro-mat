import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import {
  checkDeviceStatuses,
} from "./services/deviceStatus.service.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    await checkDeviceStatuses();

setInterval(() => {
  checkDeviceStatuses().catch((error) => {
    console.error(
      "Device status check failed:",
      error
    );
  });
}, 60 * 1000);

    app.listen(PORT, "0.0.0.0", () => {
      console.log("========================================");
      console.log("🌱 IoT Smart Soil Monitoring Backend");
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(
        `❤️  Health: http://localhost:${PORT}/api/v1/health`
      );
      console.log("========================================");
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    process.exit(1);
  }
};

startServer();