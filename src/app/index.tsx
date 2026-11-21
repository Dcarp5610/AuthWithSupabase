/*
 * This is the home screen and the main protected route, so only signed-in
 * users can reach it. It gets the signed-in user from the AuthProvider through useAuth
 * and loads the private rows of the resources table
 * which RLS only returns to the authenticated role.
 * It shows a loading spinner while the data loads
 * readable message if the request fails with a Try Again button to reload, and supports pull-to-refresh.
 * Its output is a welcome header, the protected resources rendered in a FlatList, and the sign-out button.
 */

// ===== Imports =====
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SignOut from "../components/SignOut";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../utils/supabase";

// ===== Types =====
type Resource = {
  id: number;
  title: string | null;
  description: string | null;
};

// ===== Component =====
export default function HomeScreen() {
  const { user } = useAuth();

  // Protected resources state
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----- Load Protected Resources -----
  // These rows have is_public = false, so the RLS policy only returns
  // them when the request carries a signed-in user's session.
  const loadResources = useCallback(async () => {
    try {
      setError(null);

      const { data, error: queryError } = await supabase
        .from("resources")
        .select("id, title, description")
        .eq("is_public", false)
        .order("id");

      if (queryError) {
        throw queryError;
      }

      setResources(data ?? []);
    } catch (loadError) {
      console.error("Error loading protected resources:", loadError);
      setError(
        "Unable to load your resources. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  // ----- Pull To Refresh -----
  const handleRefresh = () => {
    setRefreshing(true);
    loadResources();
  };

  // ----- Retry After An Error -----
  const handleRetry = () => {
    setLoading(true);
    loadResources();
  };

  // ----- Render: Single Resource Card -----
  const renderResource = ({ item }: { item: Resource }) => (
    <View style={styles.resourceCard}>
      <Text style={styles.resourceTitle}>{item.title ?? "Untitled"}</Text>
      {item.description && (
        <Text style={styles.resourceDescription}>{item.description}</Text>
      )}
    </View>
  );

  // ----- Render: Empty, Loading, Or Error State -----
  const renderEmptyState = () => {
    if (loading) {
      return <ActivityIndicator size="large" style={styles.stateSpacing} />;
    }

    if (error) {
      return (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return <Text style={styles.emptyText}>No protected resources yet.</Text>;
  };

  // ----- Render: Screen -----
  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <FlatList
        data={error ? [] : resources}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderResource}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Signed in as {user?.email ?? "your account"}
            </Text>
            <Text style={styles.sectionTitle}>Your Resources</Text>
            <Text style={styles.sectionHint}>
              Only visible to signed-in users
            </Text>
          </View>
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={
          <View style={styles.footer}>
            <SignOut />
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ===== Styles =====
// Colours and spacing match sign-in.tsx and sign-up.tsx
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  sectionHint: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  resourceCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
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
  stateSpacing: {
    marginVertical: 32,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 32,
  },
  errorBanner: {
    backgroundColor: "#FEE2E2",
    borderColor: "#DC2626",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorBannerText: {
    color: "#991B1B",
    fontSize: 14,
  },
  retryButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#DC2626",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    marginTop: 24,
  },
});
