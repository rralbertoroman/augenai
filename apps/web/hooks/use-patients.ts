"use client";

import { useState, useEffect } from "react";

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  clinicalConditions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/patients");
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch {
      // Error fetching patients
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
    const response = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      await fetchPatients();
      return true;
    }
    return false;
  };

  return {
    patients,
    selectedPatient,
    setSelectedPatient,
    isLoading,
    createPatient,
    refreshPatients: fetchPatients,
  };
}
