import { StageTotalConfig, CohortDataConfig } from "../types";
import { COLOR_PALETTE } from "../constants";
import { useMemo } from "react";

// Helper function to process stage-based data
export const processStageData = (datasets: StageTotalConfig[]) => {
  const stageKeys = new Set<string>();
  const stageMap = new Map<string, { isTx: boolean; isLast: boolean }>();

  datasets.forEach((dataset) => {
    dataset.stages?.forEach((stage) => {
      if (stage.name) {
        stageKeys.add(stage.name);
        stageMap.set(stage.name, {
          isTx: stage.requiresTreatment,
          isLast: stage.name === dataset.lastStage,
        });
      }
    });
  });

  return { stageKeys: Array.from(stageKeys), stageMap };
};

// Helper function to process cohort-based data
export const processCohortData = (datasets: CohortDataConfig[]) => {
  const stageKeys = new Set<string>();
  const stageMap = new Map<string, { isTx: boolean; isLast: boolean }>();

  datasets.forEach((dataset) => {
    const firstCohort = dataset.cohortData?.[0];
    if (!firstCohort) return { stageKeys: [], stageMap };

    const stageNames = Object.keys(firstCohort).filter(
      (key) => !["cohortName", "total"].includes(key),
    );

    stageNames.forEach((stageName, index) => {
      stageKeys.add(stageName);
      stageMap.set(stageName, {
        isTx: dataset.requiresTreatment?.[index] || false,
        isLast: stageName === dataset.lastStage,
      });
    });
  });

  return { stageKeys: Array.from(stageKeys), stageMap };
};

// Hook for theme colors
export const useThemeColors = () => {
  // This would be replaced with actual theme detection logic
  const isDarkMode =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false;

  return isDarkMode ? COLOR_PALETTE.dark : COLOR_PALETTE.light;
};

// Shared logic hook for calculating keys and colors
export const useChartDataLogic = <
  T extends { lastStage: string; stages?: unknown[]; cohortData?: unknown },
>(
  dataConfig: T | T[],
) => {
  const colors = useThemeColors();
  const datasets = useMemo(
    () => (Array.isArray(dataConfig) ? dataConfig : [dataConfig]),
    [dataConfig],
  );

  const isEmpty = !datasets.length;
  const isCohortData = !isEmpty && "cohortData" in datasets[0];

  const { stageKeys, stageMap } = useMemo(() => {
    if (isEmpty) return { stageKeys: [], stageMap: new Map() };

    if (isCohortData) {
      // We need to ensure the data matches CohortDataConfig shape
      const cohortData = datasets as unknown as CohortDataConfig[];
      return processCohortData(cohortData);
    } else {
      // We need to ensure the data matches StageTotalConfig shape
      const stageData = datasets as unknown as StageTotalConfig[];
      return processStageData(stageData);
    }
  }, [isEmpty, datasets, isCohortData]);

  const getColorForStage = (stageName: string, index: number) => {
    const stageInfo = stageMap.get(stageName);
    if (!stageInfo) return colors.intermediateOranges[0];

    if (stageInfo.isLast) return colors.lastStage;
    if (stageName.toLowerCase().includes("normal")) return colors.healthy;
    if (stageInfo.isTx)
      return colors.intermediateRed[
        Math.min(index, colors.intermediateRed.length - 1)
      ];
    return colors.intermediateOranges[
      index % colors.intermediateOranges.length
    ];
  };

  const stageColors = stageKeys.map((key, i) => getColorForStage(key, i));

  return {
    stageKeys,
    stageColors,
    colors,
    isCohortData,
    datasets: isEmpty ? [] : datasets,
    isEmpty,
  };
};
