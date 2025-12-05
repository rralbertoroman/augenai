"use client";

import { usePatients } from "@/modules/patients/contexts";

/**
 * Returns a record of patient IDs to patient info for fast lookups
 * @deprecated Use usePatients().patientsMap instead
 */
export function usePatientsMap(): Record<
  string,
  ReturnType<typeof usePatients>["allPatients"][number]
> {
  const { patientsMap } = usePatients();

  // Convert Map to Record for backward compatibility
  const record: Record<
    string,
    ReturnType<typeof usePatients>["allPatients"][number]
  > = {};
  patientsMap.forEach((patient, id) => {
    record[id] = patient;
  });
  return record;
}
