// Message furtif en bas d'écran — mêmes teintes que le Toast web (encre sur clair, accent sur sombre).
import { StyleSheet, Text, View } from "react-native";
import { Fonts } from "../constants/theme";
import { useTheme } from "../lib/theme";

export default function Toast({ message }: { message: string | null }) {
  const { theme, colors } = useTheme();
  if (!message) return null;

  const background = theme === "dark" ? colors.accent : "#14161F";
  const color = theme === "dark" ? "#14161F" : "#FFFFFF";

  return (
    <View style={styles.wrap}>
      <View style={[styles.pill, { backgroundColor: background }]}>
        <Text style={[styles.text, { color }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 24, alignItems: "center", pointerEvents: "none" },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    boxShadow: "0 6px 18px rgba(11, 13, 19, 0.24)",
    elevation: 6,
  },
  text: { fontSize: 13, fontFamily: Fonts.medium },
});
