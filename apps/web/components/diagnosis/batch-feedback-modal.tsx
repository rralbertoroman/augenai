import { ClipboardDialog } from "@/components/common/clipboard-dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  feedbackForms: Record<
    string,
    { diagnosisId: string; stageIdx: number; diseaseId?: string }
  >;
  diseases: Array<{ id: string; name: string; stages: string[] }>;
  onUpdateForm: (
    diagnosisId: string,
    field: "stageIdx" | "diseaseId",
    value: number | string,
  ) => void;
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
    <ClipboardDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Dar retroalimentación"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {predictions.map((prediction, index) => {
          const currentDiseaseId =
            feedbackForms[prediction.id]?.diseaseId || prediction.disease_id;
          const diseaseObj = diseases.find((d) => d.id === currentDiseaseId);
          const stages = diseaseObj?.stages;
          const formData = feedbackForms[prediction.id];
          const isUnknownDisease = prediction.disease_name
            .toLowerCase()
            .includes("desconocida");

          if (!formData) {
            throw new Error(
              `No se encontró formData para la predicción ${prediction.id}`,
            );
          }

          return (
            <div
              key={prediction.id}
              className="border border-border rounded-lg p-4 space-y-4 bg-secondary-foreground dark:bg-background"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Predicción {index + 1}
                </h3>
                <span className="text-xs text-muted-foreground">
                  Confianza: {(prediction.confidence * 100).toFixed(1)}%
                </span>
              </div>

              <div>
                <Label htmlFor={`disease-${prediction.id}`}>
                  Enfermedad detectada
                </Label>
                {isUnknownDisease ? (
                  <Select
                    value={currentDiseaseId}
                    onValueChange={(value) =>
                      onUpdateForm(prediction.id, "diseaseId", value)
                    }
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Seleccione la enfermedad correcta" />
                    </SelectTrigger>
                    <SelectContent>
                      {diseases
                        .filter(
                          (disease) =>
                            !disease.name.toLowerCase().includes("desconocida"),
                        )
                        .map((disease) => (
                          <SelectItem key={disease.id} value={disease.id}>
                            {disease.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`disease-${prediction.id}`}
                    value={prediction.disease_name}
                    disabled
                    className="bg-muted/50 cursor-not-allowed mt-2"
                  />
                )}
              </div>

              <div>
                <Label htmlFor={`stage-${prediction.id}`}>
                  Etapa que considera correcta
                </Label>
                <Select
                  value={formData.stageIdx.toString()}
                  onValueChange={(value) =>
                    onUpdateForm(prediction.id, "stageIdx", Number(value))
                  }
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Seleccione una etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages!.map((stage, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor={`observations-${prediction.id}`}>
                  Observaciones (opcional)
                </Label>
                <Textarea
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
                  className="mt-2"
                />
              </div>
            </div>
          );
        })}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 justify-end pt-4">
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
        </div>
      </form>
    </ClipboardDialog>
  );
}
