import { z } from "zod";

export const createDeviceSchema = z.object({
  body: z.object({
    deviceId: z
      .string()
      .min(3)
      .max(50),

    name: z
      .string()
      .min(2)
      .max(100),

    location: z
      .string()
      .max(200)
      .optional(),

    firmwareVersion: z
      .string()
      .max(50)
      .optional(),
  }),
});