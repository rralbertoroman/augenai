"use client";

import { useState, useEffect } from "react";

export interface Prediction {
  id: string;
  patientId: string;
  patientName: string;
  diseaseId: string;
  stageIdx: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export function usePredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedPrediction, setSelectedPrediction] =
    useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/predictions/list");

      if (response.ok) {
        const data = await response.json();
        // Transform dates
        const transformedData = data.map((item: Prediction) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }));
        setPredictions(transformedData);
<<<<<<< HEAD
=======
      } else {
        try {
          const errorData = await response.json();
          console.error("Failed to fetch predictions:", errorData);
        } catch {
          console.error(
            "Failed to fetch predictions. Status:",
            response.status,
          );
        }
>>>>>>> 82e7714 (feat: prediction sharing module)
      }
    } catch {
      // Error fetching predictions
    } finally {
      setIsLoading(false);
    }
  };

  return {
    predictions,
    selectedPrediction,
    setSelectedPrediction,
    isLoading,
    refreshPredictions: fetchPredictions,
  };
}
