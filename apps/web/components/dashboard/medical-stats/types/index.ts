import { TooltipProps } from "recharts";

export interface Stage {
  name: string;
  count: number;
  requiresTreatment: boolean;
}

export interface BaseConfig {
  displayName: string;
  lastStage: string;
}

export interface StageTotalConfig extends BaseConfig {
  name: string;
  stages: Stage[];
  cohortData?: never;
}

export interface CohortData {
  cohortName: string;
  [key: string]: string | number;
  total: number;
}

export interface CohortDataConfig extends BaseConfig {
  cohortData: CohortData[];
  stages?: never;
  requiresTreatment?: boolean[];
  name?: never;
}

export interface CohortDataConfigItem extends BaseConfig {
  requiresTreatment: boolean[];
  cohortData: CohortData[];
  stageNames?: string[];
}

export interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      displayName?: string;
      cohortName?: string;
      total: number;
      [key: string]: string | number | undefined;
    };
    color: string;
  }>;
  label?: string;
}

export interface BaseStackedBarProps {
  data: Array<Record<string, number | string>>;
  keys: string[];
  colors: string[];
  xKey: string;
  stackId?: string;
}

export interface ChartProps<T> {
  dataConfig: T;
  xKey: string;
  title: string;
}

export interface StageTotalChartProps {
  dataConfig: StageTotalConfig | StageTotalConfig[];
  xKey?: string;
  title?: string;
}

export interface CohortChartProps {
  dataConfig: CohortDataConfig | CohortDataConfig[];
  xKey?: string;
  title?: string;
}

export interface DiseaseCohortChartProps {
  diseaseData: CohortDataConfigItem;
}

export interface ColorPalette {
  light: ThemeColors;
  dark: ThemeColors;
}

export interface ThemeColors {
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
}
