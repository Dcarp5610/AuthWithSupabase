/*
 * This file defines the Zod validation schemas used by the Sign-In and
 * Sign-Up forms. The schemas are passed to React Hook Form through zodResolver, 
 * which checks each field as the user submits.
 * The sign-up schema also compares the password and confirm password
 * fields so mismatches are caught before any request is sent to Supabase.
 * It outputs the two schemas plus matching TypeScript types for each
 * form's values, so the screens get type-safe form data.
 */

// ===== Imports =====
import { z } from "zod";

// ===== Shared Rules =====
export const PASSWORD_MIN_LENGTH = 8;

const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .pipe(z.email("Please enter a valid email address"));

// ===== Sign-In Schema =====
// Only checks that a password was entered length rules are not applied
// This makes it so existing users are never blocked from signing in
export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

// ===== Sign-Up Schema =====
export const signUpSchema = z
  .object({
    email: emailField,
    password: z
      .string()
      .min(1, "Password is required")
      .min(
        PASSWORD_MIN_LENGTH,
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      )
      // Require at least one letter and one number for stronger passwords
      .regex(/[A-Za-z]/, "Password must include at least one letter")
      .regex(/[0-9]/, "Password must include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  // Password confirmation: show the error under the confirm field
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ===== Form Value Types =====
export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
