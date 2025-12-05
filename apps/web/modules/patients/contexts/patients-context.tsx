"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  getPatientsByUserId,
  createPatient as createPatientService,
  updatePatient as updatePatientService,
} from "@/server/services/patient";
import type { PatientDTO } from "@/server/zod-schemas/patient";
import { translateErrorMessage } from "@/lib/error-translator";
import { usePagination } from "@/hooks/use-pagination";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type Patient = PatientDTO;

interface CreatePatientData {
  name: string;
  dateOfBirth: string;
  gender: string;
  clinicalConditions: string[];
}

interface UpdatePatientData {
  name?: string;
  dateOfBirth?: string;
  gender?: string;
  clinicalConditions?: string[];
}

interface PatientsContextType {
  // Data
  patients: Patient[];
  allPatients: Patient[];
  selectedPatient: Patient | null;
  patientsMap: Map<string, Patient>;

  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedPatient: (patient: Patient | null) => void;
  createPatient: (data: CreatePatientData) => Promise<boolean>;
  updatePatient: (
    patientId: string,
    data: UpdatePatientData,
  ) => Promise<boolean>;
  refreshPatients: () => Promise<void>;
  clearError: () => void;

  // Pagination
  pagination: ReturnType<typeof usePagination>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const PatientsContext = createContext<PatientsContextType | undefined>(
  undefined,
);

const INITIAL_PAGE_SIZE = 10;

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

const GENDER_TRANSLATIONS: Record<string, string> = {
  male: "Masculino",
  female: "Femenino",
} as const;

export function translateGender(gender: string): string {
  return GENDER_TRANSLATIONS[gender.toLowerCase()] || gender;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function PatientsProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();

  // State
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Pagination
  const pagination = usePagination(INITIAL_PAGE_SIZE);
  const { setTotalItems } = pagination;

  // ─────────────────── Data Fetching ───────────────────

  const fetchPatients = useCallback(
    async (token: string, force = false) => {
      if (hasFetched && !force) return; // Skip if already fetched

      setIsLoading(true);
      setError(null);
      try {
        const { patients: data } = await getPatientsByUserId(token);
        setAllPatients(data);
        setTotalItems(data.length);
        setHasFetched(true);
      } catch (err) {
        const errorMessage = translateErrorMessage(
          err instanceof Error
            ? err
            : new Error("Error al cargar los pacientes"),
        );
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [setTotalItems, hasFetched],
  );

  useEffect(() => {
    if (accessToken) {
      fetchPatients(accessToken);
    }
  }, [accessToken, fetchPatients]);

  // ─────────────────── Derived Data ───────────────────

  // Client-side pagination
  const patients = useMemo(() => {
    const start = pagination.offset;
    const end = start + pagination.pageSize;
    return allPatients.slice(start, end);
  }, [allPatients, pagination.offset, pagination.pageSize]);

  // ID -> Patient map for quick lookups
  const patientsMap = useMemo(() => {
    const map = new Map<string, Patient>();
    allPatients.forEach((patient) => {
      map.set(patient.id, patient);
    });
    return map;
  }, [allPatients]);

  // ─────────────────── CRUD Operations ───────────────────

  const createPatient = useCallback(
    async (data: CreatePatientData): Promise<boolean> => {
      try {
        setError(null);
        if (!accessToken) {
          throw new Error("Usuario no autenticado");
        }
        await createPatientService(accessToken, data);
        pagination.reset();
        await fetchPatients(accessToken, true); // Force refresh
        return true;
      } catch (err) {
        const errorMessage = translateErrorMessage(
          err instanceof Error ? err : new Error("Error al crear el paciente"),
        );
        setError(errorMessage);
        return false;
      }
    },
    [accessToken, fetchPatients, pagination],
  );

  const updatePatient = useCallback(
    async (patientId: string, data: UpdatePatientData): Promise<boolean> => {
      try {
        setError(null);
        if (!accessToken) {
          throw new Error("Usuario no autenticado");
        }
        const updatedPatient = await updatePatientService(
          accessToken,
          patientId,
          data,
        );

        // Update selected patient if it's the one being updated
        if (selectedPatient?.id === patientId) {
          setSelectedPatient(updatedPatient);
        }

        await fetchPatients(accessToken, true); // Force refresh
        return true;
      } catch (err) {
        const errorMessage = translateErrorMessage(
          err instanceof Error
            ? err
            : new Error("Error al actualizar el paciente"),
        );
        setError(errorMessage);
        return false;
      }
    },
    [accessToken, fetchPatients, selectedPatient],
  );

  const refreshPatients = useCallback(async () => {
    if (accessToken) {
      await fetchPatients(accessToken, true); // Force refresh
    }
  }, [accessToken, fetchPatients]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ─────────────────── Context Value ───────────────────

  const value: PatientsContextType = useMemo(
    () => ({
      patients,
      allPatients,
      selectedPatient,
      patientsMap,
      isLoading,
      error,
      setSelectedPatient,
      createPatient,
      updatePatient,
      refreshPatients,
      clearError,
      pagination,
    }),
    [
      patients,
      allPatients,
      selectedPatient,
      patientsMap,
      isLoading,
      error,
      createPatient,
      updatePatient,
      refreshPatients,
      clearError,
      pagination,
    ],
  );

  return (
    <PatientsContext.Provider value={value}>
      {children}
    </PatientsContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function usePatients() {
  const context = useContext(PatientsContext);
  if (context === undefined) {
    throw new Error("usePatients must be used within a PatientsProvider");
  }
  return context;
}
