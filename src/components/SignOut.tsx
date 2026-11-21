/*
 * This component is the Sign Out button shown on the protected home screen.
 * It takes no props and gets the signOut function from the AuthProvider through useAuth.
 * When pressed it calls Supabase to end the session, showing a spinner while the
 * request runs and a readable error message below the button if it fails.
 * Once signed out, the protected stack in _layout.tsx sends the user back to Sign-In.
 */

// ===== Imports =====
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useAuth } from "../context/AuthProvider";
import { getAuthErrorMessage } from "../utils/authErrors";

// ===== Component =====
export default function SignOut() {
  const { signOut } = useAuth();
  // Button loading state and any sign-out error message
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----- Sign Out Handler -----
  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError(null);

      await signOut();
    } catch (error) {
      setError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // ----- Render -----
  return (
    <View>
      <Pressable
        style={styles.button}
        onPress={handleSignOut}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Sign Out</Text>
        )}
      </Pressable>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  button: {
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#DC2626",
    marginTop: 8,
    textAlign: "center",
  },
});
