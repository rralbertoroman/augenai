interface StepReviewProps {
  patientId: string;
  imageType: string;
  task: string;
  eyeSelection: "left" | "right";
  fileName?: string;
  diseases: string[];
  lesionSummary: string;
}

export function StepReview({
  patientId,
  imageType,
  task,
  eyeSelection,
  fileName,
  diseases,
  lesionSummary,
}: StepReviewProps) {
  return (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-lg space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">ID del Paciente</p>
          <p className="font-medium">{patientId}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Tipo de Imagen</p>
          <p className="font-medium">{imageType}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Tarea</p>
          <p className="font-medium">{task}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Ojo</p>
          <p className="font-medium">
            {eyeSelection === "left" ? "Izquierdo" : "Derecho"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Archivo</p>
          <p className="font-medium">{fileName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Enfermedades</p>
          <p className="font-medium">{diseases.join(", ")}</p>
        </div>
        {lesionSummary && (
          <div>
            <p className="text-xs text-muted-foreground">
              Resumen de Lesi\u00f3n
            </p>
            <p className="font-medium">{lesionSummary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
