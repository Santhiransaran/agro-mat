"use client";

import { useEffect, useState } from "react";
import { Leaf, LoaderCircle, MapPin } from "lucide-react";

import { api } from "@/lib/api";

import type {
  Experiment,
  ExperimentsResponse,
} from "@/types/experiment";

export default function HomePage() {
  const [experiments, setExperiments] = useState<
    Experiment[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function loadExperiments() {
      try {
        setIsLoading(true);
        setError(null);

        const response =
          await api.get<ExperimentsResponse>(
            "/experiments"
          );

        setExperiments(response.data.data);
      } catch (requestError) {
        console.error(requestError);

        setError(
          "Could not load experiments. Check whether the backend is running."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadExperiments();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <Leaf className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Agro-Mat Research Platform
              </h1>

              <p className="mt-1 text-slate-600">
                Experiments, treatments and research
                data management
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            Experiments
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Data loaded from your Express and MongoDB
            backend.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-3 rounded-xl border bg-white p-6 text-slate-600">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading experiments...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        {!isLoading &&
          !error &&
          experiments.length === 0 && (
            <div className="rounded-xl border bg-white p-8 text-center text-slate-600">
              No experiments found.
            </div>
          )}

        {!isLoading &&
          !error &&
          experiments.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {experiments.map((experiment) => (
                <article
                  key={experiment._id}
                  className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {experiment.experimentCode}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                      {experiment.status}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-slate-900">
                    {experiment.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600">
                    Crop: {experiment.cropType}
                    {experiment.cropVariety
                      ? ` — ${experiment.cropVariety}`
                      : ""}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" />

                    <span>
                      {experiment.location.siteName}
                      {experiment.location.district
                        ? `, ${experiment.location.district}`
                        : ""}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
      </section>
    </main>
  );
}