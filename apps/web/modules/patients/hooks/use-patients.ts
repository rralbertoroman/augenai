"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getPatientsByUserId,
  createPatient as createPatientService,
  updatePatient as updatePatientService,
} from "@/server/services/patient";
import type { PatientDTO } from "@/server/zod-schemas/patient";
import { useAuth } from "@/contexts/auth-context";
import { translateErrorMessage } from "@/lib/error-translator";
import { usePagination } from "@/hooks/use-pagination";

// Re-export the DTO type as Patient for convenience
export type Patient = PatientDTO;

const INITIAL_PAGE_SIZE = 10;

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

// Gender translation constants
const GENDER_TRANSLATIONS: Record<string, string> = {
  male: "Masculino",
  female: "Femenino",
} as const;

export function translateGender(gender: string): string {
  return GENDER_TRANSLATIONS[gender.toLowerCase()] || gender;
}

export function usePatients() {
  const { accessToken } = useAuth();
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pagination = usePagination(INITIAL_PAGE_SIZE);
  const { setTotalItems } = pagination;

  // Fetch all patients once
  const fetchPatients = useCallback(
    async (token: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const { patients: data } = await getPatientsByUserId(token);
        setAllPatients(data);
        setTotalItems(data.length);
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
    [setTotalItems],
  );

  useEffect(() => {
    if (accessToken) {
      fetchPatients(accessToken);
    }
  }, [accessToken, fetchPatients]);

  // Client-side pagination: slice the patients array based on current page
  const patients = useMemo(() => {
    const start = pagination.offset;
    const end = start + pagination.pageSize;
    return allPatients.slice(start, end);
  }, [allPatients, pagination.offset, pagination.pageSize]);

  const createPatient = async (data: {
    name: string;
    dateOfBirth: string;
    gender: string;
    clinicalConditions: string[];
  }) => {
    try {
      setError(null);
      if (!accessToken) {
        throw new Error("Usuario no autenticado");
      }
      await createPatientService(accessToken, {
        ...data,
      });
      pagination.reset();
      await fetchPatients(accessToken);
      return true;
    } catch (err) {
      const errorMessage = translateErrorMessage(
        err instanceof Error ? err : new Error("Error al crear el paciente"),
      );
      setError(errorMessage);
      return false;
    }
  };

  const updatePatient = async (
    patientId: string,
    data: {
      name?: string;
      dateOfBirth?: string;
      gender?: string;
      clinicalConditions?: string[];
    },
  ) => {
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

      // Update local state if the updated patient is the selected one
      if (selectedPatient?.id === patientId) {
        setSelectedPatient(updatedPatient);
      }

      await fetchPatients(accessToken);
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
  };

  return {
    patients,
    allPatients,
    selectedPatient,
    setSelectedPatient,
    isLoading,
    error,
    createPatient,
    updatePatient,
    refreshPatients: () => accessToken && fetchPatients(accessToken),
    pagination,
  };
}
