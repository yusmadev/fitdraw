// Nom de boutique, logo et filigrane de l'export — mêmes champs que le panneau web.
import { useState } from "react";
import { Image, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts, Radii } from "../constants/theme";
import { pickLogo } from "../lib/logo";
import type { Branding } from "../lib/store";
import { useTheme } from "../lib/theme";

interface Props {
  branding: Branding;
  onChange: (branding: Branding) => void;
}

export default function BrandingPanel({ branding, onChange }: Props) {
  const { theme, colors } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const choose = async () => {
    setBusy(true);
    try {
      const res = await pickLogo();
      if (res.cancelled) return;
      if (!res.ok || !res.dataUrl) {
        setError(res.error ?? "Logo refusé.");
        return;
      }
      setError(null);
      onChange({ ...branding, logoDataUrl: res.dataUrl });
    } catch {
      setError("Logo refusé.");
    } finally {
      setBusy(false);
    }
  };

  const warnText = theme === "dark" ? "#F2777A" : "#B4483F";

  return (
    <View style={styles.wrap}>
      <View style={styles.block}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Nom de la boutique</Text>
        <TextInput
          value={branding.shopName}
          onChangeText={(shopName) => onChange({ ...branding, shopName })}
          maxLength={32}
          placeholder="FitDraw"
          placeholderTextColor={colors.mutedForeground}
          accessibilityLabel="Nom de la boutique"
          style={[styles.input, { backgroundColor: colors.surface2, color: colors.foreground }]}
        />
        <Text style={[styles.help, { color: colors.mutedForeground }]}>
          Apparaît en bas de l'export. 32 caractères max.
        </Text>
      </View>

      <View style={styles.block}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Logo</Text>
        <View style={styles.logoRow}>
          <View style={[styles.logoBox, { backgroundColor: colors.surface2 }]}>
            {branding.logoDataUrl ? (
              <Image
                source={{ uri: branding.logoDataUrl }}
                style={styles.logoImg}
                resizeMode="contain"
                accessibilityLabel="Logo de la boutique"
              />
            ) : (
              <Text style={[styles.logoEmpty, { color: colors.mutedForeground }]}>vide</Text>
            )}
          </View>

          <View style={styles.logoActions}>
            <Pressable
              onPress={() => void choose()}
              disabled={busy}
              style={({ pressed }) => [
                styles.pill,
                { backgroundColor: colors.surface },
                pressed || busy ? { opacity: 0.7 } : null,
              ]}
            >
              <Text style={[styles.pillText, { color: colors.foreground }]}>
                {busy ? "Chargement…" : "Choisir un logo"}
              </Text>
            </Pressable>

            {branding.logoDataUrl ? (
              <Pressable
                onPress={() => onChange({ ...branding, logoDataUrl: "" })}
                style={({ pressed }) => [
                  styles.pill,
                  { backgroundColor: colors.surface },
                  pressed ? { opacity: 0.7 } : null,
                ]}
              >
                <Ionicons name="close" size={14} color={colors.mutedForeground} />
                <Text style={[styles.pillText, { color: colors.mutedForeground }]}>Retirer</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
        <Text style={[styles.help, { color: colors.mutedForeground }]}>
          PNG, JPG ou WebP · redimensionné à 256 px.
        </Text>
        {error ? <Text style={[styles.error, { color: warnText }]}>{error}</Text> : null}
      </View>

      <View style={[styles.switchRow, { backgroundColor: colors.surface2 }]}>
        <View style={styles.switchText}>
          <Text style={[styles.switchTitle, { color: colors.foreground }]}>Filigrane FitDraw</Text>
          <Text style={[styles.help, { color: colors.mutedForeground }]}>Motif incliné sur le croquis exporté.</Text>
        </View>
        <Switch
          value={branding.showWatermark}
          onValueChange={(showWatermark) => onChange({ ...branding, showWatermark })}
          trackColor={{ true: colors.primary, false: colors.borderStrong }}
          thumbColor="#FFFFFF"
          accessibilityLabel="Filigrane FitDraw"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 20 },
  block: { gap: 8 },
  label: { fontSize: 11, fontFamily: Fonts.bold, letterSpacing: 0.9, textTransform: "uppercase" },
  input: {
    height: 46,
    borderRadius: Radii.input,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: Fonts.medium,
  },
  help: { fontSize: 11.5, fontFamily: Fonts.regular, lineHeight: 16 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoBox: { height: 56, width: 56, borderRadius: Radii.row, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  logoImg: { height: "100%", width: "100%" },
  logoEmpty: { fontSize: 11, fontFamily: Fonts.medium },
  logoActions: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    height: 40,
    borderRadius: 999,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pillText: { fontSize: 13, fontFamily: Fonts.bold },
  error: { fontSize: 11.5, fontFamily: Fonts.medium },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: Radii.row,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  switchText: { flex: 1, gap: 2 },
  switchTitle: { fontSize: 14, fontFamily: Fonts.medium },
});
