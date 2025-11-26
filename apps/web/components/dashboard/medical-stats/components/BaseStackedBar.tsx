import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BaseStackedBarProps } from "../types";

interface TooltipPayload {
  name: string;
  value: number | string;
  payload: Record<string, unknown>;
  color: string;
  dataKey: string | number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    // Get the data point being hovered
    const dataPoint = payload[0]?.payload;

    // Filter out entries with zero values and sort them for consistent display
    const validEntries = payload
      .filter((entry) => {
        const value = Number(entry.value) || 0;
        return value > 0;
      })
      .reverse();

    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg text-sm">
        <p className="font-semibold mb-2">{label}</p>
        <div className="space-y-1">
          {validEntries.map((entry, index) => (
            <div key={`tooltip-${index}`} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium">{entry.name}:</span>
              <span className="ml-1">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const BaseStackedBar: React.FC<BaseStackedBarProps> = ({
  data,
  keys,
  colors,
  xKey = "name",
  stackId = "stack",
}) => {
  // Debug logs
  console.group("BaseStackedBar Debug");
  console.log("Data:", JSON.parse(JSON.stringify(data)));
  console.log("Keys:", keys);
  console.log("Colors:", colors);
  console.log("xKey:", xKey);

  // Calculate max value for Y-axis with a minimum of 1 to prevent errors
  const maxValue = Math.max(
    1, // Minimum value to ensure the chart renders
    ...data.map((item) =>
      keys.reduce((sum, key) => {
        const value = Number(item[key]) || 0;
        return sum + value;
      }, 0),
    ),
  );

  console.log("Max Value:", maxValue);
  console.groupEnd();

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          barGap={0}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} tickLine={false} />
          <YAxis
            domain={[0, maxValue]}
            tickFormatter={(value) =>
              Math.round(value) === value ? String(value) : ""
            }
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <RechartsTooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
          />
          {keys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              stackId={stackId}
              fill={colors[index % colors.length]}
              name={key}
              isAnimationActive={false}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
