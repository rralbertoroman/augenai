import { Prediction, getConfidenceBadge } from "@/hooks/use-predictions";
import { Badge } from "@/components/ui/badge";

interface LatestPredictionCardProps {
  prediction: Prediction;
}

export function LatestPredictionCard({
  prediction,
}: LatestPredictionCardProps) {
  const badge = getConfidenceBadge(prediction.confidence);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Última Predicción</h3>

        <div className="space-y-4">
          {/* Main Result */}
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Enfermedad Sospechada
                </p>
                <p className="text-lg font-semibold mt-1">
                  {prediction.disease_name}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Clasificación
                </p>
                <p className="text-base font-semibold mt-1">
                  Estadio {prediction.stage_idx + 1}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Confianza
                  </p>
                  <p className="text-base font-semibold mt-1">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-secondary/50 rounded p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Fecha
              </p>
              <p className="mt-1 font-medium">
                {new Date(prediction.createdAt).toLocaleDateString("es-ES")}
              </p>
            </div>
            <div className="bg-secondary/50 rounded p-3">
              <p className="text-xs text-muted-foregroun uppercase tracking-wide font-medium">
                Estadio
              </p>
              <p className="mt-1 font-medium">{prediction.stage_content}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
