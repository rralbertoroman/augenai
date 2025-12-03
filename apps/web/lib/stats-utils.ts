import type { TaskWithExtras } from "@/server/zod-schemas/prediction_workflow";
import type { PredictionClassDiseaseWithDisease } from "@/server/zod-schemas/prediction_class_disease";
import { calculateAge, getCohort } from "./date-utils";

// ==================== MODEL STATS ====================

export interface F1ScoreData {
  confidence: number;
  f1Score: number;
}

export interface ConfusionMatrixData {
  disease: string;
  stages: string[];
  matrix: number[][];
}

/**
 * Calculate F1 Score data across different confidence thresholds
 */
export function calculateF1ScoreData(
  predictions: TaskWithExtras[],
): F1ScoreData[] {
  const f1ScoreData: F1ScoreData[] = [];
  const thresholds = Array.from({ length: 20 }, (_, i) => (i + 1) * 0.05); // 0.05 to 1.0

  thresholds.forEach((threshold) => {
    let tp = 0;
    let fp = 0;
    let fn = 0;

    predictions.forEach((p) => {
      const mainFeedback = p.feedbacks?.find((f) => f.isMainData);
      const predictedClassId = p.class_id;
      const actualClassId = mainFeedback ? mainFeedback.classId : p.class_id;
      const confidence = p.confidence;

      if (confidence >= threshold) {
        if (predictedClassId === actualClassId) {
          tp++;
        } else {
          fp++;
        }
      } else {
        fn++;
      }
    });

    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1 = (2 * (precision * recall)) / (precision + recall) || 0;

    f1ScoreData.push({
      confidence: threshold,
      f1Score: f1,
    });
  });

  return f1ScoreData;
}

/**
 * Calculate confusion matrices for each disease
 */
export function calculateConfusionMatrices(
  predictions: TaskWithExtras[],
  predictionClasses: PredictionClassDiseaseWithDisease[],
): ConfusionMatrixData[] {
  // Map modelId-classId to Disease and Stage (composite key)
  const classMap = new Map<
    string,
    {
      diseaseId: string;
      diseaseName: string;
      stageIdx: number;
      stageName: string;
    }
  >();

  // Build classMap using composite key: modelId-classId
  predictionClasses.forEach((pc) => {
    const compositeKey = `${pc.modelId}-${pc.classId}`;
    classMap.set(compositeKey, {
      diseaseId: pc.diseaseId,
      diseaseName: pc.diseaseName,
      stageIdx: pc.stageIdx,
      stageName: pc.diseaseStages[pc.stageIdx],
    });
  });

  // Group predictions by disease
  const predictionsByDisease = new Map<string, typeof predictions>();
  const diseaseInfoMap = new Map<string, { name: string; stages: string[] }>();

  predictionClasses.forEach((pc) => {
    if (!diseaseInfoMap.has(pc.diseaseId)) {
      diseaseInfoMap.set(pc.diseaseId, {
        name: pc.diseaseName,
        stages: pc.diseaseStages,
      });
    }
  });

  // Map predictions using composite key: model_id-class_id
  predictions.forEach((p) => {
    const compositeKey = `${p.model_id}-${p.class_id}`;
    const classInfo = classMap.get(compositeKey);

    if (classInfo) {
      const diseaseId = classInfo.diseaseId;
      if (!predictionsByDisease.has(diseaseId)) {
        predictionsByDisease.set(diseaseId, []);
      }
      predictionsByDisease.get(diseaseId)?.push(p);
    }
  });

  const confusionMatrixData: ConfusionMatrixData[] = [];

  diseaseInfoMap.forEach((info, diseaseId) => {
    const diseasePredictions = predictionsByDisease.get(diseaseId);
    const stages = info.stages;
    const matrix = Array(stages.length)
      .fill(0)
      .map(() => Array(stages.length).fill(0));

    diseasePredictions?.forEach((p) => {
      const mainFeedback = p.feedbacks?.find((f) => f.isMainData);
      const predictedCompositeKey = `${p.model_id}-${p.class_id}`;
      const actualCompositeKey = mainFeedback
        ? `${p.model_id}-${mainFeedback.classId}`
        : predictedCompositeKey;

      const predictedInfo = classMap.get(predictedCompositeKey);
      const actualInfo = classMap.get(actualCompositeKey);

      if (predictedInfo && actualInfo) {
        // Row = Actual, Col = Predicted
        if (
          actualInfo.stageIdx < stages.length &&
          predictedInfo.stageIdx < stages.length
        ) {
          matrix[actualInfo.stageIdx][predictedInfo.stageIdx]++;
        }
      }
    });

    confusionMatrixData.push({
      disease: info.name,
      stages: stages,
      matrix: matrix,
    });
  });

  return confusionMatrixData;
}

// ==================== MEDICAL STATS ====================

export interface StageTotalConfig {
  name: string;
  displayName: string;
  lastStage: string;
  stages: {
    name: string;
    count: number;
    requiresTreatment: boolean;
  }[];
}

export interface CohortData {
  cohortName: string;
  total: number;
  [key: string]: string | number; // For simplified stage counts
}

export interface CohortDataConfigItem {
  displayName: string;
  requiresTreatment: boolean[];
  lastStage: string;
  cohortData: CohortData[];
}

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

/**
 * Calculate stage total distribution for all diseases
 */
export function calculateStageTotals(
  predictions: TaskWithExtras[],
): StageTotalConfig[] {
  const stageTotals: Record<string, Record<string, number>> = {
    "Retinopatía Diabética": {},
    Glaucoma: {},
    "Age-related Macular Degeneration": {},
  };

  // Initialize counts to 0
  Object.entries(DISEASE_CONFIG).forEach(([key, config]) => {
    config.stages.forEach((stage) => {
      stageTotals[key][stage.name] = 0;
    });
  });

  // Process predictions
  predictions.forEach((p) => {
    if (!("disease_name" in p)) return;
    const diseaseKey = p.disease_name;
    if (!diseaseKey) return;

    const stageName = p.stage_content;

    if (
      stageTotals[diseaseKey] &&
      stageTotals[diseaseKey][stageName] !== undefined
    ) {
      stageTotals[diseaseKey][stageName]++;
    }
  });

  // Transform to final config structures
  return Object.entries(DISEASE_CONFIG).map(([key, config]) => ({
    name: config.name,
    displayName: config.displayName,
    lastStage: config.lastStage,
    stages: config.stages.map((stage) => ({
      name: stage.name,
      count: stageTotals[key][stage.name],
      requiresTreatment: stage.requiresTreatment,
    })),
  }));
}

/**
 * Calculate cohort data for all diseases
 */
export function calculateCohortData(
  predictions: TaskWithExtras[],
): Omit<CohortDataConfigItem, "stageNames">[] {
  const cohortCounts: Record<string, Record<string, Record<string, number>>> = {
    "Retinopatía Diabética": {},
    Glaucoma: {},
    "Age-related Macular Degeneration": {},
  };

  // Initialize counts to 0
  Object.entries(DISEASE_CONFIG).forEach(([key, config]) => {
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
    if (!("disease_name" in p)) return;
    const diseaseKey = p.disease_name;
    if (!diseaseKey) return;

    const stageName = p.stage_content;
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
  return Object.entries(DISEASE_CONFIG).map(([key, config]) => {
    const cohortDataItems: CohortData[] = COHORTS.map((cohortName) => {
      const counts = cohortCounts[key][cohortName];
      const total = Object.values(counts).reduce((a, b) => a + b, 0);

      const simplifiedCounts: Record<string, number> = {};
      Object.entries(counts).forEach(([stageName, count]) => {
        const simpleName = stageName.split(" ")[0];
        simplifiedCounts[simpleName] =
          (simplifiedCounts[simpleName] ?? 0) + count;
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
}
