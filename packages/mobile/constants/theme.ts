/**
 * Palette FitDraw — mêmes valeurs que les tokens `--t-*` du web
 * (`packages/web/src/web/styles.css`), en hex car StyleSheet n'accepte pas `oklch()`.
 *
 * Les noms de tokens restent ceux du template (`background`, `foreground`, `card`,
 * `primary`, `muted`, `border`…) pour que `useColors()` marche partout ; les alias
 * `surface`, `surface2`, `canvas`, `sub`, `borderStrong` reprennent le vocabulaire FitDraw.
 */
export const Colors = {
  light: {
    background: "#FFFFFF",
    foreground: "#14161F",
    card: "#FFFFFF",
    cardForeground: "#14161F",
    primary: "#3B4CCA",
    primaryForeground: "#FFFFFF",
    primarySoft: "#E8EAFB",
    secondary: "#F4F5F8",
    secondaryForeground: "#14161F",
    muted: "#F4F5F8",
    mutedForeground: "#6B7080",
    accent: "#E8EAFB",
    accentForeground: "#3B4CCA",
    surface: "#F4F5F8",
    surface2: "#F1F2F7",
    canvas: "#EEF0F6",
    sub: "#6B7080",
    border: "#E3E5EC",
    borderStrong: "#D5D8E2",
    destructive: "#D9534F",
    success: "#2E9E6B",
    warning: "#D9A23F",
  },
  dark: {
    background: "#0F1118",
    foreground: "#ECEFF5",
    card: "#151821",
    cardForeground: "#ECEFF5",
    primary: "#6B78E8",
    primaryForeground: "#0F1118",
    primarySoft: "#232847",
    secondary: "#1C1F2A",
    secondaryForeground: "#ECEFF5",
    muted: "#1C1F2A",
    mutedForeground: "#9499AA",
    accent: "#232847",
    accentForeground: "#A8B2FF",
    surface: "#1C1F2A",
    surface2: "#212430",
    canvas: "#0B0D13",
    sub: "#9499AA",
    border: "#2E3241",
    borderStrong: "#3C4152",
    destructive: "#F2777A",
    success: "#45C08A",
    warning: "#E0A93B",
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = (typeof Colors)[ColorScheme];

/**
 * Plus Jakarta Sans, chargée via `useFonts` de `expo-font` (voir `app/_layout.tsx`).
 * Les clés sont les noms enregistrés par @expo-google-fonts — utilisables telles quelles
 * dans `fontFamily`, sur natif comme sur Expo Web.
 */
export const Fonts = {
  regular: "PlusJakartaSans_500Medium",
  medium: "PlusJakartaSans_600SemiBold",
  semibold: "PlusJakartaSans_700Bold",
  bold: "PlusJakartaSans_800ExtraBold",
} as const;

/** Rayons et hauteurs d'action partagés (identiques au web). */
export const Radii = {
  row: 16,
  chip: 18,
  sheet: 28,
  panel: 32,
  input: 14,
} as const;

export const ActionHeight = 52;

/**
 * Hauteur de la barre d'onglets, hors encoche du bas.
 * Partagée avec les écrans : la barre flotte au-dessus du contenu, donc chaque liste
 * défilante doit réserver cette hauteur pour que son dernier élément reste atteignable.
 */
export const TAB_BAR_HEIGHT = 66;
