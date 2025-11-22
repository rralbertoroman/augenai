"use client";

import { Prediction } from "@/hooks/use-predictions";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useState } from "react";

interface PredictionListProps {
  predictions: Prediction[];
  selectedPrediction: Prediction | null;
  onSelectPrediction: (prediction: Prediction) => void;
}

export function PredictionList({
  predictions,
  selectedPrediction,
  onSelectPrediction,
}: PredictionListProps) {
  const [sharingId, setSharingId] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleShare = async (e: React.MouseEvent, predictionId: string) => {
    e.stopPropagation();
    setSharingId(predictionId);

    try {
      // TODO: Implement share functionality
      console.log("Sharing prediction:", predictionId);
      // This will be implemented in the future
      alert("Funcionalidad de compartir próximamente");
    } finally {
      setSharingId(null);
    }
  };

  return (
    <div className="space-y-2">
      {predictions.map((prediction) => (
        <div
          key={prediction.id}
          className={`flex items-center gap-2 p-4 rounded-lg border transition-colors ${
            selectedPrediction?.id === prediction.id
              ? "border-primary bg-accent"
              : "border-border hover:border-primary/50"
          }`}
        >
          <button
            onClick={() => onSelectPrediction(prediction)}
            className="flex-1 text-left"
          >
            <p className="font-medium truncate">{prediction.patientName}</p>
            <div className="flex gap-4 text-sm text-muted-foreground mt-1">
              <span>{prediction.diseaseId}</span>
              <span>{formatDate(prediction.createdAt)}</span>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(prediction.status)}`}
            >
              {prediction.status}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => handleShare(e, prediction.id)}
              disabled={sharingId === prediction.id}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
              title="Compartir predicción"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
