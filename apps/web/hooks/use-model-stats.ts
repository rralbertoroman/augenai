import { useMemo } from "react";
import { useDashboard } from "@/contexts/dashboard-context";

export interface F1ScoreData {
  confidence: number;
  f1Score: number;
}

export interface ConfusionMatrixData {
  disease: string;
  stages: string[];
  matrix: number[][];
}

export function useModelStats() {
  const { predictions, predictionClasses, isLoading } = useDashboard();

  // Process data
  const stats = useMemo(() => {
    if (isLoading) {
      return {
        f1ScoreData: [],
        confusionMatrixData: [],
      };
    }
    
    if (!predictions.length || !predictionClasses.length) {
      throw new Error("No se pudieron cargar los datos del backend");
    }

    // Map classId to Disease and Stage
    const classMap = new Map<
      number,
      {
        diseaseId: string;
        diseaseName: string;
        stageIdx: number;
        stageName: string;
      }
    >();

    predictionClasses.forEach((pc) => {
      classMap.set(pc.classId, {
        diseaseId: pc.diseaseId,
        diseaseName: pc.diseaseName,
        stageIdx: pc.stageIdx,
        stageName: pc.diseaseStages[pc.stageIdx],
      });
    });

    // Group predictions by disease
    const predictionsByDisease = new Map<string, typeof predictions>();

    // Also collect all unique diseases to ensure we have a list
    const diseaseInfoMap = new Map<
      string,
      { name: string; stages: string[] }
    >();

    predictionClasses.forEach((pc) => {
      if (!diseaseInfoMap.has(pc.diseaseId)) {
        diseaseInfoMap.set(pc.diseaseId, {
          name: pc.diseaseName,
          stages: pc.diseaseStages,
        });
      }
    });

    predictions.forEach((p) => {
      // Let's use the classMap to find the disease for the PREDICTED class (original).
      const predictedClassId = p.class_id;
      const classInfo = classMap.get(predictedClassId);

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
        const predictedClassId = p.class_id;
        const actualClassId = mainFeedback ? mainFeedback.classId : p.class_id;

        const predictedInfo = classMap.get(predictedClassId);
        const actualInfo = classMap.get(actualClassId);

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

    // Calculate Global F1 Score vs Confidence
    // This is a bit complex as F1 is usually per class or per dataset at a threshold.
    // The chart expects F1 score at different confidence thresholds.
    // We need to iterate thresholds from 0 to 1.

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

        // If confidence < threshold, we treat it as "Negative" (or "None" if applicable)?
        // Or we just exclude it?
        // Usually in object detection/classification, if conf < threshold, it's not a positive prediction.
        // But here we have multi-class classification.
        // Let's assume if conf >= threshold, we accept the prediction.
        // If conf < threshold, we might consider it as "No Prediction" or "Background".
        // But we don't have a "Background" class explicitly in the stages usually unless "None" is stage 0.

        // Simplified logic:
        // If confidence >= threshold:
        //   If predicted == actual: TP
        //   If predicted != actual: FP
        // If confidence < threshold:
        //   It's a False Negative if there was an actual positive class?
        //   This is tricky for multi-class.

        // Let's stick to a simpler interpretation for this chart:
        // Calculate accuracy/F1 of the predictions that meet the threshold.

        if (confidence >= threshold) {
          if (predictedClassId === actualClassId) {
            tp++;
          } else {
            fp++;
          }
        } else {
          // If we dropped a prediction that was correct or incorrect?
          // If we don't predict, but there is a disease, it's FN.
          // Assuming "None" stage is negative?
          // Let's assume all predictions are "Positive" for some class.
          // If we filter it out, it's a FN for that class.
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

    return {
      f1ScoreData,
      confusionMatrixData,
    };
  }, [predictions, predictionClasses, isLoading]);

  return {
    ...stats,
    isLoading,
  };
}
