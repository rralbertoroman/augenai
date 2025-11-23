import { z } from "zod";

export enum EmailType {
  PREDICTION_SHARED = "PREDICTION_SHARED",
  CONTACT_US = "CONTACT_US",
  OTHER = "OTHER",
}

export const EmailOptionsSchema = z.object({
  from: z.email(),
  to: z.union([z.email(), z.array(z.email())]),
  subject: z.string().min(1),
  html: z.string().min(1),
});

export const EmailResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  data: z
    .object({
      id: z.string(),
    })
    .optional(),
});

// Template Props - These are what the templates need to render
export const PredictionSharedTemplatePropsSchema = z.object({
  type: z.literal(EmailType.PREDICTION_SHARED),
  senderName: z.string(),
  senderEmail: z.email(),
  recipientName: z.string(),
  recipientEmail: z.email(),
  predictionUrl: z.url(),
});

export const ContactUsTemplatePropsSchema = z.object({
  type: z.literal(EmailType.CONTACT_US),
  senderName: z.string(),
  senderEmail: z.email(),
  recipientName: z.string(),
  recipientEmail: z.email(),
  message: z.string().min(1),
  subject: z.string().optional(),
});

export const EmailTemplatePropsSchema = z.discriminatedUnion("type", [
  PredictionSharedTemplatePropsSchema,
  ContactUsTemplatePropsSchema,
]);

// INPUT TYPES
export type EmailOptionsInput = z.input<typeof EmailOptionsSchema>;
export type PredictionSharedTemplatePropsInput = z.input<
  typeof PredictionSharedTemplatePropsSchema
>;
export type ContactUsTemplatePropsInput = z.input<
  typeof ContactUsTemplatePropsSchema
>;
export type EmailTemplatePropsInput = z.input<typeof EmailTemplatePropsSchema>;

// OUTPUT TYPES
export type EmailOptions = z.output<typeof EmailOptionsSchema>;
export type EmailResponse = z.output<typeof EmailResponseSchema>;
export type PredictionSharedTemplateProps = z.output<
  typeof PredictionSharedTemplatePropsSchema
>;
export type ContactUsTemplateProps = z.output<
  typeof ContactUsTemplatePropsSchema
>;
export type EmailTemplateProps = z.output<typeof EmailTemplatePropsSchema>;
