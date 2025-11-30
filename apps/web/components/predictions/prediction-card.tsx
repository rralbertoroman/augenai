import { Badge } from "@/components/ui/badge";
import { getConfidenceBadge } from "@/hooks/use-predictions";

export interface PredictionCardProps {
  diagnosis: {
    id: string;
    disease_name?: string;
    stage_content?: string;
    confidence: number;
  };
}

export function PredictionCard({ diagnosis }: PredictionCardProps) {
  const badge = getConfidenceBadge(diagnosis.confidence);
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Enfermedad
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
            {diagnosis.disease_name ?? ""}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Clasificación
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {diagnosis.stage_content ?? ""}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Confianza
          </p>
          <div className="flex items-center gap-2">
            <Badge variant={badge.variant}>{badge.label}</Badge>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {(diagnosis.confidence * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
