export interface Stage {
  name: string;
  count: number;
  requiresTreatment: boolean;
}

export interface StageTotalConfig {
  name: string;
  displayName: string;
  lastStage: string;
  stages: Stage[];
}

export interface CohortData {
  cohortName: string;
  [key: string]: string | number;
  total: number;
}

export interface CohortDataConfigItem {
  displayName: string;
  requiresTreatment: boolean[];
  lastStage: string;
  cohortData: CohortData[];
  stageNames?: string[];
}

export interface TooltipPayload {
  name: string;
  value: number | string;
  payload: Record<string, unknown>;
  color: string;
  dataKey: string | number;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
  className?: string;
}

export interface CohortDataConfig {
  displayName: string;
  requiresTreatment: boolean[];
  lastStage: string;
  cohortData: CohortData[];
  stageNames?: string[];
}

export interface ColorPalette {
  light: {
    healthy: string;
    healthyText: string;
    lastStage: string;
    lastStageText: string;
    intermediateOranges: string[];
    intermediateRed: string[];
    gridColor: string;
    axisText: string;
    tooltipBg: string;
    tooltipBorder: string;
    tooltipText: string;
  };
  dark: {
    healthy: string;
    healthyText: string;
    lastStage: string;
    lastStageText: string;
    intermediateOranges: string[];
    intermediateRed: string[];
    gridColor: string;
    axisText: string;
    tooltipBg: string;
    tooltipBorder: string;
    tooltipText: string;
  };
}

export interface BaseStackedBarProps {
  data: Record<string, unknown>[];
  keys: string[];
  colors: string[];
  xKey: string;
  stackId?: string;
}

export interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string;
    payload: Record<string, unknown>;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}
