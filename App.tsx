import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation";
import { initializeDatabase } from "./src/db/database";
import { usePropertyStore } from "./src/store/propertyStore";
import { colors } from "./src/utils/theme";

function AppBootstrap() {
  const loadProperties = usePropertyStore((s) => s.loadProperties);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      initializeDatabase();
      loadProperties();
      setReady(true);
    } catch (err) {
      console.error("[App] Bootstrap error:", err);
      setError(String(err));
    }
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to initialize: {error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppBootstrap />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: "center",
    padding: 24,
  },
});
