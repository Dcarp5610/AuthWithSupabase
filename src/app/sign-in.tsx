/*
 * This is the Sign-In screen, where a returning user logs in with their
 * email and password. It takes no props; it gets the signIn function from
 * the AuthProvider through useAuth and validates the form with React Hook
 * Form and the Zod signInSchema. While the request runs it shows a loading
 * spinner, and if Supabase rejects it the error is turned into a readable
 * message. On success the AuthProvider receives the new session and the
 * protected stack in _layout.tsx sends the user to the home screen.
 */

// ===== Imports =====
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthProvider";
import { signInSchema, type SignInFormValues } from "../schemas/authSchemas";
import { getAuthErrorMessage } from "../utils/authErrors";

// ===== Constants =====
const PLACEHOLDER_COLOR = "#6B7280";

// ===== Component =====
export default function SignInScreen() {
  const { signIn } = useAuth();

  // Error returned by Supabase (wrong password, network error, etc.)
  const [authError, setAuthError] = useState<string | null>(null);

  // ----- Form Setup -----
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  // ----- Submit Handler -----
  // Only runs after the Zod schema passes. isSubmitting stays true
  // until this async function finishes, which drives the spinner.
  const onSubmit = async (values: SignInFormValues) => {
    setAuthError(null);

    try {
      await signIn(values.email, values.password);
      // No navigation needed: the new session switches the protected stack
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    }
  };

  // Wrapped in an arrow function so the press event is not passed to
  // handleSubmit (React Native's event type does not match the web one)
  const submitForm = () => handleSubmit(onSubmit)();

  // ----- Render -----
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        {/* Auth error banner */}
        {authError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{authError}</Text>
          </View>
        )}

        {/* Email field */}
        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="you@example.com"
              placeholderTextColor={PLACEHOLDER_COLOR}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              editable={!isSubmitting}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.fieldError}>{errors.email.message}</Text>
        )}

        {/* Password field */}
        <Text style={styles.label}>Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Your password"
              placeholderTextColor={PLACEHOLDER_COLOR}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              editable={!isSubmitting}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              onSubmitEditing={submitForm}
            />
          )}
        />
        {errors.password && (
          <Text style={styles.fieldError}>{errors.password.message}</Text>
        )}

        {/* Submit button with loading indicator */}
        <Pressable
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={submitForm}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </Pressable>

        {/* Link to Sign-Up */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/sign-up" style={styles.link}>
            Sign Up
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  errorBanner: {
    backgroundColor: "#FEE2E2",
    borderColor: "#DC2626",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: "#991B1B",
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  inputError: {
    borderColor: "#DC2626",
  },
  fieldError: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#6B7280",
    fontSize: 14,
  },
  link: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
});
