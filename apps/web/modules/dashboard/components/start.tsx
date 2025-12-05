"use client";

import { Button } from "@/components/ui/button";
import { useDashboard } from "@/modules/dashboard/contexts/dashboard-context";
import { useTodayPredictions } from "@/modules/dashboard/hooks/use-today-predictions";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { GridCard } from "./start-pane/grid-card";

export default function Start() {
  const { isLoading, error } = useDashboard();
  const predictionGroups = useTodayPredictions();

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
        <span className="text-sm text-muted-foreground">
          {predictionGroups.length}{" "}
          {predictionGroups.length === 1 ? "predicción" : "predicciones"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {predictionGroups.map((group) => (
          <Link
            key={`${group.requestId}-${group.patientId}`}
            href={`/diagnosis/${group.requestId}`}
            className="block hover:opacity-90 transition-opacity"
          >
            <GridCard group={group} />
          </Link>
        ))}
      </div>
    </div>
  );
}
