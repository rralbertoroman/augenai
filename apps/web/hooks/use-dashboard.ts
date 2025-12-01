import { useAuth } from "@/contexts/auth-context";
import { usePredictions } from "@/hooks/use-predictions";
import { usePatients } from "@/hooks/use-patients";

export function useDashboard() {
  const { user } = useAuth();
  const { predictions, isLoading: isPredictionsLoading } = usePredictions();
  const { patients, isLoading: isPatientsLoading } = usePatients();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Doctor";

  const isLoading = isPredictionsLoading || isPatientsLoading;

  const totalPatients = patients.length;
  const totalPredictions = predictions.length;

  const avgConfidence =
    predictions.length > 0
      ? (
          predictions.reduce((sum, pred) => sum + pred.confidence * 100, 0) /
          predictions.length
        ).toFixed(1)
      : "0";

  const recentPredictions = predictions
    .slice()
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 4);

  function formatDate(date: Date | string) {
    const d = typeof date === "string" ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
  }

  return {
    displayName,
    isLoading,
    totalPatients,
    totalPredictions,
    avgConfidence,
    recentPredictions,
    formatDate,
  };
}
