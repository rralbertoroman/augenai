"use client";

import { Prediction } from "@/hooks/use-predictions";

interface PredictionListProps {
  predictions: Prediction[];
  selectedPrediction: Prediction | null;
  onSelectPrediction: (prediction: Prediction) => void;
}

export function PredictionList({
  predictions,
  selectedPrediction,
  onSelectPrediction,
}: PredictionListProps) {
  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
      <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400">
        <tr>
          <th className="px-6 py-3" scope="col">
            Enfermedad Sospechada
          </th>
          <th className="px-6 py-3" scope="col">
            Resultado
          </th>
          <th className="px-6 py-3" scope="col">
            Confianza
          </th>
          <th className="px-6 py-3" scope="col">
            Fecha
          </th>
        </tr>
      </thead>
      <tbody>
        {predictions.map((prediction, idx) => (
          <tr
            key={prediction.id}
            onClick={() => onSelectPrediction(prediction)}
            className={`cursor-pointer ${
              idx === predictions.length - 1 ? "" : "border-b"
            } ${
              selectedPrediction?.id === prediction.id
                ? "bg-primary/20 hover:bg-primary/30 dark:bg-primary/30 dark:hover:bg-primary/40"
                : "bg-card hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            }`}
          >
            <th
              className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
              scope="row"
            >
              {prediction.disease_name}
            </th>
            <td
              className={`px-6 py-4 ${
                selectedPrediction?.id === prediction.id
                  ? "font-medium text-gray-800 dark:text-gray-200"
                  : ""
              }`}
            >
              {prediction.stage_content}
            </td>
            <td
              className={`px-6 py-4 ${
                selectedPrediction?.id === prediction.id
                  ? "font-medium text-gray-800 dark:text-gray-200"
                  : ""
              }`}
            >
              {`${(prediction.confidence * 100).toFixed(1)}%`}
            </td>
            <td
              className={`px-6 py-4 ${
                selectedPrediction?.id === prediction.id
                  ? "font-medium text-gray-800 dark:text-gray-200"
                  : ""
              }`}
            >
              {formatDate(prediction.createdAt)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
