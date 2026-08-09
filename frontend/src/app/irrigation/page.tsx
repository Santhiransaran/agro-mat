import {
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Gauge,
  Sprout,
} from "lucide-react";

import { apiGet } from "@/lib/api";

import {
  Recommendation,
  SensorReading,
} from "@/types/api";

interface RecommendationResponse {
  success: boolean;
  data: Recommendation;
}

interface LatestReadingResponse {
  success: boolean;

  device: {
    deviceId: string;
    name: string;
    status: "online" | "offline";
    lastSeen?: string;
  };

  data: SensorReading;
}

function statusClasses(status: string): string {
  switch (status) {
    case "normal":
      return "bg-emerald-100 text-emerald-700";

    case "low":
      return "bg-amber-100 text-amber-700";

    case "high":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

async function getIrrigationData() {
  const results = await Promise.allSettled([
    apiGet<RecommendationResponse>(
      "/recommendations/AGRO-001"
    ),

    apiGet<LatestReadingResponse>(
      "/readings/AGRO-001/latest"
    ),
  ]);

  return {
    recommendation:
      results[0].status === "fulfilled"
        ? results[0].value.data
        : null,

    latest:
      results[1].status === "fulfilled"
        ? results[1].value
        : null,
  };
}

export default async function IrrigationPage() {
  const {
    recommendation,
    latest,
  } = await getIrrigationData();

  if (!recommendation || !latest) {
    return (
      <div className="p-5 md:p-8">
        <header className="mb-8">
          <p className="text-sm font-medium text-emerald-700">
            Water Management
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Irrigation Status
          </h1>
        </header>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold">
            Irrigation data unavailable
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Make sure the active crop and sensor
            readings are available.
          </p>
        </div>
      </div>
    );
  }

  const irrigation =
    recommendation.irrigation;

  const reading = latest.data;

  const needsWater =
    irrigation.status === "low";

  const tooWet =
    irrigation.status === "high";

  const moisturePercent =
    Math.max(
      0,
      Math.min(
        100,
        reading.soilMoisture
      )
    );

  return (
    <div className="p-5 md:p-8">
      <header className="mb-8">
        <p className="text-sm font-medium text-emerald-700">
          Water Management
        </p>

        <div className="mt-1 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Irrigation Status
            </h1>

            <p className="mt-2 text-slate-500">
              Soil moisture based irrigation
              decision support.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Active Crop
            </p>

            <div className="mt-2 flex items-center gap-2">
              <Sprout
                size={18}
                className="text-emerald-700"
              />

              <span className="font-semibold">
                {recommendation.crop}
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                Current Soil Moisture
              </p>

              <div className="mt-2 flex items-end gap-2">
                <span className="text-5xl font-bold tracking-tight">
                  {reading.soilMoisture}
                </span>

                <span className="mb-1 text-lg text-slate-500">
                  %
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4 text-blue-700">
              <Droplets size={28} />
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-2 flex justify-between text-xs text-slate-500">
              <span>0%</span>
              <span>100%</span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{
                  width: `${moisturePercent}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Current
              </p>

              <p className="mt-2 text-2xl font-bold">
                {irrigation.value}%
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Minimum
              </p>

              <p className="mt-2 text-2xl font-bold">
                {irrigation.min}%
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Maximum
              </p>

              <p className="mt-2 text-2xl font-bold">
                {irrigation.max}%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Irrigation Decision
          </p>

          <div className="mt-4">
            <span
              className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold capitalize ${statusClasses(
                irrigation.status
              )}`}
            >
              {irrigation.status}
            </span>
          </div>

          <div className="mt-6">
            {needsWater ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle
                    size={20}
                    className="mt-0.5 shrink-0 text-amber-700"
                  />

                  <div>
                    <p className="font-semibold text-amber-900">
                      Irrigation Recommended
                    </p>

                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      Soil moisture is below the
                      configured crop range.
                    </p>
                  </div>
                </div>
              </div>
            ) : tooWet ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex gap-3">
                  <Droplets
                    size={20}
                    className="mt-0.5 shrink-0 text-blue-700"
                  />

                  <div>
                    <p className="font-semibold text-blue-900">
                      Soil Too Wet
                    </p>

                    <p className="mt-1 text-sm leading-6 text-blue-800">
                      Avoid additional irrigation
                      and check drainage.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-700"
                  />

                  <div>
                    <p className="font-semibold text-emerald-900">
                      Irrigation Not Required
                    </p>

                    <p className="mt-1 text-sm leading-6 text-emerald-800">
                      Soil moisture is currently
                      within the configured crop
                      range.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Gauge size={20} />
            </div>

            <h2 className="text-lg font-bold">
              Recommendation
            </h2>
          </div>

          <p className="mt-5 text-sm leading-7 text-slate-600">
            {irrigation.message}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">
            Latest Reading Information
          </h2>

          <div className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">
                Device
              </span>

              <span className="font-medium">
                {latest.device.deviceId}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">
                Recorded At
              </span>

              <span className="font-medium">
                {new Date(
                  reading.recordedAt
                ).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">
                Soil Temperature
              </span>

              <span className="font-medium">
                {reading.soilTemperature ??
                  "N/A"}
                {reading.soilTemperature !==
                undefined
                  ? " °C"
                  : ""}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}