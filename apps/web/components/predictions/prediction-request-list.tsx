"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import type { EnrichedPredictionRequest } from "@/hooks/use-prediction-requests";

interface PredictionRequestListProps {
  requests: EnrichedPredictionRequest[];
  onShare?: (requestId: string) => void;
}

export function PredictionRequestList({
  requests,
  onShare,
}: PredictionRequestListProps) {
  const router = useRouter();

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTaskLabel = (task: string) => {
    const taskMap: Record<string, string> = {
      classification: "Clasificación",
      detection: "Detección",
      segmentation: "Segmentación",
    };
    return taskMap[task] || task;
  };

  return (
    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
      <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400">
        <tr>
          <th className="px-6 py-3" scope="col">
            Fecha
          </th>
          <th className="px-6 py-3" scope="col">
            Paciente
          </th>
          <th className="px-6 py-3" scope="col">
            Tipo de Tarea
          </th>
          <th className="px-6 py-3" scope="col">
            Enfermedades Sospechadas
          </th>
          <th className="px-6 py-3 text-center" scope="col">
            Predicciones
          </th>
          <th className="px-6 py-3 text-right" scope="col">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody>
        {requests.length === 0 ? (
          <tr>
            <td
              colSpan={6}
              className="px-6 py-8 text-center text-muted-foreground"
            >
              No se encontraron solicitudes de predicción
            </td>
          </tr>
        ) : (
          requests.map((request, idx) => (
            <tr
              key={request.id}
              className={`${
                idx === requests.length - 1 ? "" : "border-b"
              } bg-card hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800`}
            >
              <th
                className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
                scope="row"
              >
                <div className="flex flex-col">
                  <span>{formatDate(request.createdAt)}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(request.createdAt)}
                  </span>
                </div>
              </th>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {request.patient?.name || "N/A"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {request.patient?.email || ""}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant="outline">{getTaskLabel(request.task)}</Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {request.diseaseNames?.map(
                    (diseaseName: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {diseaseName}
                      </Badge>
                    ),
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {request.totalPredictions}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    className="font-semibold"
                    onClick={() => router.push(`/diagnosis/${request.id}`)}
                  >
                    Ver detalles
                  </Button>
                  {onShare && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="font-semibold border border-border"
                      onClick={() => onShare(request.id)}
                    >
                      Compartir
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
