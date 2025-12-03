/**
 * Calculate age from birth date string
 * @param birthDateString - Date string in ISO format
 * @returns Age in years or null if invalid
 */
export function calculateAge(birthDateString?: string): number | null {
  if (!birthDateString) return null;

  const birthDate = new Date(birthDateString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Check if a date is today
 * @param date - Date object or string
 * @returns true if date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Format date in DD/MM/YYYY format
 * @param date - Date object or string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${day}/${month}/${year}`;
}

/**
 * Format time in HH:MM format
 * @param date - Date object or string
 * @returns Formatted time string
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get cohort name for a given age
 * @param age - Age in years
 * @returns Cohort name or null if outside range
 */
export function getCohort(age: number): string | null {
  if (age >= 0 && age <= 39) return "0-39";
  if (age >= 40 && age <= 59) return "40-59";
  if (age >= 60 && age <= 79) return "60-79";
  if (age >= 80) return "80+";
  return null;
}
