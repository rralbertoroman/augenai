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
    } catch {
      // Error fetching diseases - keep diseases empty
      setDiseases([]);
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
