// Onglet Compte — connexion et état de la synchronisation entre appareils.
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Fonts, Radii } from "../../constants/theme";
import AccountPanel from "../../components/AccountPanel";
import { useFitDrawContext } from "../../lib/fitdraw-context";
import { useTheme } from "../../lib/theme";

const POINTS = [
  {
    icon: "phone-portrait-outline" as const,
    title: "L'appareil d'abord",
    body: "Chaque mesure est écrite sur le téléphone avant tout : l'atelier reste utilisable sans réseau.",
  },
  {
    icon: "cloud-upload-outline" as const,
    title: "Puis le serveur",
    body: "Une fois connecté, les modifications partent en arrière-plan, sans bouton à presser.",
  },
  {
    icon: "git-merge-outline" as const,
    title: "Fusion par date",
    body: "Si deux appareils ont touché le même vêtement, la version la plus récente gagne.",
  },
];

export default function AccountScreen() {
  const { colors } = useTheme();
  const { fd, localCount, syncState, signedIn } = useFitDrawContext();

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.head}>
            <Text style={[styles.title, { color: colors.foreground }]}>Compte</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {signedIn
                ? "Tes croquis suivent ton compte sur tous tes appareils."
                : "Facultatif : FitDraw marche très bien sans compte, tout reste sur cet appareil."}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <AccountPanel localCount={localCount} syncState={syncState} />
          </View>

          <View style={styles.points}>
            {POINTS.map((p) => (
              <View key={p.title} style={styles.point}>
                <View style={[styles.pointIcon, { backgroundColor: colors.surface2 }]}>
                  <Ionicons name={p.icon} size={16} color={colors.primary} />
                </View>
                <View style={styles.pointText}>
                  <Text style={[styles.pointTitle, { color: colors.foreground }]}>{p.title}</Text>
                  <Text style={[styles.pointBody, { color: colors.mutedForeground }]}>{p.body}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.note, { backgroundColor: colors.surface2 }]}>
            <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
              Vêtement en cours : {fd.garment.name} · {fd.filled}/{fd.garment.measures.length} mesures.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 32, gap: 22 },
  head: { gap: 6 },
  title: { fontSize: 24, fontFamily: Fonts.bold, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: Fonts.regular, lineHeight: 19 },
  card: { borderRadius: Radii.sheet, borderWidth: 1, padding: 18 },
  points: { gap: 16 },
  point: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  pointIcon: { height: 34, width: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  pointText: { flex: 1, gap: 3 },
  pointTitle: { fontSize: 14, fontFamily: Fonts.bold },
  pointBody: { fontSize: 12.5, fontFamily: Fonts.regular, lineHeight: 18 },
  note: { borderRadius: Radii.row, paddingHorizontal: 14, paddingVertical: 13 },
  noteText: { fontSize: 12, fontFamily: Fonts.regular, lineHeight: 18 },
});
