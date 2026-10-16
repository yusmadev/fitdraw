// Copier · Partager · Exporter — mêmes trois actions que l'app d'origine,
// branchées sur la feuille de partage native (ou le téléchargement sur Expo Web).
import { useCallback, useState, type RefObject } from "react";
import type { Svg } from "react-native-svg";
import { copyMeasures, exportSketch, type ExportArgs } from "./exportSketch";
import { useFitDrawContext } from "./fitdraw-context";

export function useExportActions(args: ExportArgs, svgRef: RefObject<Svg | null>) {
  const { flash } = useFitDrawContext();
  const [busy, setBusy] = useState(false);

  const copy = useCallback(async () => {
    try {
      await copyMeasures(args);
      flash("Mesures copiées");
    } catch {
      flash("Copie impossible");
    }
  }, [args, flash]);

  const share = useCallback(async () => {
    setBusy(true);
    try {
      const out = await exportSketch(args, svgRef, "share");
      if (out.kind === "downloaded") flash("PNG 1600 × 1600 téléchargé");
    } catch (err) {
      const message = (err as Error)?.message;
      flash(message && message.length < 60 ? message : "Partage impossible");
    } finally {
      setBusy(false);
    }
  }, [args, svgRef, flash]);

  const exportPng = useCallback(async () => {
    setBusy(true);
    try {
      const out = await exportSketch(args, svgRef, "download");
      flash(out.kind === "saved" ? "PNG 1600 × 1600 enregistré" : "PNG 1600 × 1600 téléchargé");
    } catch (err) {
      const message = (err as Error)?.message;
      flash(message && message.length < 60 ? message : "Export impossible");
    } finally {
      setBusy(false);
    }
  }, [args, svgRef, flash]);

  return { copy, share, exportPng, busy };
}
