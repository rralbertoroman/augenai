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
      console.log("Fetching predictions from /api/predictions/list");
      const response = await fetch("/api/predictions/list");
      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Predictions fetched:", data);
        // Transform dates
        const transformedData = data.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }));
        setPredictions(transformedData);
      } else {
        try {
          const errorData = await response.json();
          console.error("Failed to fetch predictions:", errorData);
        } catch {
          console.error("Failed to fetch predictions. Status:", response.status);
        }
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
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
