/*
 * This is the root layout that every screen in the app is rendered inside.
 * It wraps the app in the AuthProvider so all screens can read the auth state.
 * While the saved session is being restored it shows a loading screen, then it uses
 * Stack.Protected guards to decide which screens are reachable.
 * Signed-out users can only reach Sign-In and Sign-Up, and signed-in users can only
 * reach the home screen.
 */

// ===== Imports =====
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { AuthProvider, useAuth } from "../context/AuthProvider";

// ===== Root Navigator =====
function RootNavigator() {
  const { session, loading } = useAuth();

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
    <Stack
      screenOptions={{
        headerTransparent: false,
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerTintColor: "#111827",
        headerShadowVisible: true,
      }}
    >
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!!session}>
        <Stack.Screen
          name="index"
          options={{
            title: "Home",
          }}
        />
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
