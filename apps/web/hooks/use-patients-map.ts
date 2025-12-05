"use client";

import { useMemo } from "react";
import {
  usePatients,
  type Patient,
} from "@/modules/patients/hooks/use-patients";

/**
 * Returns a map of patient IDs to patient info for fast lookups
 */
export function usePatientsMap(): Record<string, Patient> {
  const { patients } = usePatients();

  const patientsMap = useMemo<Record<string, Patient>>(() => {
    const map: Record<string, Patient> = {};
    patients.forEach((patient) => {
      map[patient.id] = patient;
    });
    return map;
  }, [patients]);

  return patientsMap;
}
