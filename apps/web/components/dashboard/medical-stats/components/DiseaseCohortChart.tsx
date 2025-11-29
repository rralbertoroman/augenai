import React from "react";
import { BarChart3, AlertTriangle } from "lucide-react";
import { BaseStackedBar } from "./BaseStackedBar";
import { useChartDataLogic } from "../utils";
import { CohortDataConfigItem } from "../types";

interface DiseaseCohortChartProps {
  diseaseData: CohortDataConfigItem;
}

export const DiseaseCohortChart: React.FC<DiseaseCohortChartProps> = ({
  diseaseData,
}) => {
  const { stageKeys, stageColors, colors } = useChartDataLogic(diseaseData);

  // Handle empty cohort data
  if (!diseaseData.cohortData || diseaseData.cohortData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{diseaseData.displayName}</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="w-full h-[400px] flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">No hay datos de cohortes disponibles</p>
              <p className="text-sm mt-2">
                Los datos para {diseaseData.displayName} aparecerán aquí cuando
                estén disponibles
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get stage names from the first cohort
  const firstCohort = diseaseData.cohortData[0];
  const stageNames = Object.keys(firstCohort).filter(
    (key) => !["cohortName", "total"].includes(key),
  );

  // Calculate total patients requiring treatment
  const totalRequiringTreatment = diseaseData.cohortData.reduce(
    (sum, cohort) => {
      const treatmentCount = stageNames.reduce(
        (cohortSum, stage, index) =>
          diseaseData.requiresTreatment?.[index]
            ? cohortSum + (Number(cohort[stage]) || 0)
            : cohortSum,
        0,
      );
      return sum + treatmentCount;
    },
    0,
  );

  // Calculate total patients in all cohorts
  const totalPatients = diseaseData.cohortData.reduce(
    (sum, cohort) => sum + (cohort.total || 0),
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{diseaseData.displayName}</h3>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">{totalPatients}</span> Total de Pacientes
          </div>
          {totalRequiringTreatment > 0 && (
            <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span>{totalRequiringTreatment} requieren tratamiento</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <BaseStackedBar
          data={diseaseData.cohortData}
          keys={stageNames}
          colors={stageColors}
          xKey="cohortName"
        />
      </div>
    </div>
  );
};
