"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import { getAllDiseases } from "@/server/services/disease";
import type { Disease, SharedDataContextType } from "../types";

// Re-export types for external use
export type { Disease };

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const SharedDataContext = createContext<SharedDataContextType | undefined>(
  undefined,
);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function SharedDataProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();

  // ─────────────────── Diseases State ───────────────────

  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [diseasesLoading, setDiseasesLoading] = useState(true);
  const [diseasesError, setDiseasesError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // ─────────────────── Fetch Diseases ───────────────────

  const fetchDiseases = useCallback(
    async (force = false) => {
      if (!accessToken) return;
      if (hasFetched && !force) return; // Skip if already fetched

      setDiseasesLoading(true);
      setDiseasesError(null);

      try {
        const data = await getAllDiseases(accessToken);
        setDiseases(data);
        setHasFetched(true);
      } catch (error) {
        setDiseasesError(
          `Error al cargar enfermedades: ${error instanceof Error ? error.message : "Error desconocido"}`,
        );
      } finally {
        setDiseasesLoading(false);
      }
    },
    [accessToken, hasFetched],
  );

  useEffect(() => {
    fetchDiseases();
  }, [fetchDiseases]);

  // ─────────────────── Actions ───────────────────

  const refreshDiseases = useCallback(async () => {
    await fetchDiseases(true); // Force refresh
  }, [fetchDiseases]);

  // ─────────────────── Derived Data ───────────────────

  const diseasesMap = useMemo(() => {
    const map = new Map<string, Disease>();
    diseases.forEach((disease) => map.set(disease.id, disease));
    return map;
  }, [diseases]);

  // ─────────────────── Context Value ───────────────────

  const value: SharedDataContextType = useMemo(
    () => ({
      diseases,
      diseasesLoading,
      diseasesError,
      refreshDiseases,
      diseasesMap,
    }),
    [diseases, diseasesLoading, diseasesError, refreshDiseases, diseasesMap],
  );

  return (
    <SharedDataContext.Provider value={value}>
      {children}
    </SharedDataContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useSharedData() {
  const context = useContext(SharedDataContext);
  if (context === undefined) {
    throw new Error("useSharedData must be used within a SharedDataProvider");
  }
  return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience Hook for Diseases
// ─────────────────────────────────────────────────────────────────────────────

export function useDiseases() {
  const { diseases, diseasesLoading, diseasesError, refreshDiseases } =
    useSharedData();
  return {
    diseases,
    isLoading: diseasesLoading,
    error: diseasesError,
    refreshDiseases,
  };
}
