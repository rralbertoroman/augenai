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
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getOutcome = (status: string) => {
    if (status === "success") {
      return "Alto Riesgo de Progresión";
    } else if (status === "pending") {
      return "Riesgo Moderado";
    }
    return "Estable";
  };

  return (
    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
      <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400">
        <tr>
          <th className="px-6 py-3" scope="col">
            Nombre del Paciente
          </th>
          <th className="px-6 py-3" scope="col">
            Fecha de Predicción
          </th>
          <th className="px-6 py-3" scope="col">
            Confianza
          </th>
          <th className="px-6 py-3" scope="col">
            Resultado Predicho
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
              {prediction.patientName}
            </th>
            <td
              className={`px-6 py-4 ${
                selectedPrediction?.id === prediction.id
                  ? "font-medium text-gray-800 dark:text-gray-200"
                  : ""
              }`}
            >
              {formatDate(prediction.createdAt)}
            </td>
            <td
              className={`px-6 py-4 ${
                selectedPrediction?.id === prediction.id
                  ? "font-medium text-gray-800 dark:text-gray-200"
                  : ""
              }`}
            >
              {(prediction.stageIdx || 0) * 10}%
            </td>
            <td
              className={`px-6 py-4 ${
                selectedPrediction?.id === prediction.id
                  ? "font-medium text-gray-800 dark:text-gray-200"
                  : ""
              }`}
            >
              {getOutcome(prediction.status)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
