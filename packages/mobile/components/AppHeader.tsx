// En-tête FitDraw : marque, bascule d'unité, thème clair/sombre, accès au compte.
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "../constants/theme";
import type { Unit } from "@template/web/fitdraw/renderSketch";
import { useTheme } from "../lib/theme";
import UnitToggle from "./UnitToggle";

interface Props {
  unit: Unit;
  onUnit: (unit: Unit) => void;
  onAccount: () => void;
}

export default function AppHeader({ unit, onUnit, onAccount }: Props) {
  const { theme, colors, toggleTheme } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.brand}>
        <View style={styles.mark}>
          <Ionicons name="shirt-outline" size={18} color="#FFFFFF" />
        </View>
        <Text style={[styles.brandName, { color: colors.foreground }]}>FitDraw</Text>
      </View>

      <View style={styles.spacer} />

      <UnitToggle unit={unit} onChange={onUnit} />

      <Pressable
        onPress={toggleTheme}
        accessibilityRole="button"
        accessibilityLabel={theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre"}
        hitSlop={6}
        style={({ pressed }) => [
          styles.icon,
          { backgroundColor: colors.surface },
          pressed ? { opacity: 0.7 } : null,
        ]}
      >
        <Ionicons
          name={theme === "dark" ? "sunny-outline" : "moon-outline"}
          size={16}
          color={colors.mutedForeground}
        />
      </Pressable>

      <Pressable
        onPress={onAccount}
        accessibilityRole="button"
        accessibilityLabel="Compte"
        hitSlop={6}
        style={({ pressed }) => [
          styles.icon,
          { backgroundColor: colors.surface2 },
          pressed ? { opacity: 0.7 } : null,
        ]}
      >
        <Ionicons name="person-outline" size={16} color={colors.foreground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 58,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  mark: {
    height: 32,
    width: 32,
    borderRadius: 10,
    backgroundColor: "#3B4CCA",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: { fontSize: 16, fontFamily: Fonts.bold, letterSpacing: -0.3 },
  spacer: { flex: 1 },
  icon: { height: 34, width: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
});
