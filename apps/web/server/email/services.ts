"use server";

import { mailer } from "./client";
import { EMAIL_FROM, CONTACT_EMAIL } from "../constants";
import { getUserProfileById } from "../services/user_profile";
import { generateEmailTemplate } from "./email-templates";
import { EmailType, type EmailOptions } from "./schemas";
import { getCurrentUser } from "../auth";

export async function sendPredictionSharedEmail(
  sharedByUserId: string,
  sharedToUserId: string,
  predictionUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const sharedToProfile = await getUserProfileById(sharedToUserId);
    if (!sharedToProfile) {
      return { success: false, error: "User profile not found" };
    }

    const sharedByProfile = await getUserProfileById(sharedByUserId);
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
      from: EMAIL_FROM,
      to: sharedToProfile.email,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    await mailer.sendMail(emailOptions);

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
      from: EMAIL_FROM,
      to: CONTACT_EMAIL,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    await mailer.sendMail(emailOptions);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
