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
import { Label } from "@/components/ui/label";
import {
  useModelStats,
  type F1ScoreData,
  type ConfusionMatrixData,
} from "@/hooks/use-model-stats";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

// Chart components
const F1ScoreChart = ({ data }: { data: F1ScoreData[] }) => {
  const auc = calculateAUC(data);
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>F1-Score vs Confianza</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <div className="text-sm text-muted-foreground mb-2">
          AUC: {auc.toFixed(3)}
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="confidence"
              label={{
                value: "Umbral de Confianza",
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
              labelFormatter={(label) => `Confianza: ${label}`}
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
};

const ConfusionMatrixChart = ({ data }: { data: ConfusionMatrixData }) => {
  const currentData = data;

  return (
    <Card className="w-full bg-background">
      <CardHeader>
        <CardTitle className="text-foreground">
          Matriz de Confusión - {data.disease}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Las filas muestran las etapas reales, las columnas muestran las etapas
          predichas
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className=" dark:bg-muted/20">
                  <div className="text-sm font-medium text-foreground">
                    Real \ Predicho
                  </div>
                </TableHead>
                {currentData.stages.map((stage, i) => (
                  <TableHead key={i} className="bg-muted/20 dark:bg-muted/20">
                    <div className="text-sm font-medium text-foreground whitespace-nowrap">
                      {stage}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.matrix.map((row, rowIndex) => {
                const rowSum = currentData.matrix[rowIndex].reduce(
                  (a, b) => a + b,
                  0,
                );
                return (
                  <TableRow key={rowIndex}>
                    <TableCell className="text-sm font-medium whitespace-nowrap bg-muted/20 dark:bg-muted/10">
                      <span className="text-foreground">
                        {currentData.stages[rowIndex]}
                      </span>
                    </TableCell>
                    {row.map((cell, colIndex) => {
                      const percentage =
                        rowSum > 0 ? Math.round((cell / rowSum) * 100) : 0;
                      const isDiagonal = rowIndex === colIndex;

                      return (
                        <TableCell
                          key={`${rowIndex}-${colIndex}`}
                          className={`
                            text-center text-sm relative
                            ${isDiagonal ? "bg-primary/10" : "bg-background"}
                            ${cell > 0 ? "font-medium" : "text-foreground/30"}
                          `}
                          title={`Predicted: ${currentData.stages[colIndex]}
                            Actual: ${currentData.stages[rowIndex]}
                            Count: ${cell}
                            Percentage: ${percentage}%`}
                        >
                          <div className="relative">
                            <div
                              className={`
                              ${cell > 0 ? "opacity-100" : "opacity-30"}
                            `}
                            >
                              {cell}
                            </div>
                            <div
                              className={`
                              text-[10px] mt-[-2px] 
                              "text-muted-foreground/70"
                              }
                              ${cell === 0 ? "opacity-0" : ""}
                            `}
                            >
                              ({percentage}%)
                            </div>
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
  // Calculate F1 score for each stage
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
        <CardTitle>{diseaseData.disease} - Puntuaciones F1</CardTitle>
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
              label={{
                value: "Puntuación %",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}%`,
                {
                  f1Score: "F1-Score",
                  precision: "Precisión",
                  recall: "Recall",
                }[name] || name,
              ]}
            />
            <Legend />
            <Bar dataKey="f1Score" name="F1-Score" fill="#8884d8" />
            <Bar dataKey="precision" name="Precisión" fill="#82ca9d" />
            <Bar dataKey="recall" name="Recall" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Main component
const ModelStats = () => {
  const { f1ScoreData, confusionMatrixData, isLoading, hasData } =
    useModelStats();
  const [selectedDisease, setSelectedDisease] = React.useState<number>(0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!hasData || !confusionMatrixData.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          No hay datos disponibles para las estadísticas del modelo.
        </p>
      </div>
    );
  }

  const currentDisease =
    confusionMatrixData[selectedDisease] || confusionMatrixData[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Rendimiento del Modelo
        </h2>
        <div className="w-64">
          <Label className="mb-1">Seleccionar Enfermedad:</Label>
          <Select
            value={selectedDisease.toString()}
            onValueChange={(value) => setSelectedDisease(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una enfermedad" />
            </SelectTrigger>
            <SelectContent>
              {confusionMatrixData.map((item, index) => (
                <SelectItem key={item.disease} value={index.toString()}>
                  {item.disease}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          <DiseaseF1ScoreChart diseaseData={currentDisease} />
          <ConfusionMatrixChart data={currentDisease} />
        </div>

        <div>
          <F1ScoreChart data={f1ScoreData} />
        </div>
      </div>
    </div>
  );
};

export default ModelStats;
