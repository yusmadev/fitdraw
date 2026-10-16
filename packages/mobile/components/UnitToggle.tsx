// Bascule cm / po — reprise du sélecteur segmenté du web.
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Fonts } from "../constants/theme";
import type { Unit } from "@template/web/fitdraw/renderSketch";
import { useTheme } from "../lib/theme";

interface Props {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: Props) {
  const { theme, colors } = useTheme();
  const activeBg = theme === "dark" ? "#E8EAFB" : "#14161F";
  const activeFg = theme === "dark" ? "#14161F" : "#FFFFFF";

  return (
    <View style={[styles.group, { backgroundColor: colors.surface }]} accessibilityRole="radiogroup">
      {(["cm", "po"] as Unit[]).map((u) => {
        const active = unit === u;
        return (
          <Pressable
            key={u}
            onPress={() => onChange(u)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.item,
              active && { backgroundColor: activeBg },
              pressed && !active ? { opacity: 0.6 } : null,
            ]}
          >
            <Text style={[styles.label, { color: active ? activeFg : colors.foreground }]}>{u}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { flexDirection: "row", borderRadius: 999, padding: 3 },
  item: { height: 32, borderRadius: 999, paddingHorizontal: 13, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 13, fontFamily: Fonts.bold },
});
