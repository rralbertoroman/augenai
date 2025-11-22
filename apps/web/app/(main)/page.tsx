"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePredictions } from "@/hooks/use-predictions";
import { usePatients } from "@/hooks/use-patients";
import Link from "next/link";

export default function HomePage() {
  const { user } = useAuth();
  const { predictions } = usePredictions();
  const { patients } = usePatients();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Doctor";

  // Calculate stats
  const totalPatients = patients.length;
  const totalPredictions = predictions.length;
  const successfulPredictions = predictions.filter(
    (p) => p.status === "success",
  ).length;
  const avgConfidence =
    successfulPredictions > 0
      ? (
          (predictions
            .filter((p) => p.status === "success")
            .reduce((acc, p) => acc + (p.stageIdx || 0), 0) /
            successfulPredictions) *
          10
        ).toFixed(1)
      : "0.0";

  // Recent predictions
  const recentPredictions = predictions
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 4);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getOutcomeBadge = (status: string) => {
    if (status === "success") {
      return (
        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
          Progresión
        </span>
      );
    }
    return (
      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
        Estable
      </span>
    );
  };

  return (
    <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-3">
          <p className="text-foreground dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
            Bienvenido, Dr. {displayName}
          </p>
        </div>
        <Link
          href="/diagnosis/create"
          className="shrink-0 px-4 py-2 bg-primary/25 text-foreground  rounded-lg font-medium hover:bg-primary/35 transition-colors dark:border-gray-800/50 dark:bg-primary/35 dark:hover:bg-primary/45 dark:text-foreground"
        >
          Generar nueva predicción
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-6 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-foreground dark:text-gray-300 text-base font-medium leading-normal">
            Total Pacientes
          </p>
          <p className="text-foreground dark:text-white tracking-light text-4xl font-bold leading-tight">
            {totalPatients}
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-6 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-foreground dark:text-gray-300 text-base font-medium leading-normal">
            Total Predicciones
          </p>
          <p className="text-foreground dark:text-white tracking-light text-4xl font-bold leading-tight">
            {totalPredictions}
          </p>
        </div>
        <div className="lg:col-span-2 flex flex-col gap-4 rounded-lg border border-primary/50 bg-primary/20 p-6 dark:border-primary/50 dark:bg-primary/30">
          <p className="text-foreground dark:text-gray-200 text-base font-medium leading-normal">
            Confianza promedio de predicción
          </p>
          <div className="flex items-end gap-3">
            <p className="text-green-800 dark:text-primary tracking-tight text-5xl font-bold leading-none">
              {avgConfidence}%
            </p>
            <div className="flex flex-col">
              <div className="flex items-center text-sm font-medium text-green-700 dark:text-primary/90">
                <span>↑ 2.1%</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                vs últimos 30 días
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="rounded-lg border border-border bg-card dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-foreground dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-6 pb-3 pt-5">
            Predicciones recientes de pacientes
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3" scope="col">
                    Nombre del paciente
                  </th>
                  <th className="px-6 py-3" scope="col">
                    Fecha de predicción
                  </th>
                  <th className="px-6 py-3" scope="col">
                    Resultado
                  </th>
                  <th className="px-6 py-3" scope="col">
                    Confianza
                  </th>
                  <th className="px-6 py-3" scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {recentPredictions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No hay predicciones recientes
                    </td>
                  </tr>
                ) : (
                  recentPredictions.map((prediction, idx) => (
                    <tr
                      key={prediction.id}
                      className={`${
                        idx === recentPredictions.length - 1 ? "" : "border-b"
                      } bg-card hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800`}
                    >
                      <th
                        className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
                        scope="row"
                      >
                        {prediction.patientName}
                      </th>
                      <td className="px-6 py-4">
                        {formatDate(prediction.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {getOutcomeBadge(prediction.status)}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                        {(prediction.stageIdx || 0) * 10}%
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/diagnosis`}
                          className="font-medium text-green-600 hover:underline dark:text-primary"
                        >
                          Ver Detalles
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
