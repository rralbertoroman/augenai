import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface BatchFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  predictions: Array<{
    id: string;
    disease_id: string;
    disease_name: string;
    confidence: number;
    stage_idx?: number;
  }>;
  feedbackForms: Record<string, { diagnosisId: string; stageIdx: number }>;
  diseases: Array<{ id: string; name: string; stages: string[] }>;
  onUpdateForm: (diagnosisId: string, field: "stageIdx", value: number) => void;
  onSubmit: () => void;
  loading?: boolean;
  error?: string | null;
}

export function BatchFeedbackModal({
  open,
  onOpenChange,
  predictions,
  feedbackForms,
  diseases,
  onUpdateForm,
  onSubmit,
  loading,
  error,
}: BatchFeedbackModalProps) {
  const [localObservations, setLocalObservations] = useState<
    Record<string, string>
  >({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dar retroalimentación</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {predictions.map((prediction, index) => {
            const diseaseObj = diseases.find(
              (d) => d.id === prediction.disease_id,
            );
            const stages = diseaseObj?.stages;
            const formData = feedbackForms[prediction.id];
            if (!formData) {
              throw new Error(`No se encontró formData para la predicción ${prediction.id}`);
            }

            return (
              <div
                key={prediction.id}
                className="border border-border rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Predicción {index + 1}
                  </h3>
                  <span className="text-xs text-gray-500">
                    Confianza: {(prediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                <div>
                  <Label htmlFor={`disease-${prediction.id}`}>
                    Enfermedad detectada
                  </Label>
                  <Input
                    id={`disease-${prediction.id}`}
                    value={prediction.disease_name}
                    disabled
                    className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor={`stage-${prediction.id}`}>
                    Etapa que considera correcta
                  </Label>
                  <select
                    id={`stage-${prediction.id}`}
                    value={formData.stageIdx}
                    onChange={(e) =>
                      onUpdateForm(
                        prediction.id,
                        "stageIdx",
                        Number(e.target.value),
                      )
                    }
                    required
                    className="w-full border border-border rounded p-2 bg-background mt-2"
                  >
                    {stages!.map((stage, idx) => (
                      <option key={idx} value={idx}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor={`observations-${prediction.id}`}>
                    Observaciones (opcional)
                  </Label>
                  <textarea
                    id={`observations-${prediction.id}`}
                    value={localObservations[prediction.id] || ""}
                    onChange={(e) =>
                      setLocalObservations((prev) => ({
                        ...prev,
                        [prediction.id]: e.target.value,
                      }))
                    }
                    placeholder="Agregue cualquier observación sobre esta predicción..."
                    rows={3}
                    className="w-full border border-border rounded p-2 bg-background resize-none mt-2"
                  />
                </div>
              </div>
            );
          })}

          {error && (
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded">
              {error}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar todas las retroalimentaciones"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
