// Sélecteur de vêtement : recherche sans accents, filtre par catégorie,
// tri par usage décroissant puis alphabétique — mêmes règles que le web.
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Fonts, Radii } from "../constants/theme";
import { CATEGORIES, GARMENTS, type Category } from "@template/web/fitdraw/garments";
import { normalize } from "@template/web/fitdraw/rules";
import type { UsageEntry } from "../lib/store";
import { useTheme } from "../lib/theme";

interface Props {
  currentId: string;
  usage: UsageEntry[];
  onPick: (id: string) => void;
}

export default function GarmentPicker({ currentId, usage, onPick }: Props) {
  const { theme, colors } = useTheme();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category | "tous">("tous");

  const list = useMemo(() => {
    const q = normalize(query);
    const count = (id: string) => usage.find((u) => u.garmentId === id)?.count ?? 0;
    return GARMENTS.filter((g) => (cat === "tous" ? true : g.category === cat))
      .filter((g) => (q ? normalize(g.name).includes(q) : true))
      .sort((a, b) => count(b.id) - count(a.id) || a.name.localeCompare(b.name, "fr"));
  }, [query, cat, usage]);

  const activeSoft = theme === "dark" ? "#232847" : "#E8EAFB";
  const activeInk = theme === "dark" ? "#A8B2FF" : "#3B4CCA";

  return (
    <View style={styles.wrap}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Rechercher un vêtement"
        placeholderTextColor={colors.mutedForeground}
        accessibilityLabel="Rechercher un vêtement"
        style={[styles.search, { backgroundColor: colors.surface2, color: colors.foreground }]}
      />

      <View style={styles.cats}>
        {CATEGORIES.map((c) => {
          const active = cat === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setCat(c.id)}
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.cat,
                { backgroundColor: active ? activeSoft : colors.surface2 },
                pressed && !active ? { opacity: 0.7 } : null,
              ]}
            >
              <Text style={[styles.catText, { color: active ? activeInk : colors.mutedForeground }]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={list}
        keyExtractor={(g) => g.id}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>Aucun vêtement ne correspond.</Text>
        }
        renderItem={({ item }) => {
          const active = item.id === currentId;
          return (
            <Pressable
              onPress={() => onPick(item.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.item,
                active ? { backgroundColor: activeSoft } : null,
                pressed && !active ? { backgroundColor: colors.surface } : null,
              ]}
            >
              <Text style={[styles.itemName, { color: active ? activeInk : colors.foreground }]}>{item.name}</Text>
              <Text style={[styles.itemCount, { color: colors.mutedForeground }]}>
                {item.measures.length} mesures
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  search: {
    height: 44,
    borderRadius: Radii.input,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  cats: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  cat: { height: 30, borderRadius: 999, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  catText: { fontSize: 12, fontFamily: Fonts.bold },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  itemName: { fontSize: 14, fontFamily: Fonts.medium },
  itemCount: { fontSize: 11, fontFamily: Fonts.medium },
  empty: { paddingHorizontal: 13, paddingVertical: 12, fontSize: 13, fontFamily: Fonts.regular },
});
