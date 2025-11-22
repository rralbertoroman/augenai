"use client";

import { usePredictions } from "@/hooks/use-predictions";
import { PredictionList } from "@/components/predictions/prediction-list";
import { PredictionDetail } from "@/components/predictions/prediction-detail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Left Panel - Prediction List */}
      <div className="lg:col-span-2 space-y-4 overflow-hidden flex flex-col">
        <div className="flex gap-2">
          <div className="relative flex-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar predicciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex-1">
            <Link href="/diagnosis/create" className="w-full">
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Nueva predicción
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">
              Cargando predicciones...
            </p>
          ) : filteredPredictions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No se encontraron predicciones
            </p>
          ) : (
            <PredictionList
              predictions={filteredPredictions}
              selectedPrediction={selectedPrediction}
              onSelectPrediction={setSelectedPrediction}
            />
          )}
        </div>
      </div>

      {/* Right Panel - Prediction Detail */}
      <div className="border rounded-lg p-6 bg-card">
        {selectedPrediction ? (
          <PredictionDetail prediction={selectedPrediction} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Selecciona una predicción para ver los detalles
          </div>
        )}
      </div>
    </div>
  );
}
