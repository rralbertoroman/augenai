import { Prediction } from "@/hooks/use-predictions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PredictionDetailProps {
  prediction: Prediction;
}

export function PredictionDetail({ prediction }: PredictionDetailProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{prediction.patientName}</h2>
        <p className="text-sm text-muted-foreground">
          ID: {prediction.id.slice(0, 8)}...
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Enfermedad</p>
          <p className="font-medium">{prediction.diseaseId}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Etapa</p>
          <p className="font-medium">{prediction.stageIdx}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Estado</p>
          <p className="font-medium capitalize">{prediction.status}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Fecha de creación</p>
          <p className="font-medium">
            {new Date(prediction.createdAt).toLocaleDateString("es-ES")}
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-4">
        <Button className="w-full" variant="default">
          Ver detalles completos
        </Button>
      </div>
    </div>
  );
}
