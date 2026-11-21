/*
 * This is the Sign-Up screen, where a new user creates an account and where
 * signed-out visitors can browse the public resources. It takes no props; it
 * gets the signUp function from the AuthProvider through useAuth, validates
 * the form with React Hook Form and the Zod signUpSchema, and loads every
 * resource that RLS allows the anonymous role to read from Supabase.
 * While requests run it shows loading spinners, and any Supabase error is
 * turned into a readable message. On success the user is either signed in
 * and sent to the home screen by the protected stack, or told to confirm
 * their email if email confirmation is turned on in Supabase.
 */

// ===== Imports =====
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthProvider";
import { signUpSchema, type SignUpFormValues } from "../schemas/authSchemas";
import { getAuthErrorMessage } from "../utils/authErrors";
import { supabase } from "../utils/supabase";

// ===== Constants =====
const PLACEHOLDER_COLOR = "#6B7280";

// ===== Types =====
type Resource = {
  id: number;
  title: string | null;
  description: string | null;
};

// ===== Component =====
export default function SignUpScreen() {
  const { signUp } = useAuth();

  // Sign-up feedback: Supabase error, or confirmation message on success
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Public resources state
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState<string | null>(null);

  // ----- Form Setup -----
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  // ----- Load Public Resources -----
  // The user is signed out on this screen, so RLS only returns the rows
  // the anon role is allowed to read (is_public = true).
  useEffect(() => {
    let isActive = true;

    const loadResources = async () => {
      try {
        const { data, error } = await supabase
          .from("resources")
          .select("id, title, description")
          .eq("is_public", true)
          .order("id");

        if (error) {
          throw error;
        }

        if (isActive) {
          setResources(data ?? []);
        }
      } catch (error) {
        console.error("Error loading public resources:", error);

        if (isActive) {
          setResourcesError(
            "Unable to load public resources. Please check your connection and try again later.",
          );
        }
      } finally {
        if (isActive) {
          setResourcesLoading(false);
        }
      }
    };

    loadResources();

    // Ignore late results if the screen closes before the request finishes
    return () => {
      isActive = false;
    };
  }, []);

  // ----- Submit Handler -----
  // Only runs after the Zod schema passes. isSubmitting stays true
  // until this async function finishes, which drives the spinner.
  const onSubmit = async (values: SignUpFormValues) => {
    setAuthError(null);
    setSuccessMessage(null);

    try {
      await signUp(values.email, values.password);

      // If Supabase returns a session, the protected stack switches to the
      // home screen on its own. If email confirmation is on, no session is
      // returned and the user stays here, so tell them what to do next.
      setSuccessMessage(
        "Account created! If you are not signed in automatically, check your email to confirm your account, then sign in.",
      );
      reset();
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
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create an Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        {/* Auth error banner */}
        {authError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{authError}</Text>
          </View>
        )}

        {/* Success banner */}
        {successMessage && (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>{successMessage}</Text>
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
              placeholder="At least 8 characters"
              placeholderTextColor={PLACEHOLDER_COLOR}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!isSubmitting}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && (
          <Text style={styles.fieldError}>{errors.password.message}</Text>
        )}

        {/* Confirm password field */}
        <Text style={styles.label}>Confirm Password</Text>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && styles.inputError,
              ]}
              placeholder="Re-enter your password"
              placeholderTextColor={PLACEHOLDER_COLOR}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!isSubmitting}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              onSubmitEditing={submitForm}
            />
          )}
        />
        {errors.confirmPassword && (
          <Text style={styles.fieldError}>
            {errors.confirmPassword.message}
          </Text>
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
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </Pressable>

        {/* Link to Sign-In */}
        {/* dismissTo goes back to the existing Sign-In screen in the stack */}
        {/* this makes it so the stack does not keep growing with multiple Sign-In screens */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/sign-in" dismissTo style={styles.link}>
            Sign In
          </Link>
        </View>

        {/* ----- Public Resources ----- */}
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>Public Resources</Text>

          {resourcesLoading ? (
            <ActivityIndicator style={styles.resourcesLoading} />
          ) : resourcesError ? (
            <Text style={styles.fieldError}>{resourcesError}</Text>
          ) : resources.length === 0 ? (
            <Text style={styles.emptyText}>No public resources yet.</Text>
          ) : (
            // data for each public resource is acquired from the resources array
            // Each resource is displayed as a card with its title and optional description
            // note that these are not interactive elements, just informational cards
            resources.map((resource) => (
              <View key={resource.id} style={styles.resourceCard}>
                <Text style={styles.resourceTitle}>
                  {resource.title ?? "Untitled"}
                </Text>
                {resource.description && (
                  <Text style={styles.resourceDescription}>
                    {resource.description}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== Styles =====
// Form styles match sign-in.tsx so both auth screens look the same
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
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
  successBanner: {
    backgroundColor: "#DCFCE7",
    borderColor: "#16A34A",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successBannerText: {
    color: "#166534",
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
  resourcesSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  resourcesLoading: {
    marginVertical: 16,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
  },
  resourceCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  resourceDescription: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 4,
  },
});
