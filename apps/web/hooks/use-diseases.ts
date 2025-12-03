"use client";

import { useState, useEffect } from "react";
import { getAllDiseases } from "@/server/services/disease";
import { useAuth } from "@/contexts/auth-context";

export interface Disease {
  id: string;
  name: string;
  stages: string[];
  createdAt: Date;
  updatedAt: Date;
}

export function useDiseases() {
  const { accessToken } = useAuth();
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDiseases = async (token: string) => {
    setIsLoading(true);
    try {
      const data = await getAllDiseases(token);
      setDiseases(data);
    } catch (error) {
      // Error fetching diseases - throw error instead of hiding it
      throw new Error(`Error al cargar enfermedades: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchDiseases(accessToken);
    }
  }, [accessToken]);

  return {
    diseases,
    isLoading,
    refreshDiseases: () => accessToken && fetchDiseases(accessToken),
  };
}
