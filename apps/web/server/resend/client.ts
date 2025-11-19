import { Resend } from "resend";
import { RESEND_API_KEY } from "../constants";

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

export const resend = new Resend(RESEND_API_KEY);
