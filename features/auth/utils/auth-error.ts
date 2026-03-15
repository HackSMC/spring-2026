import type { AuthError } from "@supabase/supabase-js";
import type { LoginError, RegistrationError } from "../types/auth";

export function parseRegistrationError(error: AuthError | string): RegistrationError {
  const msg = (typeof error === "string" ? error : error.message).toLowerCase();
  if (msg.includes("already registered") || msg.includes("already been registered")) return "email_taken";
  if (msg.includes("password") && msg.includes("weak")) return "weak_password";
  if (msg.includes("rate limit") || (typeof error !== "string" && error.status === 429)) return "rate_limit";
  return "unknown";
}

export function parseLoginError(error: AuthError): LoginError {
  const msg = error.message.toLowerCase();
  if (msg.includes("invalid login") || msg.includes("invalid credentials") || msg.includes("wrong password")) return "invalid_credentials";
  if (msg.includes("email not confirmed") || msg.includes("confirm your email")) return "email_not_confirmed";
  if (msg.includes("rate limit") || error.status === 429) return "rate_limit";
  return "unknown";
}

export const REGISTRATION_ERROR_MESSAGES: Record<RegistrationError, string> = {
  email_taken: "An account with this email already exists. Try signing in instead.",
  weak_password: "Password is too weak. Use a mix of letters, numbers, and symbols.",
  rate_limit: "Too many attempts. Please wait a moment and try again.",
  unknown: "Something went wrong. Please try again.",
};

export const LOGIN_ERROR_MESSAGES: Record<LoginError, string> = {
  invalid_credentials: "Wrong email or password. Please try again.",
  email_not_confirmed: "Please confirm your email before signing in. Check your inbox.",
  rate_limit: "Too many attempts. Please wait a moment and try again.",
  unknown: "Something went wrong. Please try again.",
};