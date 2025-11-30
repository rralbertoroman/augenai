import React from "react";
import { useMedicalStats } from "../../../hooks/use-medical-stats";
import { StageTotalChart } from "./components/StageTotalChart";
import { DiseaseCohortChart } from "./components/DiseaseCohortChart";

export const MedicalStats: React.FC = () => {
  const { stageTotalData, cohortData, isLoading, error } = useMedicalStats();

  if (isLoading) {
    return <div className="p-8 text-center">Cargando estadísticas...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  // Check if there's actually any data
  const hasStageData = stageTotalData && stageTotalData.length > 0;
  const hasCohortData = cohortData && cohortData.length > 0;

  if (!hasStageData && !hasCohortData) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Panel de Estadísticas Médicas
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Resumen de estadísticas de pacientes a través de diferentes
            condiciones oculares y etapas.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-xl font-medium mb-2">
              No hay datos de pacientes disponibles
            </p>
            <p className="text-sm">
              Las estadísticas de pacientes aparecerán aquí cuando los datos
              estén disponibles
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">
          Panel de Estadísticas Médicas
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Resumen de estadísticas de pacientes a través de diferentes
          condiciones oculares y etapas.
        </p>
      </div>

      <div className="space-y-8">
        {/* Overall Stage Distribution */}
        {hasStageData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <StageTotalChart
              dataConfig={stageTotalData}
              title="Distribución General de Etapas de Enfermedad"
            />
          </div>
        )}

        {/* Age Cohort Breakdown */}
        {hasCohortData && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">
              Análisis por Cohortes de Edad
            </h3>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {cohortData.map((diseaseData, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                >
                  <DiseaseCohortChart diseaseData={diseaseData} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalStats;
