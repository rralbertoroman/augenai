"use client";

import { usePredictions } from "@/hooks/use-predictions";
import { PredictionList } from "@/components/predictions/prediction-list";
import { PredictionDetail } from "@/components/predictions/prediction-detail";
import { useState } from "react";
import Link from "next/link";

export default function DiagnosisPage() {
  const { predictions, selectedPrediction, setSelectedPrediction, isLoading } =
    usePredictions();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPredictions = predictions.filter((prediction) =>
    prediction.patientName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <main className="flex-1 flex-col">
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
          <Link href="/diagnosis/create">
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-primary/25 text-foreground gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 hover:bg-primary/35 dark:bg-primary/35 dark:hover:bg-primary/45 dark:text-foreground">
              <span className="text-lg">+</span>
              <span className="truncate">Nueva Predicción</span>
            </button>
          </Link>
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="rounded-lg border border-border bg-card dark:bg-gray-900 dark:border-gray-700 lg:col-span-3">
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
          <div className="relative rounded-lg border border-border bg-card p-6 dark:border-gray-700 dark:bg-gray-900 lg:col-span-2">
            {selectedPrediction ? (
              <PredictionDetail prediction={selectedPrediction} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Selecciona una predicción para ver los detalles
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
