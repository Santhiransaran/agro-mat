import {
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  Leaf,
} from "lucide-react";

import { apiGet } from "@/lib/api";

import {
  ParameterAnalysis,
  Recommendation,
} from "@/types/api";

interface RecommendationResponse {
  success: boolean;
  data: Recommendation;
}

function statusClasses(status: string): string {
  switch (status) {
    case "normal":
      return "bg-emerald-100 text-emerald-700";

    case "low":
    case "high":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function overallStatusClasses(
  status: string
): string {
  switch (status) {
    case "good":
      return "bg-emerald-100 text-emerald-700";

    case "attention":
      return "bg-amber-100 text-amber-700";

    case "critical":
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

async function getRecommendation() {
  try {
    const response =
      await apiGet<RecommendationResponse>(
        "/recommendations/AGRO-001"
      );

    return response.data;
  } catch {
    return null;
  }
}

function NutrientCard({
  analysis,
}: {
  analysis: ParameterAnalysis;
}) {
  const isNormal =
    analysis.status === "normal";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
            <FlaskConical size={22} />
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Nutrient
            </p>

            <h2 className="text-xl font-bold">
              {analysis.parameter}
            </h2>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(
            analysis.status
          )}`}
        >
          {analysis.status}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Current Value
          </p>

          <p className="mt-2 text-2xl font-bold">
            {analysis.value}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Minimum
          </p>

          <p className="mt-2 text-2xl font-bold">
            {analysis.min}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Maximum
          </p>

          <p className="mt-2 text-2xl font-bold">
            {analysis.max}
          </p>
        </div>
      </div>

      <div
        className={`mt-6 rounded-xl border p-4 ${
          isNormal
            ? "border-emerald-200 bg-emerald-50"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="flex gap-3">
          {isNormal ? (
            <CheckCircle2
              className="mt-0.5 shrink-0 text-emerald-700"
              size={19}
            />
          ) : (
            <AlertTriangle
              className="mt-0.5 shrink-0 text-amber-700"
              size={19}
            />
          )}

          <div>
            <p className="text-sm font-semibold">
              Recommendation
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {analysis.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function FertilizerPage() {
  const recommendation =
    await getRecommendation();

  if (!recommendation) {
    return (
      <div className="p-5 md:p-8">
        <header className="mb-8">
          <p className="text-sm font-medium text-emerald-700">
            Decision Support
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Fertilizer Recommendation
          </h1>
        </header>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold">
            Recommendation unavailable
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Make sure an active crop and sensor
            reading are available.
          </p>
        </div>
      </div>
    );
  }

  const nutrients: ParameterAnalysis[] = [
    recommendation.nutrients.nitrogen,
    recommendation.nutrients.phosphorus,
    recommendation.nutrients.potassium,
  ];

  return (
    <div className="p-5 md:p-8">
      <header className="mb-8">
        <p className="text-sm font-medium text-emerald-700">
          Decision Support
        </p>

        <div className="mt-1 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Fertilizer Recommendation
            </h1>

            <p className="mt-2 text-slate-500">
              Nutrient analysis for the active crop.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Active Crop
            </p>

            <div className="mt-2 flex items-center gap-2">
              <Leaf
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

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-slate-500">
              Overall Nutrient Condition
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Soil Nutrient Analysis
            </h2>
          </div>

          <span
            className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold capitalize ${overallStatusClasses(
              recommendation.overallStatus
            )}`}
          >
            {recommendation.overallStatus}
          </span>
        </div>

        <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-500">
          Recommendations are generated by
          comparing the latest soil sensor
          readings with the configured crop
          reference ranges.
        </p>
      </section>

      <section className="grid gap-6">
        {nutrients.map((analysis) => (
          <NutrientCard
            key={analysis.parameter}
            analysis={analysis}
          />
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex gap-3">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-amber-700"
          />

          <div>
            <h3 className="font-semibold text-amber-900">
              Agronomic Notice
            </h3>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              This system provides decision
              support from field sensor readings.
              Exact fertilizer application rates
              should be confirmed using validated
              soil testing and agricultural
              recommendations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}