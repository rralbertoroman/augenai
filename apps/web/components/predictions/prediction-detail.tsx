import { Prediction } from "@/hooks/use-predictions";

interface PredictionDetailProps {
  prediction: Prediction;
}

export function PredictionDetail({ prediction }: PredictionDetailProps) {
  const getOutcome = (status: string) => {
    if (status === "success") {
      return "Alto Riesgo de Progresión";
    } else if (status === "pending") {
      return "Riesgo Moderado";
    }
    return "Estable";
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-foreground dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
            Detalles de Predicción
          </h2>
          <p className="text-muted-foreground dark:text-gray-400">
            ID de Predicción: #{prediction.id.slice(0, 10).toUpperCase()}
          </p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Nombre del Paciente
          </p>
          <p className="mt-1 text-base text-gray-900 dark:text-white">
            {prediction.patientName}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Fecha de Predicción
          </p>
          <p className="mt-1 text-base text-gray-900 dark:text-white">
            {new Date(prediction.createdAt).toLocaleDateString("es-ES")}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Confianza
          </p>
          <p className="mt-1 text-base text-gray-900 dark:text-white">
            {(prediction.stageIdx || 0) * 10}%
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Resultado Predicho
          </p>
          <p className="mt-1 text-base text-gray-900 dark:text-white">
            {getOutcome(prediction.status)}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Resumen del Análisis
          </p>
          <p className="mt-1 text-base text-gray-900 dark:text-white">
            El análisis de las exploraciones retinianas indica un adelgazamiento
            significativo de la capa de fibras nerviosas, consistente con
            glaucoma avanzado. El modelo de IA predice una alta probabilidad de
            mayor pérdida de visión en los próximos 6 meses sin intervención.
          </p>
        </div>
      </div>
    </>
  );
}
