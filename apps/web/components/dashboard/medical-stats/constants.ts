import { ColorPalette, StageTotalConfig, CohortDataConfigItem } from "./types";

// Color palettes for light and dark modes
export const COLOR_PALETTE: ColorPalette = {
  light: {
    healthy: "#dcfce7",
    healthyText: "#166534",
    lastStage: "#4c0519",
    lastStageText: "#f9fafb",
    intermediateOranges: ["#fee7b7", "#f4d399", "#f0b981"],
    intermediateRed: ["#ef4444", "#dc0026", "#b91c1c"],
    gridColor: "#e5e7eb",
    axisText: "#6b7280",
    tooltipBg: "#ffffff",
    tooltipBorder: "#d1d5db",
    tooltipText: "#1f2937",
  },
  dark: {
    healthy: "#10b981",
    healthyText: "#ecfdf5",
    lastStage: "#9f1239",
    lastStageText: "#f9fafb",
    intermediateOranges: ["#fee7b7", "#f4d399", "#f0b981"],
    intermediateRed: ["#ef4444", "#dc0026", "#b91c1c"],
    gridColor: "#374151",
    axisText: "#9ca3af",
    tooltipBg: "#1f2937",
    tooltipBorder: "#4b5563",
    tooltipText: "#f9fafb",
  },
} as const;

// Original data structure for total counts per disease
export const STAGE_TOTAL_CONFIG: StageTotalConfig[] = [
  {
    name: "DR",
    displayName: "Diabetic Retinopathy",
    lastStage: "Proliferativa R4",
    stages: [
      { name: "Normal R0", count: 4, requiresTreatment: false },
      { name: "Leve R1", count: 5, requiresTreatment: false },
      { name: "Moderada R2", count: 7, requiresTreatment: false },
      { name: "Severo R3", count: 8, requiresTreatment: true },
      { name: "Proliferativa R4", count: 20, requiresTreatment: true },
    ],
  },
  {
    name: "Glaucoma",
    displayName: "Glaucoma",
    lastStage: "Avanzado G3",
    stages: [
      { name: "Normal G0", count: 4, requiresTreatment: false },
      { name: "Early G1", count: 10, requiresTreatment: true },
      { name: "Moderada G2", count: 7, requiresTreatment: true },
      { name: "Avanzado G3", count: 8, requiresTreatment: true },
    ],
  },
  {
    name: "AMD",
    displayName: "Age-related Macular Degeneration",
    lastStage: "Avanzado AMD3",
    stages: [
      { name: "Normal AMD0", count: 4, requiresTreatment: false },
      { name: "Early AMD1", count: 5, requiresTreatment: false },
      { name: "Intermedio AMD2", count: 7, requiresTreatment: false },
      { name: "Avanzado AMD3", count: 8, requiresTreatment: true },
    ],
  },
];

// Data structure for age cohort breakdown
export const COHORT_DATA_CONFIG: Omit<CohortDataConfigItem, "stageNames">[] = [
  {
    displayName: "Diabetic Retinopathy",
    requiresTreatment: [false, false, false, true, true],
    lastStage: "Proliferativa",
    cohortData: [
      {
        cohortName: "40-59",
        Normal: 2,
        Leve: 3,
        Moderada: 2,
        Severo: 1,
        Proliferativa: 1,
        total: 9,
      },
      {
        cohortName: "60-79",
        Normal: 1,
        Leve: 1,
        Moderada: 3,
        Severo: 4,
        Proliferativa: 10,
        total: 19,
      },
      {
        cohortName: "80+",
        Normal: 1,
        Leve: 1,
        Moderada: 2,
        Severo: 3,
        Proliferativa: 9,
        total: 16,
      },
    ],
  },
  {
    displayName: "Glaucoma",
    requiresTreatment: [false, true, true, true],
    lastStage: "Avanzado",
    cohortData: [
      {
        cohortName: "40-59",
        Normal: 3,
        Early: 2,
        Moderada: 1,
        Avanzado: 0,
        total: 6,
      },
      {
        cohortName: "60-79",
        Normal: 1,
        Early: 6,
        Moderada: 4,
        Avanzado: 3,
        total: 14,
      },
      {
        cohortName: "80+",
        Normal: 0,
        Early: 2,
        Moderada: 2,
        Avanzado: 5,
        total: 9,
      },
    ],
  },
  {
    displayName: "Age-related Macular Degeneration",
    requiresTreatment: [false, false, false, true],
    lastStage: "Avanzado",
    cohortData: [
      {
        cohortName: "60-79",
        Normal: 3,
        Early: 2,
        Intermedio: 4,
        Avanzado: 1,
        total: 10,
      },
      {
        cohortName: "80+",
        Normal: 1,
        Early: 3,
        Intermedio: 3,
        Avanzado: 7,
        total: 14,
      },
    ],
  },
] as const;
