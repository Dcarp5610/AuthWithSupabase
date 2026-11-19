import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useAuth } from "../context/AuthProvider";

export default function SignOut() {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError(null);

      await signOut();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign out. Please try again later. ",
      );
    } finally {
      setLoading(false);
    }
  };

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
