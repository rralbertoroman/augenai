"use server";

import { resend } from "../resend/client";
import { RESEND_FROM_EMAIL } from "../constants";
import { getUserProfileById } from "./user_profile";
import { generateEmailTemplate } from "../resend/email_templates";
import { EmailType, type EmailOptions } from "@/types/email";

if (!RESEND_FROM_EMAIL) {
  throw new Error("RESEND_FROM_EMAIL is not set");
}

export async function sendPredictionSharedEmail(
  userProfileId: string,
  sharedByUserProfileId: string,
  predictionUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const userProfile = await getUserProfileById(userProfileId);
    if (!userProfile) {
      return { success: false, error: "User profile not found" };
    }

    const sharedByProfile = await getUserProfileById(sharedByUserProfileId);
    const sharedByName = sharedByProfile?.name || "Un usuario";

    const emailContent = generateEmailTemplate(EmailType.PREDICTION_SHARED, {
      sharedByName,
      predictionUrl,
      recipientName: userProfile.name,
    });

    const emailOptions: EmailOptions = {
      from: RESEND_FROM_EMAIL,
      to: userProfile.email,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const { data, error } = await resend.emails.send(emailOptions);

    if (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        error: error.message || "Unknown Resend error",
      };
    }

    console.log("Email sent successfully:", data);
    return { success: true };
  } catch (error) {
    console.error("Unexpected error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
