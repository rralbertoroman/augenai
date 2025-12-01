/**
 * Error translator module
 * Centralizes the translation of technical error messages to user-friendly Spanish messages
 */

/**
 * Translates technical error messages to user-friendly Spanish messages
 * @param error - Error message as string or Error object
 * @returns User-friendly error message in Spanish
 */
export function translateErrorMessage(error: string | Error): string {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  // Supabase Authentication errors
  if (lowerMessage.includes("invalid login credentials")) {
    return "Correo electrónico o contraseña incorrectos";
  }
  if (lowerMessage.includes("user already registered")) {
    return "Este correo electrónico ya está registrado";
  }
  if (lowerMessage.includes("weak password")) {
    return "La contraseña es muy débil. Por favor, elige una contraseña más segura";
  }
  if (lowerMessage.includes("length")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  if (lowerMessage.includes("characters")) {
    return "La contraseña debe contener al menos un carácter de cada: minúsculas, mayúsculas y números.";
  }
  if (lowerMessage.includes("same password")) {
    return "La nueva contraseña debe ser diferente de la contraseña actual.";
  }
  if (lowerMessage.includes("contraseñas no coinciden")) {
    return "Las contraseñas no coinciden";
  }
  if (lowerMessage.includes("por favor, completa ambos campos de contraseña")) {
    return "Por favor, completa ambos campos de contraseña.";
  }
  if (lowerMessage.includes("email rate limit exceeded")) {
    return "Has intentado demasiadas veces. Por favor, intenta más tarde";
  }
  if (lowerMessage.includes("email not confirmed")) {
    return "Por favor, confirma tu correo electrónico antes de continuar";
  }

  // General authentication errors
  if (
    lowerMessage.includes("no autenticado") ||
    lowerMessage.includes("not authenticated")
  ) {
    return "Por favor, inicia sesión para continuar";
  }

  // Form validation errors
  if (
    lowerMessage.includes("required field") ||
    lowerMessage.includes("campo requerido")
  ) {
    return "Por favor, completa todos los campos requeridos";
  }
  if (
    lowerMessage.includes("invalid format") ||
    lowerMessage.includes("formato inválido")
  ) {
    return "El formato de los datos no es válido";
  }

  // File/image related errors
  if (lowerMessage.includes("image") && lowerMessage.includes("load")) {
    return "No se pudo cargar la imagen. Por favor, intenta con otro archivo";
  }
  if (lowerMessage.includes("imagen no cargada")) {
    return "Por favor, carga una imagen antes de continuar";
  }
  if (
    lowerMessage.includes("almacenamiento inválida") ||
    lowerMessage.includes("storage")
  ) {
    return "Error al procesar el almacenamiento de la imagen";
  }
  if (lowerMessage.includes("failed to download")) {
    return "No se pudo procesar la imagen. Por favor, intenta nuevamente";
  }

  // Patient-related errors
  if (
    lowerMessage.includes("paciente") &&
    (lowerMessage.includes("not found") ||
      lowerMessage.includes("no encontrado"))
  ) {
    return "El paciente no fue encontrado";
  }
  if (
    lowerMessage.includes("selecciona un paciente") ||
    lowerMessage.includes("patient")
  ) {
    return "Por favor, selecciona un paciente válido";
  }

  // Model-related errors
  if (
    lowerMessage.includes("no hay modelos disponibles") ||
    lowerMessage.includes("models found")
  ) {
    return "No hay modelos disponibles para los parámetros seleccionados";
  }

  // Disease-related errors
  if (lowerMessage.includes("enfermedad")) {
    return "Error al procesar las enfermedades. Por favor, intenta nuevamente";
  }

  // Prediction errors
  if (
    lowerMessage.includes("predicción") ||
    lowerMessage.includes("prediction")
  ) {
    if (
      lowerMessage.includes("not found") ||
      lowerMessage.includes("no encontrada")
    ) {
      return "La predicción no fue encontrada";
    }
    if (lowerMessage.includes("procesar")) {
      return "No se pudieron procesar las predicciones. Por favor, intenta nuevamente";
    }
  }

  // Generic password errors
  if (lowerMessage.includes("password")) {
    return "Error con la contraseña. Por favor, intenta nuevamente";
  }

  // Generic email errors
  if (lowerMessage.includes("email") && !lowerMessage.includes("confirmed")) {
    return "Error con el correo electrónico. Por favor, verifica que sea válido";
  }

  // Connection errors
  if (
    lowerMessage.includes("network error") ||
    lowerMessage.includes("error de conexión")
  ) {
    return "Error de conexión. Por favor, verifica tu conexión a internet";
  }
  if (lowerMessage.includes("pgrst")) {
    return "Error al comunicarse con el servidor. Por favor, intenta más tarde";
  }

  // HTTP status errors
  if (lowerMessage.includes("403") || lowerMessage.includes("forbidden")) {
    return "No tienes permiso para realizar esta acción";
  }
  if (lowerMessage.includes("404") || lowerMessage.includes("not found")) {
    return "Lo que buscas no fue encontrado";
  }
  if (
    lowerMessage.includes("500") ||
    lowerMessage.includes("internal server error")
  ) {
    return "Error en el servidor. Por favor, intenta más tarde";
  }
  if (
    lowerMessage.includes("503") ||
    lowerMessage.includes("service unavailable")
  ) {
    return "El servicio no está disponible en este momento. Por favor, intenta más tarde";
  }
  if (lowerMessage.includes("429") || lowerMessage.includes("rate limit")) {
    return "Demasiadas solicitudes. Por favor, espera un momento e intenta nuevamente";
  }

  // Timeout errors
  if (lowerMessage.includes("timeout") || lowerMessage.includes("timed out")) {
    return "La solicitud tardó demasiado. Por favor, intenta nuevamente";
  }

  // If the message is already user-friendly (in Spanish, short), return as is
  if (message.length < 50 && !message.toLowerCase().includes("error")) {
    return message;
  }

  // Fallback error message
  return "Ocurrió un error inesperado. Por favor, intenta nuevamente";
}
