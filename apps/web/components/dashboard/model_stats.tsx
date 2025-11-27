"use client";

import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
type DiseaseType = "DR" | "AMD" | "Glaucoma" | "RVO" | "Uveitis";

interface F1ScoreData {
  confidence: number;
  f1Score: number;
}

interface ConfusionMatrixData {
  disease: string;
  stages: string[];
  matrix: number[][];
}

// Mock data - Replace with actual data from your API
const f1ScoreData: F1ScoreData[] = Array.from({ length: 20 }, (_, i) => ({
  confidence: (i + 1) * 0.05, // 0.05 to 1.0
  f1Score: Math.min(1, 0.7 + Math.random() * 0.3) * (0.5 + (i + 1) * 0.025),
}));

const confusionMatrixData: ConfusionMatrixData[] = [
  {
    disease: "Diabetic Retinopathy (DR)",
    stages: [
      "Normal R0",
      "Mild R1",
      "Moderate R2",
      "Severe R3",
      "Proliferative R4",
    ],
    matrix: [
      [85, 5, 3, 2, 5],
      [4, 82, 6, 3, 5],
      [3, 5, 80, 7, 5],
      [2, 3, 6, 84, 5],
      [1, 2, 4, 3, 90],
    ],
  },
  {
    disease: "Age-related Macular Degeneration (AMD)",
    stages: ["None", "Early", "Intermediate", "Advanced"],
    matrix: [
      [90, 5, 3, 2],
      [4, 85, 7, 4],
      [3, 6, 82, 9],
      [1, 2, 5, 92],
    ],
  },
  {
    disease: "Glaucoma",
    stages: ["None", "Early", "Moderate", "Severe"],
    matrix: [
      [88, 6, 3, 3],
      [5, 84, 7, 4],
      [3, 5, 86, 6],
      [2, 3, 4, 91],
    ],
  },
  {
    disease: "Retinal Vein Occlusion (RVO)",
    stages: ["None", "Branch RVO", "Central RVO", "Hemispheric RVO"],
    matrix: [
      [92, 4, 2, 2],
      [3, 89, 5, 3],
      [2, 4, 88, 6],
      [1, 2, 3, 94],
    ],
  },
  {
    disease: "Uveitis",
    stages: ["None", "Anterior", "Intermediate", "Posterior", "Panuveitis"],
    matrix: [
      [90, 4, 3, 2, 1],
      [3, 86, 5, 4, 2],
      [2, 5, 87, 4, 2],
      [1, 3, 4, 89, 3],
      [1, 2, 3, 5, 89],
    ],
  },
];

// Calculate AUC (Area Under Curve)
const calculateAUC = (data: F1ScoreData[]): number => {
  let auc = 0;
  for (let i = 1; i < data.length; i++) {
    auc +=
      ((data[i].f1Score + data[i - 1].f1Score) / 2) *
      (data[i].confidence - data[i - 1].confidence);
  }
  return auc;
};

const auc = calculateAUC(f1ScoreData);

// Chart components
const F1ScoreChart = () => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle>F1-Score vs Confidence</CardTitle>
    </CardHeader>
    <CardContent className="h-80">
      <div className="text-sm text-muted-foreground mb-2">
        AUC: {auc.toFixed(3)}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={f1ScoreData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="confidence"
            label={{
              value: "Confidence Threshold",
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis
            label={{
              value: "F1-Score",
              angle: -90,
              position: "insideLeft",
            }}
            domain={[0, 1]}
          />
          <Tooltip
            formatter={(value: number) => [value.toFixed(3), "F1-Score"]}
            labelFormatter={(label) => `Confidence: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="f1Score"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
            name="F1-Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const ConfusionMatrixChart = ({ data }: { data: ConfusionMatrixData }) => {
  const currentData = data;

  // Calculate total for each row to show percentages
  const getCellColor = (value: number, rowIndex: number, colIndex: number) => {
    const rowSum = currentData.matrix[rowIndex].reduce((a, b) => a + b, 0);
    const percentage = (value / rowSum) * 100;

    // Diagonal elements (correct classifications)
    if (rowIndex === colIndex) {
      if (percentage > 80) return "#4CAF50";
      if (percentage > 50) return "#8BC34A";
      return "#FFC107";
    }

    // Off-diagonal elements (misclassifications)
    if (percentage > 20) return "#F44336";
    if (percentage > 5) return "#FF9800";
    return "#FFC107";
  };

  return (
    <Card className="w-full bg-background">
      <CardHeader>
        <CardTitle className="text-foreground">
          Confusion Matrix - {data.disease}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Rows show actual stages, columns show predicted stages
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-muted/50 dark:bg-muted/20">
                  <div className="text-sm font-medium text-foreground">
                    Actual \ Predicted
                  </div>
                </th>
                {currentData.stages.map((stage, i) => (
                  <th
                    key={i}
                    className="border p-2 bg-muted/50 dark:bg-muted/20"
                  >
                    <div className="text-sm font-medium text-foreground whitespace-nowrap">
                      {stage}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.matrix.map((row, rowIndex) => {
                const rowSum = currentData.matrix[rowIndex].reduce(
                  (a, b) => a + b,
                  0,
                );
                return (
                  <tr key={rowIndex}>
                    <td className="border p-2 text-sm font-medium whitespace-nowrap bg-muted/30 dark:bg-muted/10">
                      <span className="text-foreground">
                        {currentData.stages[rowIndex]}
                      </span>
                    </td>
                    {row.map((cell, colIndex) => {
                      const percentage =
                        rowSum > 0 ? Math.round((cell / rowSum) * 100) : 0;
                      const isDiagonal = rowIndex === colIndex;

                      const cellColor = getCellColor(cell, rowIndex, colIndex);
                      let hoverColor = "";

                      if (cellColor === "#4CAF50")
                        hoverColor = "group-hover:bg-green-500";
                      else if (cellColor === "#F44336")
                        hoverColor = "group-hover:bg-red-500";
                      else hoverColor = "group-hover:bg-black-500";

                      return (
                        <td
                          key={`${rowIndex}-${colIndex}`}
                          className={`
                            border p-2 text-center text-sm relative group
                            ${
                              isDiagonal
                                ? "bg-green-50 dark:bg-green-900/20"
                                : "bg-background hover:bg-muted/20 dark:bg-card dark:hover:bg-muted/30"
                            }
                            ${cell > 0 ? "font-medium" : "text-muted-foreground/30 dark:text-muted-foreground/40"}
                          `}
                          title={`Predicted: ${currentData.stages[colIndex]}
Actual: ${currentData.stages[rowIndex]}
Count: ${cell}
Percentage: ${percentage}%`}
                        >
                          <div className="relative">
                            <div
                              className={`
                              ${
                                isDiagonal
                                  ? "text-green-700 dark:text-green-300"
                                  : "text-foreground"
                              }
                              ${cell > 0 ? "opacity-100" : "opacity-30"}
                            `}
                            >
                              {cell}
                            </div>
                            <div
                              className={`
                              text-[10px] mt-[-2px] 
                              ${
                                isDiagonal
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-muted-foreground/70 dark:text-muted-foreground/60"
                              }
                              ${cell === 0 ? "opacity-0" : ""}
                            `}
                            >
                              ({percentage}%)
                            </div>
                          </div>

                          <div
                            className={`
                            absolute inset-0 rounded-sm transition-all duration-200
                            ${isDiagonal ? "ring-1 ring-green-200 dark:ring-green-800/50" : ""}
                            group-hover:bg-opacity-20 dark:group-hover:bg-opacity-30
                            ${hoverColor}
                            pointer-events-none
                          `}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// F1ScoreChart for a specific disease
const DiseaseF1ScoreChart = ({
  diseaseData,
}: {
  diseaseData: ConfusionMatrixData;
}) => {
  // Calculate F1 score for each stage (simplified example)
  const f1Scores = diseaseData.matrix.map((row, i) => {
    const truePositives = row[i];
    const falsePositives = row.reduce(
      (sum, val, j) => (j !== i ? sum + val : sum),
      0,
    );
    const falseNegatives = diseaseData.matrix.reduce(
      (sum, r, j) => (j !== i ? sum + r[i] : sum),
      0,
    );

    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1 =
      precision + recall > 0
        ? (2 * (precision * recall)) / (precision + recall)
        : 0;

    return {
      stage: diseaseData.stages[i],
      f1Score: f1 * 100, // Convert to percentage
      precision: precision * 100,
      recall: recall * 100,
    };
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{diseaseData.disease} - F1 Scores</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={f1Scores}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis
              domain={[0, 100]}
              label={{ value: "Score %", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}%`,
                {
                  f1Score: "F1-Score",
                  precision: "Precision",
                  recall: "Recall",
                }[name] || name,
              ]}
            />
            <Legend />
            <Bar dataKey="f1Score" name="F1-Score" fill="#8884d8" />
            <Bar dataKey="precision" name="Precision" fill="#82ca9d" />
            <Bar dataKey="recall" name="Recall" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Main component
const ModelStats = () => {
  const [selectedDisease, setSelectedDisease] = React.useState<number>(0);
  const currentDisease = confusionMatrixData[selectedDisease];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Model Performance</h2>
        <div className="w-64">
          <label className="block text-sm font-medium mb-1">
            Select Disease:
          </label>
          <select
            className="w-full p-2 border rounded"
            value={selectedDisease}
            onChange={(e) => setSelectedDisease(Number(e.target.value))}
          >
            {confusionMatrixData.map((item, index) => (
              <option key={item.disease} value={index}>
                {item.disease}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          <DiseaseF1ScoreChart diseaseData={currentDisease} />
          <ConfusionMatrixChart data={currentDisease} />
        </div>

        <div>
          <F1ScoreChart />
        </div>
      </div>
    </div>
  );
};

export default ModelStats;
