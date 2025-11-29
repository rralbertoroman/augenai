import { Badge } from "@/components/ui/badge";
import { getConfidenceBadge } from "@/hooks/use-predictions";
import Image from "next/image";

export interface PredictionCardProps {
  diagnosis: {
    id: string;
    disease_name?: string;
    stage_content?: string;
    confidence: number;
    image_url?: string; // URL of the eye scan image from Supabase
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

      {/* Display the eye scan image if available */}
      {diagnosis.image_url && (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Imagen del escaneo
          </p>
          <div className="relative aspect-square w-full max-w-xs mx-auto overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <Image
              src={diagnosis.image_url}
              alt="Imagen del escaneo ocular para esta predicción"
              fill
              className="object-cover"
              unoptimized // Since the image comes from Supabase
            />
          </div>
        </div>
      )}
    </div>
  );
}
