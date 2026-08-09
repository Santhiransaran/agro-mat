"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  Info,
  TriangleAlert,
} from "lucide-react";

import { apiGet } from "@/lib/api";
import { Alert } from "@/types/api";

interface AlertResponse {
  success: boolean;
  count: number;
  data: Alert[];
}

type AlertFilter =
  | "active"
  | "resolved"
  | "all";

function severityClasses(
  severity: string
): string {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-700";

    case "warning":
      return "bg-amber-100 text-amber-700";

    case "info":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function severityIcon(
  severity: string
) {
  switch (severity) {
    case "critical":
      return (
        <CircleAlert
          size={20}
          className="text-red-600"
        />
      );

    case "warning":
      return (
        <AlertTriangle
          size={20}
          className="text-amber-600"
        />
      );

    case "info":
      return (
        <Info
          size={20}
          className="text-blue-600"
        />
      );

    default:
      return (
        <TriangleAlert
          size={20}
          className="text-slate-500"
        />
      );
  }
}

export default function AlertsPage() {
  const [filter, setFilter] =
    useState<AlertFilter>("active");

  const [alerts, setAlerts] =
    useState<Alert[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadAlerts = async () => {
      try {
        const endpoint =
          filter === "active"
            ? "/alerts?resolved=false"
            : filter === "resolved"
              ? "/alerts?resolved=true"
              : "/alerts";

        const response =
          await apiGet<AlertResponse>(
            endpoint
          );

        if (!cancelled) {
          setAlerts(response.data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load alerts"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadAlerts();

    return () => {
      cancelled = true;
    };
  }, [filter]);

  const criticalCount =
    alerts.filter(
      (alert) =>
        alert.severity === "critical"
    ).length;

  const warningCount =
    alerts.filter(
      (alert) =>
        alert.severity === "warning"
    ).length;

  const infoCount =
    alerts.filter(
      (alert) =>
        alert.severity === "info"
    ).length;

  return (
    <div className="p-5 md:p-8">
      <header className="mb-8">
        <p className="text-sm font-medium text-emerald-700">
          System Monitoring
        </p>

        <div className="mt-1 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Alerts
            </h1>

            <p className="mt-2 text-slate-500">
              Review abnormal soil
              conditions and device issues.
            </p>
          </div>

          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {[
              {
                label: "Active",
                value: "active",
              },
              {
                label: "Resolved",
                value: "resolved",
              },
              {
                label: "All",
                value: "all",
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  setFilter(
                    option.value as AlertFilter
                  )
                }
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  filter === option.value
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

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Displayed Alerts
          </p>

          <p className="mt-2 text-3xl font-bold">
            {alerts.length}
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">
            Critical
          </p>

          <p className="mt-2 text-3xl font-bold text-red-800">
            {criticalCount}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-700">
            Warning
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-800">
            {warningCount}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm text-blue-700">
            Information
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-800">
            {infoCount}
          </p>
        </div>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          Loading alerts...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      ) : alerts.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
          <CheckCircle2
            size={40}
            className="mx-auto text-emerald-600"
          />

          <h2 className="mt-4 text-lg font-bold text-emerald-900">
            No alerts found
          </h2>

          <p className="mt-2 text-sm text-emerald-700">
            There are no alerts matching
            the selected filter.
          </p>
        </div>
      ) : (
        <section className="space-y-4">
          {alerts.map((alert) => (
            <article
              key={alert._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div className="flex gap-4">
                  <div className="mt-1 rounded-xl bg-slate-50 p-3">
                    {severityIcon(
                      alert.severity
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold capitalize">
                        {alert.type.replace(
                          /_/g,
                          " "
                        )}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${severityClasses(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          alert.isResolved
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {alert.isResolved
                          ? "Resolved"
                          : "Active"}
                      </span>
                    </div>

                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                      {alert.message}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                      <span>
                        Created:{" "}
                        {new Date(
                          alert.createdAt
                        ).toLocaleString()}
                      </span>

                      {alert.resolvedAt && (
                        <span>
                          Resolved:{" "}
                          {new Date(
                            alert.resolvedAt
                          ).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}