"use client";

import { Button } from "@/components/ui/button";
import { useDashboard } from "@/modules/dashboard/contexts/dashboard-context";
import { useTodayPredictions } from "@/modules/dashboard/hooks/use-today-predictions";
import { Spinner } from "@/components/ui/spinner";
import { Grid, List } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GridCard } from "./start-pane/grid-card";
import { ListRow } from "./start-pane/list-row";

export default function Start() {
  const { isLoading, error } = useDashboard();
  const predictionGroups = useTodayPredictions();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (predictionGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No hay predicciones para hoy</h3>
        <p className="text-muted-foreground mt-2">
          Realiza una nueva predicción para ver los resultados aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Predicciones de hoy</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            {predictionGroups.length}{" "}
            {predictionGroups.length === 1 ? "predicción" : "predicciones"}
          </span>
          <div className="flex space-x-1 border rounded-lg p-1 bg-muted">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`h-8 w-8 p-0 ${viewMode === "grid" ? "" : "hover:bg-background"}`}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`h-8 w-8 p-0 ${viewMode === "list" ? "" : "hover:bg-background"}`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-4"
        }
      >
        {predictionGroups.map((group) => (
          <Link
            key={`${group.requestId}-${group.patientId}`}
            href={`/diagnosis/${group.requestId}`}
            className="block hover:opacity-90 transition-opacity"
          >
            {viewMode === "grid" ? (
              <GridCard group={group} />
            ) : (
              <ListRow group={group} />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
