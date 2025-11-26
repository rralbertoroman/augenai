import React from 'react';
import { Users } from 'lucide-react';
import { BaseStackedBar } from './BaseStackedBar';
import { useChartDataLogic } from '../utils';
import { StageTotalConfig } from '../types';

interface StageTotalChartProps {
  dataConfig: StageTotalConfig | StageTotalConfig[];
  xKey?: string;
  title?: string;
}

export const StageTotalChart: React.FC<StageTotalChartProps> = ({
  dataConfig,
  xKey = "name",
  title = "Disease Stages Overview"
}) => {
  const { stageKeys, stageColors } = useChartDataLogic(dataConfig);
  const isMultiple = Array.isArray(dataConfig);
  
  // Debug logs
  console.log('Stage Keys:', stageKeys);
  console.log('Stage Colors:', stageColors);
  
  // Calculate total patients and those requiring treatment
  const { totalPatients, totalRequiringTreatment } = React.useMemo(() => {
    return (Array.isArray(dataConfig) ? dataConfig : [dataConfig]).reduce(
      (acc, dataset) => {
        const datasetTotal = dataset.stages.reduce(
          (sum, stage) => sum + stage.count,
          0
        );
        
        const datasetRequiringTreatment = dataset.stages
          .filter(stage => stage.requiresTreatment)
          .reduce((sum, stage) => sum + stage.count, 0);
          
        return {
          totalPatients: acc.totalPatients + datasetTotal,
          totalRequiringTreatment: acc.totalRequiringTreatment + datasetRequiringTreatment
        };
      },
      { totalPatients: 0, totalRequiringTreatment: 0 }
    );
  }, [dataConfig]);

  // Prepare data for the chart
  const chartData = React.useMemo(() => {
    if (isMultiple) {
      // For multiple datasets, we need to create an array of objects where each object
      // represents a disease and contains stage counts
      return (dataConfig as StageTotalConfig[]).map(dataset => {
        const data: Record<string, string | number> = { name: dataset.displayName };
        
        // Initialize all stage counts to 0
        stageKeys.forEach(key => {
          data[key] = 0;
        });
        
        // Set the actual counts for each stage
        dataset.stages.forEach(stage => {
          data[stage.name] = stage.count;
        });
        
        return data;
      });
    } else {
      // For single dataset, create a single object with stage counts
      const dataset = dataConfig as StageTotalConfig;
      const data: Record<string, string | number> = { name: dataset.displayName };
      
      // Initialize all stage counts to 0
      stageKeys.forEach(key => {
        data[key] = 0;
      });
      
      // Set the actual counts for each stage
      dataset.stages.forEach(stage => {
        data[stage.name] = stage.count;
      });
      
      return [data];
    }
  }, [dataConfig, isMultiple, stageKeys]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Users className="w-4 h-4 mr-1" />
            <span>{totalPatients} Total Patients</span>
          </div>
          {totalRequiringTreatment > 0 && (
            <div className="text-amber-600 dark:text-amber-400 text-sm">
              {totalRequiringTreatment} require treatment
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
  );
};
