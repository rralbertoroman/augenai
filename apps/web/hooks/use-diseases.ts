"use client";

import { useState, useEffect } from "react";
import { getAllDiseases } from "@/server/services/disease";

export interface Disease {
  id: string;
  name: string;
  stages: string[];
  createdAt: Date;
  updatedAt: Date;
}

export function useDiseases() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    setIsLoading(true);
    try {
      const data = await getAllDiseases();
      setDiseases(data);
    } catch {
      // Error fetching diseases - keep diseases empty
      setDiseases([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    diseases,
    isLoading,
    refreshDiseases: fetchDiseases,
  };
}
