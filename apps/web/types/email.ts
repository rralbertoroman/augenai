export enum EmailType {
  PREDICTION_SHARED = "PREDICTION_SHARED",
  OTHER = "OTHER",
}

export interface EmailOptions {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
}

export interface EmailResponse {
  success: boolean;
  error?: string;
  data?: {
    id: string;
  };
}
