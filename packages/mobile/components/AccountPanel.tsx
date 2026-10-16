// Compte : connexion Google (managed) ou e-mail / mot de passe, plus l'état de la synchro.
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts, Radii } from "../constants/theme";
import { authClient, captureToken } from "../lib/auth";
import type { SyncState } from "../lib/sync";
import { useTheme } from "../lib/theme";

type Mode = "signin" | "signup";

interface Props {
  localCount: number;
  syncState?: SyncState;
}

export default function AccountPanel({ localCount, syncState = "idle" }: Props) {
  const { theme, colors } = useTheme();
  const { data: session, isPending } = authClient.useSession();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const warnText = theme === "dark" ? "#F2777A" : "#B4483F";

  const google = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await authClient.managedAuth.signIn({ provider: "google" });
      if (res.error && res.error.code !== "POPUP_CLOSED") {
        setError(res.error.message ?? "Connexion Google impossible.");
      }
    } catch {
      setError("Connexion Google impossible.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      const res =
        mode === "signin"
          ? await authClient.signIn.email({ email, password }, { onSuccess: captureToken })
          : await authClient.signUp.email(
              { email, password, name: name || email.split("@")[0] },
              { onSuccess: captureToken },
            );
      if (res.error) setError(res.error.message ?? "Connexion refusée.");
    } catch {
      setError("Connexion refusée.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    try {
      await authClient.signOut();
      authClient.managedAuth.clearToken();
    } catch {
      setError("Déconnexion impossible.");
    } finally {
      setBusy(false);
    }
  };

  if (isPending) {
    return <Text style={[styles.muted, { color: colors.mutedForeground }]}>Vérification de la session…</Text>;
  }

  if (session) {
    const label =
      syncState === "syncing" ? "Synchronisation…" : syncState === "error" ? "Synchro interrompue" : "Synchronisé";
    const dot =
      syncState === "error" ? colors.destructive : syncState === "syncing" ? colors.warning : colors.success;
    const initial = (session.user.name || session.user.email || "?").slice(0, 1).toUpperCase();

    return (
      <View style={styles.wrap}>
        <View style={styles.identity}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.identityText}>
            <Text numberOfLines={1} style={[styles.name, { color: colors.foreground }]}>
              {session.user.name || "Ton compte"}
            </Text>
            <Text numberOfLines={1} style={[styles.muted, { color: colors.mutedForeground }]}>
              {session.user.email}
            </Text>
          </View>
        </View>

        <View style={[styles.status, { backgroundColor: colors.surface2 }]}>
          <View style={[styles.dot, { backgroundColor: dot }]} />
          <Text style={[styles.statusText, { color: colors.foreground }]}>{label}</Text>
        </View>

        <Text style={[styles.body, { color: colors.mutedForeground }]}>
          Tes {localCount} brouillons sont enregistrés sur cet appareil et se copient automatiquement sur tes autres
          appareils. Rien à faire.
        </Text>

        <Pressable
          onPress={() => void signOut()}
          disabled={busy}
          style={({ pressed }) => [
            styles.secondary,
            { backgroundColor: colors.surface },
            pressed || busy ? { opacity: 0.7 } : null,
          ]}
        >
          <Text style={[styles.secondaryText, { color: colors.foreground }]}>Se déconnecter</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>
        Connecte-toi pour retrouver tes {localCount} croquis sur tous tes appareils. Tes brouillons actuels sont
        conservés et envoyés à la connexion.
      </Text>

      <Pressable
        onPress={() => void google()}
        disabled={busy}
        style={({ pressed }) => [
          styles.google,
          { backgroundColor: colors.surface },
          pressed || busy ? { opacity: 0.7 } : null,
        ]}
      >
        <Ionicons name="logo-google" size={18} color={colors.foreground} />
        <Text style={[styles.googleText, { color: colors.foreground }]}>Continuer avec Google</Text>
      </Pressable>

      <View style={styles.separator}>
        <View style={[styles.rule, { backgroundColor: colors.border }]} />
        <Text style={[styles.or, { color: colors.mutedForeground }]}>ou</Text>
        <View style={[styles.rule, { backgroundColor: colors.border }]} />
      </View>

      <View style={[styles.segmented, { backgroundColor: colors.surface }]}>
        {(["signin", "signup"] as Mode[]).map((m) => {
          const active = mode === m;
          return (
            <Pressable
              key={m}
              onPress={() => {
                setMode(m);
                setError(null);
              }}
              style={[styles.segment, active ? { backgroundColor: colors.card } : null]}
            >
              <Text style={[styles.segmentText, { color: active ? colors.foreground : colors.mutedForeground }]}>
                {m === "signin" ? "Se connecter" : "Créer un compte"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.form}>
        {mode === "signup" ? (
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nom"
            placeholderTextColor={colors.mutedForeground}
            autoComplete="name"
            style={[styles.input, { backgroundColor: colors.surface2, color: colors.foreground }]}
          />
        ) : null}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="adresse@exemple.fr"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          style={[styles.input, { backgroundColor: colors.surface2, color: colors.foreground }]}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Mot de passe (8 caractères min.)"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry
          autoCapitalize="none"
          style={[styles.input, { backgroundColor: colors.surface2, color: colors.foreground }]}
        />
        {error ? <Text style={[styles.error, { color: warnText }]}>{error}</Text> : null}
        <Pressable
          onPress={() => void submit()}
          disabled={busy || !email || password.length < 8}
          style={({ pressed }) => [
            styles.primary,
            { backgroundColor: colors.primary },
            pressed || busy || !email || password.length < 8 ? { opacity: 0.6 } : null,
          ]}
        >
          <Text style={styles.primaryText}>{mode === "signin" ? "Se connecter" : "Créer mon compte"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 18 },
  muted: { fontSize: 13.5, fontFamily: Fonts.regular },
  body: { fontSize: 13, fontFamily: Fonts.regular, lineHeight: 19 },
  identity: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { height: 44, width: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 15, fontFamily: Fonts.bold, color: "#FFFFFF" },
  identityText: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontSize: 14.5, fontFamily: Fonts.bold },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: Radii.row,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dot: { height: 8, width: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontFamily: Fonts.medium },
  secondary: { height: 46, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  secondaryText: { fontSize: 13.5, fontFamily: Fonts.bold },
  google: {
    height: 50,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleText: { fontSize: 14, fontFamily: Fonts.bold },
  separator: { flexDirection: "row", alignItems: "center", gap: 10 },
  rule: { flex: 1, height: StyleSheet.hairlineWidth },
  or: { fontSize: 11, fontFamily: Fonts.bold, letterSpacing: 0.9 },
  segmented: { flexDirection: "row", borderRadius: 999, padding: 3 },
  segment: { flex: 1, height: 34, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  segmentText: { fontSize: 13, fontFamily: Fonts.bold },
  form: { gap: 10 },
  input: { height: 46, borderRadius: Radii.input, paddingHorizontal: 14, fontSize: 14.5, fontFamily: Fonts.regular },
  error: { fontSize: 12, fontFamily: Fonts.medium },
  primary: { height: 50, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  primaryText: { fontSize: 14, fontFamily: Fonts.bold, color: "#FFFFFF" },
});
