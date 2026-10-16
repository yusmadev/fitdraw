// Taille (pré-remplit les mesures) et coupe (pantalon / short seulement).
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Fonts, Radii } from "../constants/theme";
import { COUPES, SIZES, hasCoupe, type Coupe, type Size } from "@template/web/fitdraw/garments";
import { useTheme } from "../lib/theme";

interface Props {
  size: Size | null;
  coupe: Coupe;
  garmentId: string;
  onSize: (size: Size | null) => void;
  onCoupe: (coupe: Coupe) => void;
}

function Chip({
  active,
  label,
  onPress,
  children,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  children: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: active ? colors.primary : colors.surface2 },
        pressed ? { opacity: 0.75 } : null,
      ]}
    >
      <Text style={[styles.chipText, { color: active ? "#FFFFFF" : colors.foreground }]}>{children}</Text>
    </Pressable>
  );
}

export default function FitSelectors({ size, coupe, garmentId, onSize, onCoupe }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Taille</Text>
        {size ? (
          <Pressable onPress={() => onSize(null)} hitSlop={8}>
            <Text style={[styles.clear, { color: colors.mutedForeground }]}>effacer</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.row}>
        {SIZES.map((s) => (
          <Chip key={s} active={size === s} label={`Taille ${s}`} onPress={() => onSize(s)}>
            {s}
          </Chip>
        ))}
      </View>

      {hasCoupe(garmentId) ? (
        <>
          <Text style={[styles.label, styles.coupeLabel, { color: colors.mutedForeground }]}>Coupe</Text>
          <View style={styles.row}>
            {COUPES.map((c) => (
              <Chip key={c.id} active={coupe === c.id} label={`Coupe ${c.label}`} onPress={() => onCoupe(c.id)}>
                {c.label}
              </Chip>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: 11, fontFamily: Fonts.bold, letterSpacing: 0.9, textTransform: "uppercase" },
  coupeLabel: { marginTop: 4 },
  clear: { fontSize: 11.5, fontFamily: Fonts.medium, textDecorationLine: "underline" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    height: 36,
    minWidth: 46,
    borderRadius: Radii.chip,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: { fontSize: 13, fontFamily: Fonts.bold },
});
