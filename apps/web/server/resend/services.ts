"use server";

import { resend } from "./client";
import { RESEND_FROM_EMAIL, CONTACT_EMAIL } from "../constants";
import { getUserProfileById } from "../services/user_profile";
import { generateEmailTemplate } from "./email-templates";
import { EmailType, type EmailOptions } from "./schemas";
import { getCurrentUser } from "../auth";

if (!RESEND_FROM_EMAIL) {
  throw new Error("RESEND_FROM_EMAIL is not set");
}

export async function sendPredictionSharedEmail(
  token: string,
  sharedToUserProfileId: string,
  predictionUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await getCurrentUser(token);

    const sharedToProfile = await getUserProfileById(sharedToUserProfileId);
    if (!sharedToProfile) {
      return { success: false, error: "User profile not found" };
    }

    const sharedByProfile = await getUserProfileById(currentUser.userId);
    if (!sharedByProfile) {
      return { success: false, error: "Shared by user profile not found" };
    }

    const emailContent = generateEmailTemplate(EmailType.PREDICTION_SHARED, {
      type: EmailType.PREDICTION_SHARED,
      senderName: sharedByProfile.name,
      senderEmail: sharedByProfile.email,
      recipientName: sharedToProfile.name,
      recipientEmail: sharedToProfile.email,
      predictionUrl,
    });

    const emailOptions: EmailOptions = {
      from: RESEND_FROM_EMAIL,
      to: sharedToProfile.email,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const { error } = await resend.emails.send(emailOptions);

    if (error) {
      return {
        success: false,
        error: error.message || "Unknown Resend error",
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendContactUsEmail(
  token: string,
  message: string,
  subject?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await getCurrentUser(token);

    const userProfile = await getUserProfileById(currentUser.userId);
    if (!userProfile) {
      return { success: false, error: "User profile not found" };
    }

    const emailContent = generateEmailTemplate(EmailType.CONTACT_US, {
      type: EmailType.CONTACT_US,
      senderName: userProfile.name,
      senderEmail: userProfile.email,
      recipientName: "AugenAI Team",
      recipientEmail: CONTACT_EMAIL,
      message,
      subject,
    });

    const emailOptions: EmailOptions = {
      from: RESEND_FROM_EMAIL,
      to: CONTACT_EMAIL,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const { error } = await resend.emails.send(emailOptions);

    if (error) {
      return {
        success: false,
        error: error.message || "Unknown Resend error",
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
