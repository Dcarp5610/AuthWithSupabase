/*
 * This is the home screen of the app and the main protected route that only
 * signed-in users can reach.
 */

// ===== Imports =====
import { StyleSheet, Text, View } from "react-native";

// ===== Component =====
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
    </View>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
});
