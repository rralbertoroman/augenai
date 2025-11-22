"use client";

import { useState, useEffect } from "react";

export interface Disease {
  id: string;
  name: string;
  value: string;
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
      const response = await fetch("/api/diseases");
      if (response.ok) {
        const data = await response.json();
        setDiseases(data);
      }
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
