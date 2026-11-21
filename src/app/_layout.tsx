/*
 * This is the root layout that every screen in the app is rendered inside.
 * It wraps the app in the AuthProvider so all screens can read the auth state.
 * While the saved session is being restored it shows a loading screen, then it uses
 * Stack.Protected guards to decide which screens are reachable.
 * Signed-out users can only reach Sign-In and Sign-Up, and signed-in users can only
 * reach the home screen, which shows their email in the navigation bar.
 */

// ===== Imports =====
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { AuthProvider, useAuth } from "../context/AuthProvider";

// ===== Root Navigator =====
// Separate from RootLayout so it can call useAuth inside the AuthProvider
function RootNavigator() {
  const { session, user, loading } = useAuth();

  // ----- Session Restore Loading Screen -----
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ----- Protected Navigation -----
  return (
    <Stack>
      {/* Only reachable when signed out */}
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Only reachable when signed in; the title shows the user's email */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="index" options={{ title: user?.email ?? "Home" }} />
      </Stack.Protected>
    </Stack>
  );
}

// ===== Root Layout =====
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
