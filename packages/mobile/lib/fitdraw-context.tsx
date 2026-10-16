// Contexte FitDraw partagé par les quatre onglets : l'atelier, les vêtements,
// la personnalisation et le compte lisent le même état, donc changer de vêtement
// depuis un onglet se voit immédiatement dans les autres.
//
// Local d'abord : `useFitDraw` écrit toujours sur l'appareil, `useSyncBridge`
// pousse ensuite vers le serveur quand une session existe.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useFitDraw, type FitDrawState } from "./useFitDraw";
import { useSyncBridge, type SyncState } from "./sync";

export interface FitDrawContextValue {
  fd: FitDrawState;
  syncState: SyncState;
  signedIn: boolean;
  /** Nombre de brouillons déjà remplis sur cet appareil. */
  localCount: number;
  toast: string | null;
  flash: (message: string) => void;
}

const FitDrawContext = createContext<FitDrawContextValue | null>(null);

export function FitDrawProvider({ children }: { children: ReactNode }) {
  const sync = useSyncBridge();
  const fd = useFitDraw({
    onDraftChange: sync.pushDraft,
    onBrandingChange: sync.pushBranding,
    onGarmentChange: sync.bump,
  });

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  // À la connexion : on tire l'état distant et on le fusionne, une fois par session.
  const mergeRef = useRef(fd.mergeRemote);
  mergeRef.current = fd.mergeRemote;
  const signedIn = sync.signedIn;
  const pull = sync.pull;

  useEffect(() => {
    if (!signedIn) return;
    void pull((remote) => mergeRef.current(remote));
  }, [signedIn, pull]);

  const localCount = useMemo(
    () => fd.allDrafts.filter((d) => Object.keys(d.values).length > 0).length,
    [fd.allDrafts],
  );

  const value = useMemo<FitDrawContextValue>(
    () => ({ fd, syncState: sync.state, signedIn, localCount, toast, flash }),
    [fd, sync.state, signedIn, localCount, toast, flash],
  );

  return <FitDrawContext.Provider value={value}>{children}</FitDrawContext.Provider>;
}

export function useFitDrawContext(): FitDrawContextValue {
  const ctx = useContext(FitDrawContext);
  if (!ctx) throw new Error("useFitDrawContext doit être utilisé à l'intérieur de FitDrawProvider");
  return ctx;
}
