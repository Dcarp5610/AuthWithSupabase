/*
 * This file converts errors from Supabase Auth into short, readable messages
 * that the Sign-In and Sign-Up screens can then show to the user. 
 * Its input is any error caught in a try/catch block, typed as unknown because anything can be thrown. 
 * Checks for network failures first, then weak password errors,
 * then matches Supabase's error codes such as invalid_credentials.
 * It always outputs a plain string, so the screens never display a raw
 * technical error and the app never crashes on an unexpected error shape.
 */

// ===== Imports =====
import {
  isAuthApiError,
  isAuthError,
  isAuthRetryableFetchError,
  isAuthWeakPasswordError,
} from "@supabase/supabase-js";

import { PASSWORD_MIN_LENGTH } from "../schemas/authSchemas";

// ===== Messages =====
const NETWORK_ERROR_MESSAGE =
  "Unable to reach the server. Please check your internet connection and try again.";

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

// Messages for Supabase Auth error codes the app is likely to see
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Incorrect email or password.",
  email_not_confirmed:
    "Please confirm your email address before signing in. Check your inbox for the confirmation link.",
  user_already_exists: "An account with this email already exists. Try signing in instead.",
  email_exists: "An account with this email already exists. Try signing in instead.",
  email_address_invalid: "Please enter a valid email address.",
  weak_password: `Your password is too weak. Use at least ${PASSWORD_MIN_LENGTH} characters with at least one letter and one number.`,
  signup_disabled: "New sign-ups are currently disabled.",
  over_request_rate_limit: "Too many attempts. Please wait a moment and try again.",
  over_email_send_rate_limit:
    "Too many emails have been sent. Please wait a few minutes and try again.",
  user_banned: "This account has been suspended.",
  request_timeout: "The request timed out. Please try again.",
};

// ===== Helpers =====
// React Native's fetch throws a TypeError with this message when offline
function isNetworkError(error: unknown): boolean {
  if (isAuthRetryableFetchError(error)) {
    return true;
  }

  return (
    error instanceof TypeError &&
    /network request failed|failed to fetch|load failed/i.test(error.message)
  );
}

// ===== Main Function =====
export function getAuthErrorMessage(error: unknown): string {
  // Network problems (no internet, server unreachable)
  if (isNetworkError(error)) {
    return NETWORK_ERROR_MESSAGE;
  }

  // Weak password rejected by Supabase
  if (isAuthWeakPasswordError(error)) {
    return AUTH_ERROR_MESSAGES.weak_password;
  }

  // Known Supabase Auth error codes
  if (isAuthApiError(error) && error.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }

  // Any other Supabase Auth error
  if (isAuthError(error) && error.message) {
    return error.message;
  }

  // Anything else that was thrown
  return FALLBACK_MESSAGE;
}
