import { Badge } from "@/components/ui/badge";
import type { ClassificationObject } from "@/types/prediction";

interface FixedParametersProps {
  diseaseId: string;
  stageIdx: number;
  topPrediction?: ClassificationObject;
  status: string;
  predictionId: string;
  getConfidenceBadge: (confidence: number) => {
    variant: "default" | "secondary" | "outline";
    label: string;
  };
}

export function FixedParameters({
  diseaseId,
  stageIdx,
  topPrediction,
  status,
  predictionId,
  getConfidenceBadge,
}: FixedParametersProps) {
  const confidenceBadge = topPrediction
    ? getConfidenceBadge(topPrediction.confidence)
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Enfermedad</p>
          <p className="text-base font-medium">{diseaseId}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Etapa</p>
          <p className="text-base font-medium">{stageIdx}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Clase predicha</p>
          <p className="text-base font-medium">
            {topPrediction?.class_name || "N/A"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Confianza</p>
          <div className="flex items-center gap-2">
            <p className="text-base font-medium">
              {topPrediction
                ? `${(topPrediction.confidence * 100).toFixed(2)}%`
                : "N/A"}
            </p>
            {confidenceBadge && (
              <Badge variant={confidenceBadge.variant}>
                {confidenceBadge.label}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Estado</p>
          <Badge variant={status === "success" ? "default" : "destructive"}>
            {status}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">ID de predicción</p>
          <p className="text-xs font-mono text-muted-foreground">
            {predictionId}
          </p>
        </div>
      </div>
    </div>
  );
}
