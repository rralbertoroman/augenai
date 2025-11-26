import { ColorPalette, StageTotalConfig, CohortDataConfigItem } from './types';

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
    tooltipText: "#1f2937"
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
    tooltipText: "#f9fafb"
  }
} as const;

// Original data structure for total counts per disease
export const STAGE_TOTAL_CONFIG: StageTotalConfig[] = [
  {
    name: "DR",
    displayName: "Diabetic Retinopathy",
    lastStage: "Proliferative R4",
    stages: [
      {name: "Healthy R0", count: 4, requiresTreatment: false},
      {name: "Mild R1", count: 5, requiresTreatment: false},
      {name: "Moderate R2", count: 7, requiresTreatment: false},
      {name: "Severe R3", count: 8, requiresTreatment: true},
      {name: "Proliferative R4", count: 20, requiresTreatment: true}
    ]
  },
  {
    name: "Glaucoma",
    displayName: "Glaucoma",
    lastStage: "Advanced G3",
    stages: [
      {name: "Healthy G0", count: 4, requiresTreatment: false},
      {name: "Early G1", count: 10, requiresTreatment: true},
      {name: "Moderate G2", count: 7, requiresTreatment: true},
      {name: "Advanced G3", count: 8, requiresTreatment: true}
    ]
  },
  {
    name: "AMD",
    displayName: "Age-related Macular Degeneration",
    lastStage: "Late AMD3",
    stages: [
      {name: "Healthy AMD0", count: 4, requiresTreatment: false},
      {name: "Early AMD1", count: 5, requiresTreatment: false},
      {name: "Intermediate AMD2", count: 7, requiresTreatment: false},
      {name: "Late AMD3", count: 8, requiresTreatment: true}
    ]
  }
];

// Data structure for age cohort breakdown
export const COHORT_DATA_CONFIG: Omit<CohortDataConfigItem, 'stageNames'>[] = [
  {
    displayName: "Diabetic Retinopathy",
    requiresTreatment: [false, false, false, true, true],
    lastStage: "Proliferative",
    cohortData: [
      { cohortName: "40-59", Healthy: 2, Mild: 3, Moderate: 2, Severe: 1, Proliferative: 1, total: 9 },
      { cohortName: "60-79", Healthy: 1, Mild: 1, Moderate: 3, Severe: 4, Proliferative: 10, total: 19 },
      { cohortName: "80+", Healthy: 1, Mild: 1, Moderate: 2, Severe: 3, Proliferative: 9, total: 16 },
    ]
  },
  {
    displayName: "Glaucoma",
    requiresTreatment: [false, true, true, true],
    lastStage: "Advanced",
    cohortData: [
      { cohortName: "40-59", Healthy: 3, Early: 2, Moderate: 1, Advanced: 0, total: 6 },
      { cohortName: "60-79", Healthy: 1, Early: 6, Moderate: 4, Advanced: 3, total: 14 },
      { cohortName: "80+", Healthy: 0, Early: 2, Moderate: 2, Advanced: 5, total: 9 },
    ]
  },
  {
    displayName: "Age-related Macular Degeneration",
    requiresTreatment: [false, false, false, true],
    lastStage: "Late",
    cohortData: [
      { cohortName: "60-79", Healthy: 3, Early: 2, Intermediate: 4, Late: 1, total: 10 },
      { cohortName: "80+", Healthy: 1, Early: 3, Intermediate: 3, Late: 7, total: 14 },
    ]
  }
] as const;
