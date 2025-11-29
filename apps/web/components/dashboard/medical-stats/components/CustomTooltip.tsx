import React from "react";
import { CustomTooltipProps } from "../types";
import { useThemeColors } from "../utils";

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  const colors = useThemeColors();

  if (active && payload && payload.length) {
    const dataItem = payload[0].payload as Record<string, unknown>;
    const customName = (dataItem.displayName ||
      dataItem.cohortName ||
      label) as string;

    return (
      <div
        className="p-3 rounded-lg shadow-xl text-sm"
        style={{
          backgroundColor: colors.tooltipBg,
          border: `1px solid ${colors.tooltipBorder}`,
          color: colors.tooltipText,
        }}
      >
        <p className="font-bold mb-1">{customName}</p>
        <p className="text-xs opacity-80 mb-2">
          Pacientes Totales:{" "}
          {typeof dataItem.total === "number"
            ? dataItem.total.toLocaleString()
            : String(dataItem.total || "0")}
        </p>
        {payload.map(
          (p, index) =>
            Number(p.value) > 0 && (
              <p
                key={index}
                style={{ color: p.color }}
                className="flex justify-between"
              >
                <span className="font-medium mr-2">{p.name}:</span>
                <span>
                  {typeof p.value === "number"
                    ? p.value.toLocaleString()
                    : p.value}
                </span>
              </p>
            ),
        )}
      </div>
    );
  }
  return null;
};
