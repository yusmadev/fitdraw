// Barre d'actions : Copier / Partager / Exporter.
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "../constants/theme";
import { useTheme } from "../lib/theme";

interface Props {
  onCopy: () => void;
  onShare: () => void;
  onExport: () => void;
  busy?: boolean;
}

export default function ActionBar({ onCopy, onShare, onExport, busy = false }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.bar}>
      <Pressable
        onPress={onCopy}
        accessibilityRole="button"
        accessibilityLabel="Copier les mesures"
        style={({ pressed }) => [styles.btn, { backgroundColor: colors.surface }, pressed ? { opacity: 0.75 } : null]}
      >
        <Ionicons name="copy-outline" size={17} color={colors.foreground} />
        <Text style={[styles.label, { color: colors.foreground }]}>Copier</Text>
      </Pressable>

      <Pressable
        onPress={onShare}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Partager le croquis"
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: colors.surface },
          pressed || busy ? { opacity: 0.75 } : null,
        ]}
      >
        {busy ? (
          <ActivityIndicator size="small" color={colors.foreground} />
        ) : (
          <Ionicons name="share-outline" size={17} color={colors.foreground} />
        )}
        <Text style={[styles.label, { color: colors.foreground }]}>Partager</Text>
      </Pressable>

      <Pressable
        onPress={onExport}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Exporter en PNG 1600 par 1600"
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: colors.primary },
          pressed || busy ? { opacity: 0.75 } : null,
        ]}
      >
        <Ionicons name="download-outline" size={17} color="#FFFFFF" />
        <Text style={[styles.label, styles.labelOnAccent]}>Exporter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 8 },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: { fontSize: 13.5, fontFamily: Fonts.bold },
  labelOnAccent: { color: "#FFFFFF" },
});
