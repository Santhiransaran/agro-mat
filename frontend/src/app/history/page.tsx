"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  Droplets,
  FlaskConical,
  Gauge,
  Thermometer,
} from "lucide-react";

import {
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { apiGet } from "@/lib/api";
import { SensorReading } from "@/types/api";

interface HistoryResponse {
  success: boolean;
  count: number;
  data: SensorReading[];
}

type RangeOption =
  | "24h"
  | "7d"
  | "30d";

interface ChartCardProps {
  title: string;
  unit?: string;
  dataKey: keyof SensorReading;
  data: SensorReading[];
}

function ChartCard({
  title,
  unit,
  dataKey,
  data,
}: ChartCardProps) {
  const chartData = data.map((reading) => ({
    ...reading,

    displayTime: new Date(
      reading.recordedAt
    ).toLocaleString(),
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="font-bold">
          {title}
        </h2>

        {unit && (
          <p className="text-xs text-slate-500">
            Unit: {unit}
          </p>
        )}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="displayTime"
              tick={{
                fontSize: 10,
              }}
              minTickGap={40}
            />

            <YAxis
              tick={{
                fontSize: 11,
              }}
            />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey={dataKey}
              name={title}
              stroke="currentColor"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [range, setRange] =
    useState<RangeOption>("24h");

  const [now] =
    useState(() => Date.now());

  const [readings, setReadings] =
    useState<SensorReading[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      try {
        const response =
          await apiGet<HistoryResponse>(
            "/readings/AGRO-001/history?limit=1000"
          );

        if (!cancelled) {
          setReadings(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load history"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredReadings =
    useMemo(() => {
      let rangeMs =
        24 * 60 * 60 * 1000;

      if (range === "7d") {
        rangeMs =
          7 * 24 * 60 * 60 * 1000;
      }

      if (range === "30d") {
        rangeMs =
          30 * 24 * 60 * 60 * 1000;
      }

      return readings
        .filter((reading) => {
          const time =
            new Date(
              reading.recordedAt
            ).getTime();

          return now - time <= rangeMs;
        })
        .sort(
          (a, b) =>
            new Date(
              a.recordedAt
            ).getTime() -
            new Date(
              b.recordedAt
            ).getTime()
        );
    }, [
      readings,
      range,
      now,
    ]);

  const latest =
    filteredReadings.length > 0
      ? filteredReadings[
          filteredReadings.length - 1
        ]
      : null;

  return (
    <div className="p-5 md:p-8">
      <header className="mb-8">
        <p className="text-sm font-medium text-emerald-700">
          Historical Analysis
        </p>

        <div className="mt-1 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Sensor History
            </h1>

            <p className="mt-2 text-slate-500">
              Review soil and environmental
              trends over time.
            </p>
          </div>

          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {[
              {
                label: "24 Hours",
                value: "24h",
              },
              {
                label: "7 Days",
                value: "7d",
              },
              {
                label: "30 Days",
                value: "30d",
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  setRange(
                    option.value as RangeOption
                  )
                }
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  range === option.value
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          Loading sensor history...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      ) : filteredReadings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold">
            No readings available
          </p>

          <p className="mt-2 text-sm text-slate-500">
            No sensor data was recorded
            during the selected time range.
          </p>
        </div>
      ) : (
        <>
          <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <FlaskConical
                  className="text-emerald-700"
                  size={20}
                />

                <p className="text-sm text-slate-500">
                  Latest Nitrogen
                </p>
              </div>

              <p className="mt-3 text-3xl font-bold">
                {latest?.nitrogen}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Droplets
                  className="text-blue-700"
                  size={20}
                />

                <p className="text-sm text-slate-500">
                  Latest Moisture
                </p>
              </div>

              <p className="mt-3 text-3xl font-bold">
                {latest?.soilMoisture}%
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Gauge
                  className="text-emerald-700"
                  size={20}
                />

                <p className="text-sm text-slate-500">
                  Latest pH
                </p>
              </div>

              <p className="mt-3 text-3xl font-bold">
                {latest?.ph}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Thermometer
                  className="text-orange-700"
                  size={20}
                />

                <p className="text-sm text-slate-500">
                  Air Temperature
                </p>
              </div>

              <p className="mt-3 text-3xl font-bold">
                {latest?.airTemperature} °C
              </p>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <ChartCard
              title="Nitrogen"
              unit="mg/kg"
              dataKey="nitrogen"
              data={filteredReadings}
            />

            <ChartCard
              title="Phosphorus"
              unit="mg/kg"
              dataKey="phosphorus"
              data={filteredReadings}
            />

            <ChartCard
              title="Potassium"
              unit="mg/kg"
              dataKey="potassium"
              data={filteredReadings}
            />

            <ChartCard
              title="Soil pH"
              dataKey="ph"
              data={filteredReadings}
            />

            <ChartCard
              title="Electrical Conductivity"
              unit="mS/cm"
              dataKey="ec"
              data={filteredReadings}
            />

            <ChartCard
              title="Soil Moisture"
              unit="%"
              dataKey="soilMoisture"
              data={filteredReadings}
            />

            <ChartCard
              title="Soil Temperature"
              unit="°C"
              dataKey="soilTemperature"
              data={filteredReadings}
            />

            <ChartCard
              title="Air Temperature"
              unit="°C"
              dataKey="airTemperature"
              data={filteredReadings}
            />

            <ChartCard
              title="Humidity"
              unit="%"
              dataKey="humidity"
              data={filteredReadings}
            />
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Activity
                size={20}
                className="text-emerald-700"
              />

              <h2 className="font-bold">
                Data Summary
              </h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Selected Range
                </p>

                <p className="mt-2 font-semibold">
                  {range === "24h"
                    ? "Last 24 Hours"
                    : range === "7d"
                      ? "Last 7 Days"
                      : "Last 30 Days"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Readings
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {filteredReadings.length}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Device
                </p>

                <p className="mt-2 font-semibold">
                  AGRO-001
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}