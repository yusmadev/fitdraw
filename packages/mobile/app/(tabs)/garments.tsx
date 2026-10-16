// Onglet Mes vêtements — le catalogue et les brouillons déjà saisis sur cet appareil.
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Fonts, Radii } from "../../constants/theme";
import { CATEGORIES, GARMENTS, type Category } from "@template/web/fitdraw/garments";
import { normalize } from "@template/web/fitdraw/rules";
import { useFitDrawContext } from "../../lib/fitdraw-context";
import { useTheme } from "../../lib/theme";

export default function GarmentsScreen() {
  const { theme, colors } = useTheme();
  const { fd, localCount } = useFitDrawContext();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category | "tous">("tous");

  const drafts = useMemo(
    () => new Map(fd.allDrafts.map((d) => [d.garmentId, d])),
    [fd.allDrafts],
  );

  const list = useMemo(() => {
    const q = normalize(query);
    const count = (id: string) => fd.usage.find((u) => u.garmentId === id)?.count ?? 0;
    return GARMENTS.filter((g) => (cat === "tous" ? true : g.category === cat))
      .filter((g) => (q ? normalize(g.name).includes(q) : true))
      .sort((a, b) => count(b.id) - count(a.id) || a.name.localeCompare(b.name, "fr"));
  }, [query, cat, fd.usage]);

  const activeSoft = theme === "dark" ? "#232847" : "#E8EAFB";
  const activeInk = theme === "dark" ? "#A8B2FF" : "#3B4CCA";

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={list}
        keyExtractor={(g) => g.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.head}>
            <Text style={[styles.title, { color: colors.foreground }]}>Mes vêtements</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {localCount} brouillon{localCount > 1 ? "s" : ""} rempli{localCount > 1 ? "s" : ""} sur cet appareil.
              Les vêtements déjà utilisés remontent en premier.
            </Text>

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
                    <Text style={[styles.catText, { color: active ? activeInk : colors.mutedForeground }]}>
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>Aucun vêtement ne correspond.</Text>
        }
        renderItem={({ item }) => {
          const draft = drafts.get(item.id);
          const filled = draft ? item.measures.filter((m) => (draft.values[m.key] ?? 0) > 0).length : 0;
          const ratio = filled / item.measures.length;
          const active = item.id === fd.garmentId;
          const used = fd.usage.find((u) => u.garmentId === item.id)?.count ?? 0;

          return (
            <Pressable
              onPress={() => {
                fd.setGarmentId(item.id);
                router.navigate("/");
              }}
              accessibilityRole="button"
              accessibilityLabel={`${item.name} — ${filled} mesure${filled > 1 ? "s" : ""} sur ${item.measures.length}`}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.card, borderColor: active ? colors.primary : colors.border },
                pressed ? { opacity: 0.85 } : null,
              ]}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardText}>
                  <Text numberOfLines={1} style={[styles.cardName, { color: colors.foreground }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>
                    {filled}/{item.measures.length} mesures
                    {used > 0 ? ` · utilisé ${used} fois` : ""}
                  </Text>
                </View>
                {active ? (
                  <View style={[styles.badge, { backgroundColor: activeSoft }]}>
                    <Text style={[styles.badgeText, { color: activeInk }]}>en cours</Text>
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                )}
              </View>

              <View style={[styles.track, { backgroundColor: colors.surface2 }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${Math.round(ratio * 100)}%`,
                      backgroundColor: filled === item.measures.length ? colors.success : colors.primary,
                    },
                  ]}
                />
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 32, gap: 8 },
  head: { gap: 12, marginBottom: 8 },
  title: { fontSize: 24, fontFamily: Fonts.bold, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: Fonts.regular, lineHeight: 19 },
  search: { height: 44, borderRadius: Radii.input, paddingHorizontal: 14, fontSize: 14, fontFamily: Fonts.regular },
  cats: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  cat: { height: 30, borderRadius: 999, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  catText: { fontSize: 12, fontFamily: Fonts.bold },
  empty: { paddingVertical: 24, fontSize: 13, fontFamily: Fonts.regular, textAlign: "center" },
  card: { borderRadius: Radii.row, borderWidth: 1, padding: 14, gap: 10 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  cardText: { flex: 1, minWidth: 0, gap: 2 },
  cardName: { fontSize: 15, fontFamily: Fonts.bold },
  cardMeta: { fontSize: 11.5, fontFamily: Fonts.medium },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 10.5, fontFamily: Fonts.bold, textTransform: "uppercase", letterSpacing: 0.6 },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
});
