"use client";

import { useMemo } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import {
  StageTotalConfig,
  CohortDataConfigItem,
  CohortData,
} from "../components/dashboard/medical-stats/types";

// Constants for mapping and structure
const DISEASE_CONFIG = {
  "Retinopatía Diabética": {
    name: "Retinopatía Diabética",
    displayName: "Retinopatía Diabética",
    lastStage: "Proliferativo R4",
    stages: [
      { name: "Normal R0", requiresTreatment: false },
      { name: "Leve R1", requiresTreatment: false },
      { name: "Moderado R2", requiresTreatment: false },
      { name: "Severo R3", requiresTreatment: true },
      { name: "Proliferativo R4", requiresTreatment: true },
    ],
  },
  Glaucoma: {
    name: "Glaucoma",
    displayName: "Glaucoma",
    lastStage: "Avanzado G3",
    stages: [
      { name: "Normal G0", requiresTreatment: false },
      { name: "Temprano G1", requiresTreatment: true },
      { name: "Moderado G2", requiresTreatment: true },
      { name: "Avanzado G3", requiresTreatment: true },
    ],
  },
};

const COHORTS = ["0-39", "40-59", "60-79", "80+"];

const calculateAge = (birthDateString?: string): number | null => {
  if (!birthDateString) return null;
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const getCohort = (age: number): string | null => {
  if (age >= 0 && age <= 39) return "0-39";
  if (age >= 40 && age <= 59) return "40-59";
  if (age >= 60 && age <= 79) return "60-79";
  if (age >= 80) return "80+";
  return null; // For now, ignore ages outside these ranges or handle as needed
};

export function useMedicalStats() {
  const { predictions, isLoading, error, refreshData } = useDashboard();

  const { stageTotalData, cohortData } = useMemo(() => {
    if (isLoading || !predictions) {
      return { stageTotalData: [], cohortData: [] };
    }

    // Initialize data structures
    const stageTotals: Record<string, Record<string, number>> = {
      "Retinopatía Diabética": {},
      Glaucoma: {},
      "Age-related Macular Degeneration": {},
    };

    const cohortCounts: Record<
      string,
      Record<string, Record<string, number>>
    > = {
      "Retinopatía Diabética": {},
      Glaucoma: {},
      "Age-related Macular Degeneration": {},
    };

    // Initialize counts to 0
    Object.entries(DISEASE_CONFIG).forEach(([key, config]) => {
      config.stages.forEach((stage) => {
        stageTotals[key][stage.name] = 0;
      });
      COHORTS.forEach((cohort) => {
        cohortCounts[key] = cohortCounts[key] || {};
        cohortCounts[key][cohort] = {};
        config.stages.forEach((stage) => {
          cohortCounts[key][cohort][stage.name] = 0;
        });
      });
    });

    // Process predictions
    predictions.forEach((p) => {
      const diseaseKey = p.disease_name || "";
      if (!diseaseKey) return;

      const stageName = p.stage_content || "";

      if (
        stageTotals[diseaseKey] &&
        stageTotals[diseaseKey][stageName] !== undefined
      ) {
        stageTotals[diseaseKey][stageName]++;
      }

      const age = calculateAge(p.patient_birth_date);
      if (age !== null) {
        const cohort = getCohort(age);
        if (
          cohort &&
          cohortCounts[diseaseKey] &&
          cohortCounts[diseaseKey][cohort] &&
          cohortCounts[diseaseKey][cohort][stageName] !== undefined
        ) {
          cohortCounts[diseaseKey][cohort][stageName]++;
        }
      }
    });

    // Transform to final config structures
    const finalStageTotalConfig: StageTotalConfig[] = Object.entries(
      DISEASE_CONFIG,
    ).map(([key, config]) => ({
      name: config.name,
      displayName: config.displayName,
      lastStage: config.lastStage,
      stages: config.stages.map((stage) => ({
        name: stage.name,
        count: stageTotals[key][stage.name],
        requiresTreatment: stage.requiresTreatment,
      })),
    }));

    const finalCohortDataConfig: Omit<CohortDataConfigItem, "stageNames">[] =
      Object.entries(DISEASE_CONFIG).map(([key, config]) => {
        const cohortDataItems: CohortData[] = COHORTS.map((cohortName) => {
          const counts = cohortCounts[key][cohortName];
          const total = Object.values(counts).reduce((a, b) => a + b, 0);

          const simplifiedCounts: Record<string, number> = {};
          Object.entries(counts).forEach(([stageName, count]) => {
            const simpleName = stageName.split(" ")[0];
            simplifiedCounts[simpleName] =
              (simplifiedCounts[simpleName] || 0) + count;
          });

          return {
            cohortName,
            ...simplifiedCounts,
            total,
          };
        });

        return {
          displayName: config.displayName,
          requiresTreatment: config.stages.map((s) => s.requiresTreatment),
          lastStage: config.lastStage.split(" ")[0],
          cohortData: cohortDataItems,
        };
      });

    return {
      stageTotalData: finalStageTotalConfig,
      cohortData: finalCohortDataConfig,
    };
  }, [predictions, isLoading]);

  return {
    stageTotalData,
    cohortData,
    isLoading,
    error,
    refreshStats: refreshData,
  };
}
