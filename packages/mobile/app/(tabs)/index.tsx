// Onglet Croquis — l'atelier : vêtement, croquis annoté, actions, taille/coupe, mesures.
import { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Svg } from "react-native-svg";
import { Fonts, Radii, TAB_BAR_HEIGHT } from "../../constants/theme";
import Sketch from "../../components/Sketch";
import ExportSvg from "../../components/ExportSvg";
import AppHeader from "../../components/AppHeader";
import ActionBar from "../../components/ActionBar";
import FitSelectors from "../../components/FitSelectors";
import GarmentPicker from "../../components/GarmentPicker";
import MeasureRow from "../../components/MeasureRow";
import Sheet from "../../components/Sheet";
import Toast from "../../components/Toast";
import { softWarnings } from "@template/web/fitdraw/rules";
import { useFitDrawContext } from "../../lib/fitdraw-context";
import { useExportActions } from "../../lib/useExportActions";
import type { ExportArgs } from "../../lib/exportSketch";
import { useTheme } from "../../lib/theme";

type OpenSheet = "garment" | "branding" | null;

function Stage({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.stage, { backgroundColor: colors.canvas, borderColor: colors.border }]}>{children}</View>
  );
}

export default function StudioScreen() {
  const { colors } = useTheme();
  const { fd, toast } = useFitDrawContext();
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const svgRef = useRef<Svg | null>(null);
  // La liste défile sous la barre d'onglets : sans cette marge, la dernière mesure
  // reste cachée derrière elle.
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_HEIGHT + insets.bottom;

  const args = useMemo<ExportArgs>(
    () => ({
      garment: fd.garment,
      values: fd.values,
      unit: fd.unit,
      coupe: fd.coupe,
      size: fd.size,
      coupeId: fd.coupeId,
      branding: fd.branding,
      title: fd.title,
    }),
    [fd.garment, fd.values, fd.unit, fd.coupe, fd.size, fd.coupeId, fd.branding, fd.title],
  );

  const actions = useExportActions(args, svgRef);
  const warnings = useMemo(() => new Map(softWarnings(fd.garment, fd.values).map((w) => [w.key, w])), [
    fd.garment,
    fd.values,
  ]);

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.screen, { backgroundColor: colors.background }]}>
      <AppHeader unit={fd.unit} onUnit={fd.setUnit} onAccount={() => router.navigate("/account")} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 24 + tabBarHeight }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => setSheet("garment")}
            accessibilityRole="button"
            accessibilityLabel={`Changer de vêtement — actuellement ${fd.garment.name}`}
            style={({ pressed }) => [
              styles.garmentBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed ? { opacity: 0.85 } : null,
            ]}
          >
            <View style={styles.garmentText}>
              <Text style={[styles.garmentKicker, { color: colors.mutedForeground }]}>Vêtement</Text>
              <Text numberOfLines={1} style={[styles.garmentName, { color: colors.foreground }]}>
                {fd.garment.name}
              </Text>
            </View>
            <View style={styles.garmentRight}>
              <Text style={[styles.garmentCount, { color: colors.mutedForeground }]}>
                {fd.filled}/{fd.garment.measures.length}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
            </View>
          </Pressable>

          <Stage>
            <Sketch
              garment={fd.garment}
              values={fd.values}
              unit={fd.unit}
              activeKey={fd.activeKey}
              coupe={fd.coupe}
            />
          </Stage>

          <ActionBar onCopy={actions.copy} onShare={actions.share} onExport={actions.exportPng} busy={actions.busy} />

          <FitSelectors
            size={fd.size}
            coupe={fd.coupeId}
            garmentId={fd.garmentId}
            onSize={fd.setSize}
            onCoupe={fd.setCoupe}
          />

          <View style={styles.measures}>
            {fd.garment.measures.map((m) => (
              <MeasureRow
                key={m.key}
                measure={m}
                value={fd.values[m.key]}
                unit={fd.unit}
                warning={warnings.get(m.key)}
                onValue={(v) => fd.setValue(m.key, v)}
                onFocusKey={fd.setActiveKey}
              />
            ))}
          </View>

          <View style={styles.secondary}>
            <Pressable
              onPress={() => setSheet("branding")}
              style={({ pressed }) => [
                styles.secondaryBtn,
                { backgroundColor: colors.surface },
                pressed ? { opacity: 0.75 } : null,
              ]}
            >
              <Text style={[styles.secondaryText, { color: colors.foreground }]}>Personnaliser l'export</Text>
            </Pressable>
            <Pressable
              onPress={fd.clearValues}
              style={({ pressed }) => [styles.secondaryBtn, pressed ? { opacity: 0.75 } : null]}
            >
              <Text style={[styles.secondaryText, { color: colors.mutedForeground }]}>Effacer les mesures</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Composition d'export hors écran : rasterisée en PNG 1600 × 1600 au moment de l'export. */}
      {Platform.OS === "web" ? null : (
        <View style={styles.offscreen}>
          <ExportSvg
            ref={svgRef}
            garment={fd.garment}
            values={fd.values}
            unit={fd.unit}
            coupe={fd.coupe}
            branding={fd.branding}
            title={fd.title}
          />
        </View>
      )}

      <Sheet open={sheet === "garment"} title="Choisir un vêtement" onClose={() => setSheet(null)}>
        <GarmentPicker
          currentId={fd.garmentId}
          usage={fd.usage}
          onPick={(id) => {
            fd.setGarmentId(id);
            setSheet(null);
          }}
        />
      </Sheet>

      <Sheet open={sheet === "branding"} title="Personnaliser l'export" onClose={() => setSheet(null)}>
        <Text style={[styles.sheetHint, { color: colors.mutedForeground }]}>
          Ces réglages se retrouvent dans l'onglet Personnaliser.
        </Text>
        <Pressable
          onPress={() => {
            setSheet(null);
            router.navigate("/branding");
          }}
          style={({ pressed }) => [
            styles.sheetLink,
            { backgroundColor: colors.surface },
            pressed ? { opacity: 0.75 } : null,
          ]}
        >
          <Text style={[styles.secondaryText, { color: colors.foreground }]}>Ouvrir la personnalisation</Text>
        </Pressable>
      </Sheet>

      <Toast message={toast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 32, gap: 14 },
  garmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: Radii.row,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  garmentText: { flex: 1, minWidth: 0 },
  garmentKicker: { fontSize: 10.5, fontFamily: Fonts.bold, letterSpacing: 0.9, textTransform: "uppercase" },
  garmentName: { fontSize: 15, fontFamily: Fonts.bold },
  garmentRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  garmentCount: { fontSize: 11.5, fontFamily: Fonts.medium },
  stage: {
    aspectRatio: 1,
    borderRadius: Radii.sheet,
    borderWidth: 1,
    overflow: "hidden",
    padding: 16,
  },
  measures: { gap: 8 },
  secondary: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  secondaryBtn: {
    height: 42,
    borderRadius: 999,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { fontSize: 13, fontFamily: Fonts.bold },
  offscreen: { position: "absolute", left: -9999, top: 0, width: 320, height: 320, opacity: 0.01, pointerEvents: "none" },
  sheetHint: { fontSize: 12.5, fontFamily: Fonts.regular, lineHeight: 18 },
  sheetLink: {
    marginTop: 12,
    height: 46,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
