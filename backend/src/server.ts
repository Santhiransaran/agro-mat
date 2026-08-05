import { webcrypto } from "node:crypto";
import "dotenv/config";

import mongoose from "mongoose";

import app from "./app.js";
import { connectDatabase } from "./config/database.js";

// MongoDB driver needs the Web Crypto API.
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
    configurable: true,
  });
}

const port = Number(process.env.PORT) || 5000;

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

async function shutdown(signal: string): Promise<void> {
  console.log(`${signal} received. Closing server...`);

  await mongoose.connection.close();

  console.log("MongoDB connection closed");
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void startServer();