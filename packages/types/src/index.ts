export interface Disease {
  /** The name of the disease */
  name: string;
  /** Array of disease stages */
  stages: string[];
}

export interface Model {
  /** The name of the model */
  modelName: string;
  /** Array of tasks the model can perform */
  modelTasks: string[];
  /** Array of diseases the model can detect/analyze */
  diseases: Disease[];
  /** Array of MIME types of images the model accepts */
  acceptedImageTypes: string[];
  /** ISO 8601 formatted date string of the model's last training */
  latestTraining: string;
  /** Model's accuracy score (0-1) */
  accuracy: number;
}
