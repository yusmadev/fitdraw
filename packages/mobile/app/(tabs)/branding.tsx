// Onglet Personnaliser — nom de boutique, logo et filigrane de l'export,
// avec un aperçu du pied de page tel qu'il apparaîtra sur le PNG.
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fonts, Radii } from "../../constants/theme";
import BrandingPanel from "../../components/BrandingPanel";
import { useFitDrawContext } from "../../lib/fitdraw-context";
import { useTheme } from "../../lib/theme";

export default function BrandingScreen() {
  const { colors } = useTheme();
  const { fd } = useFitDrawContext();
  const shopName = fd.branding.shopName.trim().slice(0, 32);
  const hasLogo = Boolean(fd.branding.logoDataUrl);

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
            <Text style={[styles.title, { color: colors.foreground }]}>Personnaliser</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Ces réglages sont communs à tous tes croquis et se synchronisent avec ton compte.
            </Text>
          </View>

          <BrandingPanel branding={fd.branding} onChange={fd.setBranding} />

          <View style={styles.previewBlock}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Aperçu du bas d'export</Text>
            <View style={[styles.preview, { backgroundColor: "#F3F4F8" }]}>
              <Text style={styles.previewFoot}>Mesures prises à plat, ± 1 cm</Text>
              <View style={styles.previewBrand}>
                {hasLogo ? (
                  <Image
                    source={{ uri: fd.branding.logoDataUrl }}
                    style={styles.previewLogo}
                    resizeMode="contain"
                    accessibilityLabel="Logo de la boutique"
                  />
                ) : null}
                <Text
                  style={[
                    styles.previewName,
                    { color: shopName ? "#14161F" : "#3B4CCA", textAlign: hasLogo ? "left" : "right" },
                  ]}
                >
                  {shopName || "FitDraw"}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.note, { backgroundColor: colors.surface2 }]}>
            <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
              Le filigrane « FitDraw » est un motif incliné dessiné à l'intérieur du croquis exporté. Le
              désactiver ne change rien à l'affichage à l'écran.
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
  previewBlock: { gap: 8 },
  label: { fontSize: 11, fontFamily: Fonts.bold, letterSpacing: 0.9, textTransform: "uppercase" },
  preview: { borderRadius: Radii.row, paddingHorizontal: 20, paddingVertical: 18, gap: 14 },
  previewFoot: { fontSize: 11, fontFamily: Fonts.medium, color: "#6B7080" },
  previewBrand: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  previewLogo: { height: 18, width: 18 },
  previewName: { flex: 1, fontSize: 14, fontFamily: Fonts.bold, letterSpacing: 0.4 },
  note: { borderRadius: Radii.row, paddingHorizontal: 14, paddingVertical: 13 },
  noteText: { fontSize: 12, fontFamily: Fonts.regular, lineHeight: 18 },
});
