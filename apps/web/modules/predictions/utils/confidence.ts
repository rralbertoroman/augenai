/**
 * Utility functions for confidence-related calculations and display
 */

// Confidence badge constants
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.5,
} as const;

const CONFIDENCE_LABELS = {
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja",
} as const;

const CONFIDENCE_VARIANTS = {
  HIGH: "default",
  MEDIUM: "secondary",
  LOW: "outline",
} as const;

/**
 * Returns the appropriate badge variant and label based on confidence level
 */
export function getConfidenceBadge(confidence: number) {
  if (confidence > CONFIDENCE_THRESHOLDS.HIGH) {
    return {
      variant: CONFIDENCE_VARIANTS.HIGH,
      label: CONFIDENCE_LABELS.HIGH,
    };
  }
  if (confidence > CONFIDENCE_THRESHOLDS.MEDIUM) {
    return {
      variant: CONFIDENCE_VARIANTS.MEDIUM,
      label: CONFIDENCE_LABELS.MEDIUM,
    };
  }
  return {
    variant: CONFIDENCE_VARIANTS.LOW,
    label: CONFIDENCE_LABELS.LOW,
  };
}

/**
 * Formats a key string by capitalizing each word and replacing underscores with spaces
 */
export function formatKey(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
