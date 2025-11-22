"use client";

import { useState, useEffect } from "react";
import {
  getPatientsByUserId,
  createPatient as createPatientService,
} from "@/server/services/patient";
import { useAuth } from "@/contexts/auth-context";
import { translateErrorMessage } from "@/lib/error-translator";

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  clinicalConditions: string[];
  createdAt: Date;
  updatedAt: Date;
}

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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken) {
      fetchPatients(accessToken);
    }
  }, [accessToken]);

  const fetchPatients = async (token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPatientsByUserId(token);
      setPatients(data);
    } catch (err) {
      const errorMessage = translateErrorMessage(
        err instanceof Error ? err : new Error("Error al cargar los pacientes"),
      );
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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

  return {
    patients,
    selectedPatient,
    setSelectedPatient,
    isLoading,
    error,
    createPatient,
    refreshPatients: () => accessToken && fetchPatients(accessToken),
  };
}
