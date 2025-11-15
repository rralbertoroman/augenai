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
          <p className="text-xs text-muted-foreground">Patient ID</p>
          <p className="font-medium">{patientId}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Image Type</p>
          <p className="font-medium">{imageType}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Task</p>
          <p className="font-medium">{task}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Eye</p>
          <p className="font-medium">
            {eyeSelection === "left" ? "Left" : "Right"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">File</p>
          <p className="font-medium">{fileName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Diseases</p>
          <p className="font-medium">{diseases.join(", ")}</p>
        </div>
        {lesionSummary && (
          <div>
            <p className="text-xs text-muted-foreground">Lesion Summary</p>
            <p className="font-medium">{lesionSummary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
