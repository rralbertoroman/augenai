import {
  EmailType,
  type PredictionSharedTemplateProps,
  type ContactUsTemplateProps,
  type EmailTemplateProps,
} from "../schemas";
import { PredictionSharedTemplate } from "./prediction-shared";
import { ContactUsTemplate } from "./contact-us";

export function generateEmailTemplate(
  type: EmailType,
  props: EmailTemplateProps,
): {
  subject: string;
  html: string;
} {
  switch (type) {
    case EmailType.PREDICTION_SHARED:
      return PredictionSharedTemplate(props as PredictionSharedTemplateProps);
    case EmailType.CONTACT_US:
      return ContactUsTemplate(props as ContactUsTemplateProps);
    default:
      throw new Error(`Template type not supported: ${type}`);
  }
}
