"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Download,
  FileSpreadsheet,
  FileText,
  Leaf,
  TriangleAlert,
} from "lucide-react";

import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

import { apiGet } from "@/lib/api";

import {
  Alert,
  Crop,
  SensorReading,
} from "@/types/api";

interface ReportResponse {
  success: boolean;

  generatedAt: string;

  device: {
    deviceId: string;
    name: string;
    location?: string;
    status:
      | "online"
      | "offline";
    lastSeen?: string;
  };

  crop: Crop | null;

  summary: {
    totalReadings: number;
    totalAlerts: number;
    activeAlerts: number;
    resolvedAlerts: number;

    averages: {
      nitrogen: number;
      phosphorus: number;
      potassium: number;
      ph: number;
      ec: number;
      soilMoisture: number;
      soilTemperature: number;
      airTemperature: number;
      humidity: number;
    };
  };

  readings: SensorReading[];

  alerts: Alert[];
}

function escapeCsvValue(
  value: unknown
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  const text = String(value);

  return `"${text.replace(
    /"/g,
    '""'
  )}"`;
}

export default function ReportsPage() {
  const [report, setReport] =
    useState<ReportResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadReport =
      async () => {
        try {
          const response =
            await apiGet<ReportResponse>(
              "/reports/AGRO-001"
            );

          if (!cancelled) {
            setReport(
              response
            );

            setError("");
          }
        } catch (err) {
          if (!cancelled) {
            setError(
              err instanceof Error
                ? err.message
                : "Failed to load report"
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    void loadReport();

    return () => {
      cancelled = true;
    };
  }, []);

  const downloadCsv = () => {
    if (!report) {
      return;
    }

    const headers = [
      "Recorded At",
      "Nitrogen",
      "Phosphorus",
      "Potassium",
      "pH",
      "EC",
      "Soil Moisture",
      "Soil Temperature",
      "Air Temperature",
      "Humidity",
    ];

    const rows =
      report.readings.map(
        (reading) => [
          reading.recordedAt,
          reading.nitrogen,
          reading.phosphorus,
          reading.potassium,
          reading.ph,
          reading.ec,
          reading.soilMoisture,
          reading.soilTemperature ??
            "",
          reading.airTemperature,
          reading.humidity,
        ]
      );

    const csv = [
      headers
        .map(
          escapeCsvValue
        )
        .join(","),

      ...rows.map((row) =>
        row
          .map(
            escapeCsvValue
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `agro-report-${report.device.deviceId}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };

  const downloadPdf = () => {
    if (!report) {
      return;
    }

    const doc =
      new jsPDF();

    const generatedDate =
      new Date(
        report.generatedAt
      ).toLocaleString();

    doc.setFontSize(18);

    doc.text(
      "IoT Smart Soil Monitoring Report",
      14,
      18
    );

    doc.setFontSize(10);

    doc.text(
      `Generated: ${generatedDate}`,
      14,
      27
    );

    doc.text(
      `Device ID: ${report.device.deviceId}`,
      14,
      34
    );

    doc.text(
      `Device Name: ${report.device.name}`,
      14,
      41
    );

    doc.text(
      `Status: ${report.device.status}`,
      14,
      48
    );

    let currentY = 55;

    if (
      report.device.location
    ) {
      doc.text(
        `Location: ${report.device.location}`,
        14,
        currentY
      );

      currentY += 8;
    }

    if (report.crop) {
      doc.setFontSize(14);

      doc.text(
        "Crop Information",
        14,
        currentY
      );

      currentY += 8;

      doc.setFontSize(10);

      doc.text(
        `Crop: ${report.crop.name}`,
        14,
        currentY
      );

      currentY += 6;

      doc.text(
        `Variety: ${
          report.crop.variety ??
          "N/A"
        }`,
        14,
        currentY
      );

      currentY += 6;

      doc.text(
        `Farm Area: ${
          report.crop.farmArea
        } ${report.crop.areaUnit}`,
        14,
        currentY
      );

      currentY += 6;

      doc.text(
        `Planting Date: ${new Date(
          report.crop.plantingDate
        ).toLocaleDateString()}`,
        14,
        currentY
      );

      currentY += 10;
    }

    doc.setFontSize(14);

    doc.text(
      "Report Summary",
      14,
      currentY
    );

    autoTable(doc, {
      startY:
        currentY + 5,

      head: [
        [
          "Item",
          "Value",
        ],
      ],

      body: [
        [
          "Total Readings",
          String(
            report.summary
              .totalReadings
          ),
        ],

        [
          "Total Alerts",
          String(
            report.summary
              .totalAlerts
          ),
        ],

        [
          "Active Alerts",
          String(
            report.summary
              .activeAlerts
          ),
        ],

        [
          "Resolved Alerts",
          String(
            report.summary
              .resolvedAlerts
          ),
        ],
      ],
    });

    const summaryEndY =
      (
        doc as jsPDF & {
          lastAutoTable?: {
            finalY: number;
          };
        }
      ).lastAutoTable
        ?.finalY ??
      currentY + 45;

    doc.setFontSize(14);

    doc.text(
      "Average Sensor Values",
      14,
      summaryEndY + 10
    );

    autoTable(doc, {
      startY:
        summaryEndY + 15,

      head: [
        [
          "Parameter",
          "Average",
          "Unit",
        ],
      ],

      body: [
        [
          "Nitrogen",
          String(
            report.summary
              .averages
              .nitrogen
          ),
          "mg/kg",
        ],

        [
          "Phosphorus",
          String(
            report.summary
              .averages
              .phosphorus
          ),
          "mg/kg",
        ],

        [
          "Potassium",
          String(
            report.summary
              .averages
              .potassium
          ),
          "mg/kg",
        ],

        [
          "Soil pH",
          String(
            report.summary
              .averages.ph
          ),
          "",
        ],

        [
          "EC",
          String(
            report.summary
              .averages.ec
          ),
          "mS/cm",
        ],

        [
          "Soil Moisture",
          String(
            report.summary
              .averages
              .soilMoisture
          ),
          "%",
        ],

        [
          "Soil Temperature",
          String(
            report.summary
              .averages
              .soilTemperature
          ),
          "C",
        ],

        [
          "Air Temperature",
          String(
            report.summary
              .averages
              .airTemperature
          ),
          "C",
        ],

        [
          "Humidity",
          String(
            report.summary
              .averages
              .humidity
          ),
          "%",
        ],
      ],
    });

    const averageEndY =
      (
        doc as jsPDF & {
          lastAutoTable?: {
            finalY: number;
          };
        }
      ).lastAutoTable
        ?.finalY ??
      summaryEndY + 90;

    if (
      report.alerts.length >
      0
    ) {
      doc.setFontSize(14);

      doc.text(
        "Alerts",
        14,
        averageEndY + 10
      );

      autoTable(doc, {
        startY:
          averageEndY + 15,

        head: [
          [
            "Type",
            "Severity",
            "Status",
            "Created",
          ],
        ],

        body:
          report.alerts.map(
            (alert) => [
              alert.type.replace(
                /_/g,
                " "
              ),

              alert.severity,

              alert.isResolved
                ? "Resolved"
                : "Active",

              new Date(
                alert.createdAt
              ).toLocaleString(),
            ]
          ),

        styles: {
          fontSize: 8,
        },

        headStyles: {
          fontSize: 8,
        },
      });
    }

    doc.addPage();

    doc.setFontSize(14);

    doc.text(
      "Sensor Reading History",
      14,
      18
    );

    autoTable(doc, {
      startY: 24,

      head: [
        [
          "Time",
          "N",
          "P",
          "K",
          "pH",
          "EC",
          "Moist.",
          "Soil T",
          "Air T",
          "Hum.",
        ],
      ],

      body:
        report.readings.map(
          (reading) => [
            new Date(
              reading.recordedAt
            ).toLocaleString(),

            reading.nitrogen,

            reading.phosphorus,

            reading.potassium,

            reading.ph,

            reading.ec,

            `${reading.soilMoisture}%`,

            reading.soilTemperature ??
              "",

            reading.airTemperature,

            `${reading.humidity}%`,
          ]
        ),

      styles: {
        fontSize: 7,
      },

      headStyles: {
        fontSize: 7,
      },
    });

    const pageCount =
      doc.getNumberOfPages();

    for (
      let pageNumber = 1;
      pageNumber <= pageCount;
      pageNumber++
    ) {
      doc.setPage(
        pageNumber
      );

      doc.setFontSize(8);

      doc.text(
        `AgroSense - Page ${pageNumber} of ${pageCount}`,
        14,
        290
      );
    }

    doc.save(
      `agro-report-${report.device.deviceId}.pdf`
    );
  };

  if (loading) {
    return (
      <div className="p-5 md:p-8">
        Loading report...
      </div>
    );
  }

  if (
    error ||
    !report
  ) {
    return (
      <div className="p-5 md:p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error ||
            "Report unavailable"}
        </div>
      </div>
    );
  }

  const averages =
    report.summary.averages;

  return (
    <div className="p-5 md:p-8">
      <header className="mb-8">
        <p className="text-sm font-medium text-emerald-700">
          Data Export
        </p>

        <div className="mt-1 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Reports
            </h1>

            <p className="mt-2 text-slate-500">
              Farm monitoring
              summary and sensor
              data export.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={
                downloadCsv
              }
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              <Download
                size={18}
              />

              Export CSV
            </button>

            <button
              onClick={
                downloadPdf
              }
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <FileText
                size={18}
              />

              Export PDF
            </button>
          </div>
        </div>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Readings
          </p>

          <p className="mt-2 text-3xl font-bold">
            {
              report.summary
                .totalReadings
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Alerts
          </p>

          <p className="mt-2 text-3xl font-bold">
            {
              report.summary
                .totalAlerts
            }
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">
            Active Alerts
          </p>

          <p className="mt-2 text-3xl font-bold text-red-800">
            {
              report.summary
                .activeAlerts
            }
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm text-emerald-700">
            Resolved Alerts
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-800">
            {
              report.summary
                .resolvedAlerts
            }
          </p>
        </div>
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <FileSpreadsheet
              size={20}
              className="text-emerald-700"
            />

            <h2 className="text-lg font-bold">
              Device Information
            </h2>
          </div>

          <div className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">
                Device
              </span>

              <span className="font-semibold">
                {
                  report.device
                    .deviceId
                }
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">
                Name
              </span>

              <span className="font-semibold">
                {
                  report.device
                    .name
                }
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">
                Status
              </span>

              <span className="font-semibold capitalize">
                {
                  report.device
                    .status
                }
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Leaf
              size={20}
              className="text-emerald-700"
            />

            <h2 className="text-lg font-bold">
              Crop Information
            </h2>
          </div>

          {report.crop ? (
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500">
                  Crop
                </span>

                <span className="font-semibold">
                  {
                    report.crop
                      .name
                  }
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500">
                  Variety
                </span>

                <span className="font-semibold">
                  {report.crop
                    .variety ||
                    "N/A"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Farm Area
                </span>

                <span className="font-semibold">
                  {
                    report.crop
                      .farmArea
                  }{" "}
                  {
                    report.crop
                      .areaUnit
                  }
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">
              No active crop.
            </p>
          )}
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">
          Average Sensor Values
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            [
              "Nitrogen",
              averages.nitrogen,
              "mg/kg",
            ],

            [
              "Phosphorus",
              averages.phosphorus,
              "mg/kg",
            ],

            [
              "Potassium",
              averages.potassium,
              "mg/kg",
            ],

            [
              "Soil pH",
              averages.ph,
              "",
            ],

            [
              "EC",
              averages.ec,
              "mS/cm",
            ],

            [
              "Soil Moisture",
              averages.soilMoisture,
              "%",
            ],

            [
              "Soil Temperature",
              averages.soilTemperature,
              "°C",
            ],

            [
              "Air Temperature",
              averages.airTemperature,
              "°C",
            ],

            [
              "Humidity",
              averages.humidity,
              "%",
            ],
          ].map(
            ([
              label,
              value,
              unit,
            ]) => (
              <div
                key={String(
                  label
                )}
                className="rounded-xl bg-slate-50 p-4"
              >
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {label}
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {value}{" "}
                  <span className="text-sm font-normal text-slate-500">
                    {unit}
                  </span>
                </p>
              </div>
            )
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex gap-3">
          <TriangleAlert
            size={20}
            className="mt-0.5 shrink-0 text-amber-700"
          />

          <div>
            <h3 className="font-semibold text-amber-900">
              Report Notice
            </h3>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              Sensor reports provide
              monitoring and decision-support
              information. Nutrient
              measurements should be
              periodically validated with
              laboratory soil testing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}