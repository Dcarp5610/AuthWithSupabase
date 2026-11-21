/*
 * This file creates the single Supabase client that the whole app shares.
 * It reads the project URL and publishable key from the EXPO_PUBLIC_ environment
 * variables in the .env file, so no credentials are hardcoded or committed.
 * If either variable is missing it throws an error right away instead of failing later.
 * The client saves the auth session to device storage, refreshes tokens automatically,
 * and is exported for the AuthProvider and the screens to use.
 */

// ===== Imports =====
// Polyfills: localStorage backed by expo-sqlite (where the session is saved)
// and URL support, which Supabase needs in React Native
import "expo-sqlite/localStorage/install";
import "react-native-url-polyfill/auto";

import { createClient } from "@supabase/supabase-js";

// ===== Environment Variables =====
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Stop early with a clear message if the .env file is missing or incomplete
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in your environment.",
  );
}

// ===== Supabase Client =====
// persistSession keeps users signed in after the app closes, and
// detectSessionInUrl is off because mobile apps do not use URL redirects
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
