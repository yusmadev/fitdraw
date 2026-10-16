// Feuille modale FitDraw : glisse depuis le bas, en-tête + corps défilant,
// même vocabulaire visuel que le `Sheet` web (rayon 28, bordure fine, fond carte).
import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Fonts, Radii } from "../constants/theme";
import { useTheme } from "../lib/theme";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Sheet({ open, title, onClose, children, footer }: Props) {
  const { colors } = useTheme();

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Fermer" />
        <SafeAreaView edges={["bottom"]} style={[styles.panel, { backgroundColor: colors.card }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              hitSlop={8}
              style={({ pressed }) => [
                styles.close,
                { backgroundColor: colors.surface2, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="close" size={17} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {footer ? <View style={[styles.footer, { borderTopColor: colors.border }]}>{footer}</View> : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(11,13,19,0.45)" },
  panel: {
    maxHeight: "86%",
    borderTopLeftRadius: Radii.sheet,
    borderTopRightRadius: Radii.sheet,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 15, fontFamily: Fonts.bold, letterSpacing: -0.2, flex: 1 },
  close: { height: 34, width: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  body: { flexGrow: 0 },
  bodyContent: { paddingHorizontal: 20, paddingVertical: 18 },
  footer: { paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth },
});
