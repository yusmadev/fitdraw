// Retour de connexion managed auth.
//
// Le chemin correspond au `redirectPath` par défaut du plugin Expo
// (`auth/callback`) : le broker y renvoie via le deep link de l'app. Le routeur
// doit avoir un écran où atterrir, même quand la session est déjà résolue par
// `openAuthSessionAsync` — on termine la redirection puis on repart vers l'atelier.
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Fonts } from "../../constants/theme";
import { authClient } from "../../lib/auth";
import { useTheme } from "../../lib/theme";

export default function AuthCallbackScreen() {
  const { colors } = useTheme();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const res = await authClient.managedAuth.handleRedirect();
        if (res?.error) setError(res.error.message ?? "Connexion interrompue.");
      } catch {
        setError("Connexion interrompue.");
      }
      if (!alive) return;
      setTimeout(() => router.replace("/"), 600);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.text, { color: colors.mutedForeground }]}>
          {error ?? "Connexion en cours…"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 24 },
  text: { fontSize: 13.5, fontFamily: Fonts.medium, textAlign: "center" },
});
