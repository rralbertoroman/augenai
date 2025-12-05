import type { PatientDTO } from "@/server/zod-schemas/patient";
import type { usePagination } from "@/hooks/use-pagination";

// ─────────────────────────────────────────────────────────────────────────────
// Entity Types
// ─────────────────────────────────────────────────────────────────────────────

export type Patient = PatientDTO;

// ─────────────────────────────────────────────────────────────────────────────
// Form Data Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CreatePatientData {
  name: string;
  dateOfBirth: string;
  gender: string;
  clinicalConditions: string[];
}

export interface UpdatePatientData {
  name?: string;
  dateOfBirth?: string;
  gender?: string;
  clinicalConditions?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Context Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PatientsContextType {
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
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const INITIAL_PAGE_SIZE = 10;
