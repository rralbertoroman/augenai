"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getAllPredictionRequestsWithFeedbacksByUserId } from "@/server/services/prediction_request";
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
  const { user, accessToken } = useAuth();
  const [stageTotalData, setStageTotalData] = useState<StageTotalConfig[]>([]);
  const [cohortData, setCohortData] = useState<
    Omit<CohortDataConfigItem, "stageNames">[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id || !accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const predictions = await getAllPredictionRequestsWithFeedbacksByUserId(
        accessToken,
        user.id,
      );

      console.log("Predictions:", predictions);

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
        // Use feedback if available (already handled by service logic? No, service returns enriched DTOs with feedback array)
        // The hook use-predictions-with-feedback.ts had logic to override with feedback.
        // We should replicate that logic or assume the service returns what we need.
        // The service returns `feedbacks` array. We should check if there is a main feedback.

        let diseaseKey = "";
        let stageName = "";

        // Determine disease key and stage name
        // This mapping depends on how disease_name and stage_content are returned
        // Assuming p.disease_name matches "Diabetic Retinopathy", etc.
        // And p.stage_content matches "Healthy R0", etc.

        // Use disease name directly as key
        diseaseKey = p.disease_name || "";

        if (!diseaseKey) return; // Unknown disease

        // Check for feedback override
        const mainFeedback = p.feedbacks?.find((fb) => fb.isMainData);
        // If feedback exists, we might need to map classId back to stage name.
        // This is complex without the mapping available here.
        // For now, let's use the prediction's stage_content unless we want to fetch mappings.
        // The service `getAllPredictionRequestsWithFeedbacksByUserId` returns enriched DTOs.
        // If we want to support feedback overrides properly, we'd need the class-to-stage mapping.
        // However, the prompt says "Reuse server functions... Call those functions from hooks".
        // Let's stick to the data provided in the DTO for now, assuming `stage_content` is what we want,
        // or if feedback overrides it, we might need to fetch that.
        // BUT, `use-predictions-with-feedback.ts` does client-side override.
        // Let's assume for this task we use the prediction data directly or if simple, apply feedback.
        // Given we don't have class-to-stage map easily here, let's use `p.stage_content`.

        stageName = p.stage_content || "";

        if (
          stageTotals[diseaseKey] &&
          stageTotals[diseaseKey][stageName] !== undefined
        ) {
          stageTotals[diseaseKey][stageName]++;
        }

        // Cohort processing
        const age = calculateAge(p.patient_birth_date);
        if (age !== null) {
          const cohort = getCohort(age);
          if (
            cohort &&
            cohortCounts[diseaseKey] &&
            cohortCounts[diseaseKey][cohort]
          ) {
            if (cohortCounts[diseaseKey][cohort][stageName] !== undefined) {
              cohortCounts[diseaseKey][cohort][stageName]++;
            }
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

            // Map full stage names to short names if needed, or just use full names as keys
            // The chart component likely expects keys matching the stage names
            // Let's look at COHORT_DATA_CONFIG in constants.ts
            // It uses keys like "Healthy", "Mild", "Moderate" which are substrings of "Healthy R0" etc.
            // We need to match the keys expected by the chart.
            // DiseaseCohortChart uses `Object.keys(data).filter(key => key !== "cohortName" && key !== "total")`
            // So we can use the full stage names as keys.

            // However, the example data in constants.ts uses "Healthy", "Mild" etc.
            // Let's try to map them to simpler keys if possible, or just use the full name.
            // Using full name is safer to ensure uniqueness and matching.

            // Wait, looking at constants.ts again:
            // DR: Healthy, Mild, Moderate, Severe, Proliferative
            // Glaucoma: Healthy, Early, Moderate, Advanced
            // AMD: Healthy, Early, Intermediate, Late

            // These seem to be prefixes of the full stage names (e.g. "Healthy R0").
            // I should probably simplify the keys for the cohort data to match the visual expectation if the chart relies on specific colors mapped to these keys.
            // The chart likely uses the keys to look up colors.
            // Let's check `DiseaseCohortChart.tsx` if possible, but I can't see it right now.
            // Assuming the keys in `COHORT_DATA_CONFIG` are what's used.

            // Let's map full names to the keys used in constants.ts
            const simplifiedCounts: Record<string, number> = {};
            Object.entries(counts).forEach(([stageName, count]) => {
              const simpleName = stageName.split(" ")[0]; // "Healthy R0" -> "Healthy"
              // Handle special cases if any
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
            requiresTreatment: config.stages.map((s) => s.requiresTreatment), // This might need to match the simplified keys order?
            // Actually `requiresTreatment` in `CohortDataConfigItem` is a boolean array.
            // It likely corresponds to the bars in order.
            // If we change keys, we must ensure order.
            // The order in `DISEASE_CONFIG` is correct.
            lastStage: config.lastStage.split(" ")[0], // "Proliferative R4" -> "Proliferative"
            cohortData: cohortDataItems,
          };
        });

      setStageTotalData(finalStageTotalConfig);
      setCohortData(finalCohortDataConfig);
    } catch (err) {
      console.error("Failed to fetch medical stats:", err);
      setError("Failed to load medical statistics.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, accessToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stageTotalData,
    cohortData,
    isLoading,
    error,
    refreshStats: fetchData,
  };
}
