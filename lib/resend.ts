import { Resend } from "resend";

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function createResendClient() {
  return new Resend(getRequiredEnv("RESEND_API_KEY"));
}

export function getResendFromEmail() {
  return process.env.RESEND_FROM_EMAIL ?? "Magnetify Studio <onboarding@resend.dev>";
}
