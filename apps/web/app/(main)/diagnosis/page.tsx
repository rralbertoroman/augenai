"use client";

import { usePredictions } from "@/hooks/use-predictions";
import { PredictionList } from "@/components/predictions/prediction-list";
import { PredictionDetail } from "@/components/predictions/prediction-detail";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DiagnosisPage() {
  const {
    selectedPrediction,
    setSelectedPrediction,
    isLoading,
    error,
    getFilteredPredictions,
  } = usePredictions();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPredictions = getFilteredPredictions(searchQuery);

  if (isLoading) {
    return (
      <main className="flex-1 flex-col p-6">
        <SkeletonLoader width="100%" height={60} className="mb-6" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <SkeletonLoader
            width="100%"
            height={320}
            className="lg:col-span-3 mb-6"
          />
          <SkeletonLoader width="100%" height={320} className="lg:col-span-2" />
        </div>
      </main>
    );
  }
  return (
    <main className="flex-1 flex-col animate-fadein">
      <div className="border-b border-border bg-card px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-foreground dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
              Predicciones
            </h1>
            <div className="relative">
              <input
                className="w-64 rounded-lg border border-border bg-background py-2 pl-3 pr-4 text-sm text-foreground focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Buscar predicciones..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="max-w-[480px] w-full ml-auto">
            <Link href="/diagnosis/create" className="w-full">
              <Button variant="default" size="lg" className="w-full">
                <span className="text-lg">+</span>
                <span className="truncate">Nueva Predicción</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="rounded-lg border border-border bg-card dark:bg-gray-900 dark:border-gray-700 lg:col-span-3">
            {error && (
              <div className="p-4 bg-destructive/10 border-b border-destructive rounded-t">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">
                Cargando predicciones...
              </p>
            ) : filteredPredictions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No se encontraron predicciones
              </p>
            ) : (
              <div className="overflow-x-auto">
                <PredictionList
                  predictions={filteredPredictions}
                  selectedPrediction={selectedPrediction}
                  onSelectPrediction={setSelectedPrediction}
                />
              </div>
            )}
          </div>
          <div className="relative rounded-lg border border-border bg-card p-6 dark:border-gray-700 dark:bg-gray-900 lg:col-span-2 animate-fadein">
            {selectedPrediction ? (
              <PredictionDetail prediction={selectedPrediction} />
            ) : (
              <div className="flex items-center justify-center text-muted-foreground">
                Selecciona una predicción para ver los detalles
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
