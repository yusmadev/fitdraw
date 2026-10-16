// Thème FitDraw (mobile) : clair / sombre, mémorisé sous la clé `fitdraw-theme`
// comme sur le web. Au premier lancement on suit le réglage système.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { Colors, type ThemeColors } from "../constants/theme";
import { KEYS, readString, write } from "./store";

export type Theme = "light" | "dark";

interface ThemeValue {
  theme: Theme;
  colors: ThemeColors;
  ready: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [theme, setThemeState] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const stored = await readString(KEYS.theme, "");
      if (!alive) return;
      setThemeState(stored === "light" || stored === "dark" ? stored : system === "dark" ? "dark" : "light");
      setReady(true);
    })();
    return () => {
      alive = false;
    };
    // Le réglage système n'est lu qu'une fois : ensuite c'est le choix de l'utilisateur qui prime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    void write(KEYS.theme, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      void write(KEYS.theme, next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeValue>(
    () => ({ theme, colors: Colors[theme], ready, setTheme, toggleTheme }),
    [theme, ready, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme doit être utilisé à l'intérieur de ThemeProvider");
  return ctx;
}

/** Raccourci quand seule la palette compte. */
export const useColors = () => useTheme().colors;
