/**
 * Utility functions for dashboard feedback display
 */

export type FeedbackStatus = "reviewed" | "pending" | "not-sent";

export interface FeedbackVariant {
  variant: "default" | "secondary" | "outline";
  text: string;
  icon: string;
}

/**
 * Returns the appropriate badge variant and label based on feedback status
 */
export function getFeedbackVariant(status: string): FeedbackVariant {
  switch (status) {
    case "reviewed":
      return {
        variant: "default" as const,
        text: "Revisado",
        icon: "check-circle",
      };
    case "pending":
      return {
        variant: "secondary" as const,
        text: "Pendiente",
        icon: "clock",
      };
    default:
      return {
        variant: "outline" as const,
        text: "No enviado",
        icon: "alert-circle",
      };
  }
}
