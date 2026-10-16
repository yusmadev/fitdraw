// Une ligne de mesure : libellé + aide, champ numérique, alerte douce éventuelle.
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Fonts, Radii } from "../constants/theme";
import type { MeasureDef } from "@template/web/fitdraw/garments";
import { formatValue, unitLabel, type Unit } from "@template/web/fitdraw/renderSketch";
import type { SoftWarning } from "@template/web/fitdraw/rules";
import { useTheme } from "../lib/theme";

interface Props {
  measure: MeasureDef;
  value: number | undefined;
  unit: Unit;
  warning?: SoftWarning;
  onValue: (value: number | undefined) => void;
  onFocusKey: (key: string | null) => void;
}

export default function MeasureRow({ measure, value, unit, warning, onValue, onFocusKey }: Props) {
  const { theme, colors } = useTheme();
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);

  // Le champ affiche la valeur dans l'unité courante ; on ne réécrit pas pendant la frappe.
  useEffect(() => {
    if (!focused) setText(value && value > 0 ? formatValue(value, unit) : "");
  }, [value, unit, focused]);

  const commit = (raw: string) => {
    const cleaned = raw.replace(",", ".").trim();
    if (cleaned === "") return onValue(undefined);
    const n = Number(cleaned);
    if (!Number.isFinite(n) || n <= 0) return onValue(undefined);
    onValue(unit === "cm" ? n : n * 2.54);
  };

  const warnBorder = theme === "dark" ? "#5A3436" : "#E8C9C7";
  const warnText = theme === "dark" ? "#F2777A" : "#B4483F";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: warning ? warnBorder : colors.border,
        },
      ]}
    >
      <View style={styles.line}>
        <View style={styles.left}>
          <Text numberOfLines={1} style={[styles.label, { color: colors.foreground }]}>
            {measure.label}
          </Text>
          <Text style={[styles.help, { color: colors.mutedForeground }]}>{measure.help}</Text>
        </View>

        <View style={styles.right}>
          <TextInput
            value={text}
            onChangeText={(next) => {
              setText(next);
              commit(next);
            }}
            onFocus={() => {
              setFocused(true);
              onFocusKey(measure.key);
            }}
            onBlur={() => {
              setFocused(false);
              onFocusKey(null);
            }}
            placeholder="—"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
            inputMode="decimal"
            accessibilityLabel={`${measure.label} en ${unitLabel(unit)}`}
            style={[
              styles.input,
              {
                backgroundColor: colors.surface2,
                color: colors.foreground,
                borderColor: focused ? colors.primary : "transparent",
              },
            ]}
          />
          <Text style={[styles.unit, { color: colors.mutedForeground }]}>{unitLabel(unit)}</Text>
        </View>
      </View>

      {warning ? <Text style={[styles.warning, { color: warnText }]}>! {warning.text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.row,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  line: { flexDirection: "row", alignItems: "center", gap: 10 },
  left: { flex: 1, minWidth: 0 },
  label: { fontSize: 14, fontFamily: Fonts.medium },
  help: { marginTop: 2, fontSize: 11.5, fontFamily: Fonts.regular, lineHeight: 16 },
  right: { flexDirection: "row", alignItems: "center", gap: 6 },
  input: {
    height: 42,
    width: 76,
    borderRadius: 12,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    textAlign: "right",
    fontSize: 15,
    fontFamily: Fonts.bold,
  },
  unit: { width: 20, fontSize: 12, fontFamily: Fonts.medium },
  warning: { marginTop: 8, fontSize: 11.5, fontFamily: Fonts.medium, lineHeight: 16 },
});
