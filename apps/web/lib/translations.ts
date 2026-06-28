/**
 * Translation utilities for the application
 */

/**
 * Translate image type from English to Spanish
 */
export function translateImageType(imageType: string): string {
  const translations: Record<string, string> = {
    fundus: "Fondo",
    oct: "OCT",
  };
  return translations[imageType.toLowerCase()] || imageType;
}

/**
 * Translate task type from English to Spanish
 */
export function translateTaskType(task: string): string {
  const translations: Record<string, string> = {
    classification: "Clasificación",
    detection: "Detección",
    both: "Ambos",
  };
  return translations[task.toLowerCase()] || task;
}

/**
 * Translate disease stage content from English to Spanish
 */
export function translateStageContent(stage: string): string {
  const translations: Record<string, string> = {
    // Diabetic Retinopathy stages
    "no dr": "Sin RD",
    "mild npdr": "RDNP Leve",
    "moderate npdr": "RDNP Moderada",
    "severe npdr": "RDNP Severa",
    "proliferative dr": "RD Proliferativa",

    // Glaucoma stages
    "no glaucoma": "Sin Glaucoma",
    "early glaucoma": "Glaucoma Temprano",
    "moderate glaucoma": "Glaucoma Moderado",
    "advanced glaucoma": "Glaucoma Avanzado",
    "severe glaucoma": "Glaucoma Severo",

    // Generic stages
    normal: "Normal",
    abnormal: "Anormal",
    healthy: "Saludable",
    disease: "Enfermedad",
  };

  return translations[stage.toLowerCase()] || stage;
}

/**
 * Translate lesion names from English to Spanish
 */
export function translateLesionName(lesion: string): string {
  const translations: Record<string, string> = {
    // Diabetic Retinopathy lesions
    microaneurysm: "Microaneurisma",
    microaneurysms: "Microaneurismas",
    hemorrhage: "Hemorragia",
    hemorrhages: "Hemorragias",
    "hard exudate": "Exudado Duro",
    "hard exudates": "Exudados Duros",
    "soft exudate": "Exudado Blando",
    "soft exudates": "Exudados Blandos",
    "cotton wool spot": "Mancha Algodonosa",
    "cotton wool spots": "Manchas Algodonosas",
    neovascularization: "Neovascularización",
    "vitreous hemorrhage": "Hemorragia Vítrea",
    "fibrous proliferation": "Proliferación Fibrosa",
    "preretinal hemorrhage": "Hemorragia Prerretiniana",
    "intraretinal microvascular abnormalities":
      "Anomalías Microvasculares Intrarretinianas",
    irma: "IRMA",
    "venous beading": "Arrosariamiento Venoso",
    "macular edema": "Edema Macular",
  };

  return translations[lesion.toLowerCase()] || lesion;
}

/**
 * Translate segmentation class names from English to Spanish.
 * NOTE: these are temporary placeholder labels until the real class
 * taxonomy is defined by the AI service.
 */
export function translateSegmentationClassName(className: string): string {
  const translations: Record<string, string> = {
    background: "Fondo",
    class_1: "Clase 1",
    class_2: "Clase 2",
    class_3: "Clase 3",
    class_4: "Clase 4",
  };

  return translations[className.toLowerCase()] || className;
}
