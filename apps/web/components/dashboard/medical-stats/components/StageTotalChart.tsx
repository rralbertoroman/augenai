import React from "react";
import { Users } from "lucide-react";
import { BaseStackedBar } from "./BaseStackedBar";
import { useChartDataLogic } from "../utils";
import { StageTotalConfig } from "../types";

interface StageTotalChartProps {
  dataConfig: StageTotalConfig | StageTotalConfig[];
  xKey?: string;
  title?: string;
}

export const StageTotalChart: React.FC<StageTotalChartProps> = ({
  dataConfig,
  xKey = "name",
  title = "Resumen de Etapas de Enfermedad",
}) => {
  const { stageKeys, stageColors } = useChartDataLogic(dataConfig);
  const isMultiple = Array.isArray(dataConfig);

  // Check if dataConfig is empty or has no stages
  const datasets = Array.isArray(dataConfig) ? dataConfig : [dataConfig];
  const hasData =
    datasets.length > 0 &&
    datasets.some((d) => d.stages && d.stages.length > 0);

  // Debug logs
  console.log("Stage Keys:", stageKeys);
  console.log("Stage Colors:", stageColors);

  // Calculate total patients and those requiring treatment
  const { totalPatients, totalRequiringTreatment } = React.useMemo(() => {
    if (!hasData) {
      return { totalPatients: 0, totalRequiringTreatment: 0 };
    }

    return (Array.isArray(dataConfig) ? dataConfig : [dataConfig]).reduce(
      (acc, dataset) => {
        if (!dataset.stages || dataset.stages.length === 0) {
          return acc;
        }

        const datasetTotal = dataset.stages.reduce(
          (sum, stage) => sum + stage.count,
          0,
        );

        const datasetRequiringTreatment = dataset.stages
          .filter((stage) => stage.requiresTreatment)
          .reduce((sum, stage) => sum + stage.count, 0);

        return {
          totalPatients: acc.totalPatients + datasetTotal,
          totalRequiringTreatment:
            acc.totalRequiringTreatment + datasetRequiringTreatment,
        };
      },
      { totalPatients: 0, totalRequiringTreatment: 0 },
    );
  }, [dataConfig, hasData]);

  // Prepare data for the chart
  const chartData = React.useMemo(() => {
    if (!hasData) {
      return [];
    }

    if (isMultiple) {
      // For multiple datasets, we need to create an array of objects where each object
      // represents a disease and contains stage counts
      return (dataConfig as StageTotalConfig[]).map((dataset) => {
        const data: Record<string, string | number> = {
          name: dataset.displayName,
        };

        // Initialize all stage counts to 0
        stageKeys.forEach((key) => {
          data[key] = 0;
        });

        // Set the actual counts for each stage
        if (dataset.stages) {
          dataset.stages.forEach((stage) => {
            data[stage.name] = stage.count;
          });
        }

        return data;
      });
    } else {
      // For single dataset, create a single object with stage counts
      const dataset = dataConfig as StageTotalConfig;
      const data: Record<string, string | number> = {
        name: dataset.displayName,
      };

      // Initialize all stage counts to 0
      stageKeys.forEach((key) => {
        data[key] = 0;
      });

      // Set the actual counts for each stage
      if (dataset.stages) {
        dataset.stages.forEach((stage) => {
          data[stage.name] = stage.count;
        });
      }

      return [data];
    }
  }, [dataConfig, hasData, isMultiple, stageKeys]);

  return (
    <>
      {!hasData ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="w-full h-[400px] flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="text-lg font-medium">No hay datos de etapas disponibles</p>
                <p className="text-sm mt-2">
                  Los datos del paciente aparecerán aquí cuando estén disponibles
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Users className="w-4 h-4 mr-1" />
                <span>{totalPatients} Pacientes Totales</span>
              </div>
              {totalRequiringTreatment > 0 && (
                <div className="text-amber-600 dark:text-amber-400 text-sm">
                  {totalRequiringTreatment} requieren tratamiento
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <BaseStackedBar
              data={chartData}
              keys={stageKeys}
              colors={stageColors}
              xKey={xKey}
            />
          </div>
        </div>
      )}
    </>
  );
};
