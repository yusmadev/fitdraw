// État central de l'atelier FitDraw sur mobile. Local d'abord : tout part sur l'appareil,
// la synchro cloud se branche via `onDraftChange` / `onBrandingChange`.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GARMENTS,
  coupeFactor,
  getGarment,
  sizeValue,
  type Coupe,
  type GarmentDef,
  type Size,
} from "@template/web/fitdraw/garments";
import type { MeasureValues } from "@template/web/fitdraw/shapes";
import type { Unit } from "@template/web/fitdraw/renderSketch";
import { exportTitle } from "@template/web/fitdraw/rules";
import {
  DEFAULT_BRANDING,
  bumpUsage,
  emptyDraft,
  loadBranding,
  loadDraft,
  loadUsage,
  readString,
  saveBranding,
  saveDraft,
  write,
  KEYS,
  type Branding,
  type Draft,
  type UsageEntry,
} from "./store";

export interface FitDrawSync {
  onDraftChange?: (draft: Draft) => void;
  onBrandingChange?: (branding: Branding) => void;
  onGarmentChange?: (garmentId: string) => void;
}

export function useFitDraw(sync: FitDrawSync = {}) {
  const [ready, setReady] = useState(false);
  const [garmentId, setGarmentIdState] = useState<string>(GARMENTS[0].id);
  const [unit, setUnitState] = useState<Unit>("cm");
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(GARMENTS[0].id));
  const [branding, setBrandingState] = useState<Branding>(DEFAULT_BRANDING);
  const [usage, setUsage] = useState<UsageEntry[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [allDrafts, setAllDrafts] = useState<Draft[]>([]);

  const syncRef = useRef(sync);
  syncRef.current = sync;

  /** Relit tous les brouillons — sert au compteur du compte et à l'onglet « Mes vêtements ». */
  const refreshDrafts = useCallback(async () => {
    setAllDrafts(await Promise.all(GARMENTS.map((g) => loadDraft(g.id))));
  }, []);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const stored = await readString(KEYS.garment, GARMENTS[0].id);
      const safeId = GARMENTS.some((g) => g.id === stored) ? stored : GARMENTS[0].id;
      const [d, b, u, uUnit] = await Promise.all([
        loadDraft(safeId),
        loadBranding(),
        loadUsage(),
        readString(KEYS.unit, "cm"),
      ]);
      if (!alive) return;
      setGarmentIdState(safeId);
      setDraft(d);
      setBrandingState(b);
      setUsage(u);
      setUnitState(uUnit === "po" ? "po" : "cm");
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Le compteur de brouillons suit le brouillon courant (une mesure saisie = un brouillon rempli).
  useEffect(() => {
    if (!ready) return;
    void refreshDrafts();
  }, [ready, draft, refreshDrafts]);

  const setUnit = useCallback((u: Unit) => {
    setUnitState(u);
    void write(KEYS.unit, u);
  }, []);

  const garment: GarmentDef = useMemo(() => getGarment(garmentId), [garmentId]);

  const setGarmentId = useCallback((id: string) => {
    setGarmentIdState(id);
    void write(KEYS.garment, id);
    void (async () => {
      const next = await loadDraft(id);
      setDraft(next);
      setUsage(await bumpUsage(id));
      // Changer de vêtement ne modifie aucun croquis : rien à pousser.
      syncRef.current.onGarmentChange?.(id);
    })();
  }, []);

  const commit = useCallback((updater: (d: Draft) => Draft) => {
    setDraft((prev) => {
      const next = { ...updater(prev), updatedAt: Date.now() };
      void saveDraft(next);
      syncRef.current.onDraftChange?.(next);
      return next;
    });
  }, []);

  const setValue = useCallback(
    (key: string, value: number | undefined) => commit((d) => ({ ...d, values: { ...d.values, [key]: value } })),
    [commit],
  );

  const setSize = useCallback(
    (size: Size | null) => {
      commit((d) => {
        if (size === null) return { ...d, size: null };
        const values: MeasureValues = {};
        garment.measures.forEach((m) => {
          values[m.key] = sizeValue(m.def, m.key, size);
        });
        return { ...d, size, values };
      });
    },
    [commit, garment],
  );

  const setCoupe = useCallback((coupe: Coupe) => commit((d) => ({ ...d, coupe })), [commit]);
  const clearValues = useCallback(() => commit((d) => ({ ...d, values: {}, size: null })), [commit]);

  const setBranding = useCallback((b: Branding) => {
    setBrandingState(b);
    void saveBranding(b);
    syncRef.current.onBrandingChange?.(b);
  }, []);

  /** Applique un lot venu du serveur (connexion, autre appareil). */
  const mergeRemote = useCallback(
    async (remote: { drafts?: Draft[]; branding?: Branding; usage?: UsageEntry[] }) => {
      if (remote.branding) {
        setBrandingState(remote.branding);
        await saveBranding(remote.branding);
      }
      if (remote.usage) {
        setUsage(remote.usage);
        await write(KEYS.usage, remote.usage);
      }
      if (remote.drafts?.length) {
        for (const d of remote.drafts) {
          const mine = await loadDraft(d.garmentId);
          // On écrit la version distante telle quelle, horodatage compris : la re-tamponner
          // à l'heure locale ferait croire au serveur que cette copie est plus récente.
          if (d.updatedAt > mine.updatedAt) await write(KEYS.draft(d.garmentId), d);
        }
        const mine = await loadDraft(garmentId);
        const remoteCurrent = remote.drafts.find((d) => d.garmentId === garmentId);
        setDraft(remoteCurrent && remoteCurrent.updatedAt > mine.updatedAt ? remoteCurrent : mine);
      }
    },
    [garmentId],
  );

  const filled = garment.measures.filter((m) => (draft.values[m.key] ?? 0) > 0).length;

  return {
    ready,
    garment,
    garmentId,
    setGarmentId,
    unit,
    setUnit,
    draft,
    values: draft.values,
    size: draft.size,
    coupeId: draft.coupe,
    coupe: coupeFactor(draft.coupe),
    setValue,
    setSize,
    setCoupe,
    clearValues,
    branding,
    setBranding,
    usage,
    activeKey,
    setActiveKey,
    title: exportTitle(garment, draft.size, draft.coupe === "droit" ? null : draft.coupe),
    filled,
    allDrafts,
    refreshDrafts,
    mergeRemote,
  };
}

export type FitDrawState = ReturnType<typeof useFitDraw>;
