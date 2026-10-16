// System-managed layout — extend in place, never rewrite from scratch.
// Keep the provider chain intact: ErrorBoundary → OneDollarStats → SafeArea → QueryClient.
// To switch navigation, replace only the <Slot /> line with <Stack /> or <Tabs />.
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { ErrorBoundary } from "../components/__ErrorBoundary";
import { OneDollarStatsProvider } from "../lib/__analytics";
import { isWeb, startWebSafeArea } from "../lib/__web-safe-area";
import { authClient } from "../lib/auth";
import { FitDrawProvider } from "../lib/fitdraw-context";
import { ThemeProvider, useTheme } from "../lib/theme";
import appJson from "../app.json";

const queryClient = new QueryClient();

const applicationId = appJson.expo.extra.applicationId ?? "";
const hostname = applicationId ? `${applicationId}-mobile` : "localhost";

/** Barre d'état + fond de navigation accordés au thème FitDraw. */
function ThemedShell({ children }: { children: React.ReactNode }) {
  const { theme, colors } = useTheme();
  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <View style={[styles.shell, { backgroundColor: colors.background }]}>{children}</View>
    </>
  );
}

function Booting() {
  const { colors } = useTheme();
  return (
    <View style={[styles.booting, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    // Précharge la police des icônes. Sans elle, Android ne trouve pas la
    // famille "ionicons" au premier rendu et applique sa police de repli :
    // les glyphes sortent alors en caractères chinois.
    ...Ionicons.font,
  });

  useEffect(() => {
    if (isWeb) startWebSafeArea();
  }, []);

  // Termine une connexion managed qui revient par redirection (no-op sur natif).
  useEffect(() => {
    void authClient.managedAuth.handleRedirect();
  }, []);

  return (
    <ErrorBoundary>
      {/* Runable analytics provider — do not remove, required for analytics tracking */}
      <OneDollarStatsProvider
        config={{
          hostname,
          collectorUrl: "https://r.lilstts.com/events",
          devmode: true,
        }}
      >
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <FitDrawProvider>
                <ThemedShell>
                  {fontsLoaded ? (
                    <Stack
                      screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: "transparent" },
                      }}
                    />
                  ) : (
                    <Booting />
                  )}
                </ThemedShell>
              </FitDrawProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </OneDollarStatsProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  booting: { flex: 1, alignItems: "center", justifyContent: "center" },
});
