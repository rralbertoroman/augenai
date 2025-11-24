import { useAuth } from "@/contexts/auth-context";
import { usePredictions } from "@/hooks/use-predictions";
import { usePatients } from "@/hooks/use-patients";
import { useMemo } from "react";

export function useDashboard() {
  const { user } = useAuth();
  const { predictions, isLoading: isPredictionsLoading } = usePredictions();
  const { patients, isLoading: isPatientsLoading } = usePatients();

  const displayName = useMemo(
    () =>
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "Doctor",
    [user],
  );

  const isLoading = isPredictionsLoading || isPatientsLoading;

  const totalPatients = patients.length;
  const totalPredictions = predictions.length;
  const successfulPredictions = predictions.filter(
    (p) => p.status === "success",
  ).length;
  const avgConfidence = useMemo(() => {
    if (successfulPredictions > 0) {
      return (
        (predictions
          .filter((p) => p.status === "success")
          .reduce((acc, p) => acc + (p.stageIdx || 0), 0) /
          successfulPredictions) *
        10
      ).toFixed(1);
    }
    return "0.0";
  }, [predictions, successfulPredictions]);

  const recentPredictions = predictions
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 4)
    .map((prediction) => ({
      ...prediction,
      formattedDate: formatDate(prediction.createdAt),
    }));

  function formatDate(date: Date | string) {
    // Formato consistente, no dependiente de locale
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
  }

  function getOutcomeBadge(status: string) {
    if (status === "success") {
      return {
        text: "Progresión",
        className:
          "rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300",
      };
    }
    return {
      text: "Estable",
      className:
        "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300",
    };
  }

  return {
    displayName,
    isLoading,
    totalPatients,
    totalPredictions,
    avgConfidence,
    recentPredictions,
    getOutcomeBadge,
  };
}
