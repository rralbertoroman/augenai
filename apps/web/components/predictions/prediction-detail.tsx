import { Prediction } from "@/hooks/use-predictions";

interface PredictionDetailProps {
  prediction: Prediction;
}

export function PredictionDetail({ prediction }: PredictionDetailProps) {
  return (
    <>
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-foreground dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
            Detalles de Análisis
          </h2>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Enfermedad Sospechada
          </p>
          <p className="mt-1 text-base text-gray-900 dark:text-white font-semibold">
            {prediction.disease_name}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Clasificación
          </p>
          <p className="mt-1 text-base text-gray-900 dark:text-white font-semibold">
            Estadio {prediction.stage_idx + 1}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Confianza
          </p>
          <p className="mt-1 text-base text-gray-900 dark:text-white font-semibold">
            {(prediction.confidence * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Estadio
          </p>
          <p className="mt-1 text-base text-gray-900 dark:text-white">
            {prediction.stage_content}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Fecha del Análisis
          </p>
          <p className="mt-1 text-base text-gray-900 dark:text-white">
            {new Date(prediction.createdAt).toLocaleDateString("es-ES")}
          </p>
        </div>
      </div>
    </>
  );
}
