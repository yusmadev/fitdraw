// Export du croquis FitDraw sur mobile.
//
// Natif  : le SVG d'export (composants/ExportSvg.tsx) est rasterisé en PNG 1600 × 1600 par
//          react-native-svg, écrit dans le cache de l'app, puis remis à la feuille de partage.
// Expo Web : on réutilise la chaîne Canvas 2D du web (packages/web/src/web/fitdraw/exportPng.ts),
//          sinon l'aperçu de l'app dans le tableau de bord ne pourrait rien exporter.
//
// `expo-file-system` et `expo-sharing` sont importés dynamiquement : leurs modules natifs
// n'existent pas sur le web, un import statique casserait le bundle de l'aperçu.
import { Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import type { Svg } from "react-native-svg";
import type { GarmentDef } from "@template/web/fitdraw/garments";
import type { MeasureValues } from "@template/web/fitdraw/shapes";
import type { Unit } from "@template/web/fitdraw/renderSketch";
import { copyText, stripAccents } from "@template/web/fitdraw/rules";
import type { ExportBranding } from "../components/ExportSvg";

export const EXPORT_SIZE = 1600;

export interface ExportArgs {
  garment: GarmentDef;
  values: MeasureValues;
  unit: Unit;
  coupe: number;
  size: string | null;
  coupeId: string;
  branding: ExportBranding;
  title: string;
}

export const slug = (s: string) =>
  stripAccents(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "fitdraw";

export const fileName = (title: string) => `fitdraw-${slug(title)}.png`;

/** Rasterise le <Svg> d'export en base64 PNG 1600 × 1600 (natif uniquement). */
export function captureSvgBase64(ref: React.RefObject<Svg | null>): Promise<string> {
  return new Promise((resolve, reject) => {
    const node = ref.current;
    if (!node || typeof node.toDataURL !== "function") {
      reject(new Error("Croquis indisponible — réessaie dans un instant."));
      return;
    }
    try {
      node.toDataURL((base64: string) => resolve(base64), {
        width: EXPORT_SIZE,
        height: EXPORT_SIZE,
      });
    } catch (err) {
      reject(err as Error);
    }
  });
}

async function writePngFile(base64: string, name: string): Promise<string> {
  const { File, Paths } = await import("expo-file-system");
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  file.create({ overwrite: true, intermediates: true });
  file.write(base64, { encoding: "base64" });
  return file.uri;
}

async function shareFile(uri: string): Promise<void> {
  const Sharing = await import("expo-sharing");
  if (!(await Sharing.isAvailableAsync())) throw new Error("Le partage n'est pas disponible ici.");
  await Sharing.shareAsync(uri, {
    mimeType: "image/png",
    UTI: "public.png",
    dialogTitle: "Partager le croquis",
  });
}

/** Expo Web : même chaîne canvas que l'app web, puis partage natif du navigateur ou téléchargement. */
async function exportOnWeb(args: ExportArgs, mode: "share" | "download"): Promise<ExportOutcome> {
  const { exportPngBlob } = await import("@template/web/fitdraw/exportPng");
  const blob = await exportPngBlob(
    args.garment,
    args.values,
    args.unit,
    args.branding,
    args.title,
    args.coupe,
  );
  const name = fileName(args.title);
  const file = new File([blob], name, { type: "image/png" });

  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (mode === "share" && nav.share && nav.canShare?.({ files: [file] })) {
    await nav.share({ files: [file], title: args.title });
    return { kind: "shared" };
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return { kind: "downloaded" };
}

export interface ExportOutcome {
  kind: "shared" | "downloaded" | "saved";
  uri?: string;
}

/**
 * Exporte le croquis.
 * `share` → feuille de partage native (ou partage navigateur sur web).
 * `download` → PNG écrit dans le cache et renvoyé (`saved`), téléchargement direct sur web.
 */
export async function exportSketch(
  args: ExportArgs,
  ref: React.RefObject<Svg | null>,
  mode: "share" | "download",
): Promise<ExportOutcome> {
  if (Platform.OS === "web") return exportOnWeb(args, mode);

  const base64 = await captureSvgBase64(ref);
  const uri = await writePngFile(base64, fileName(args.title));
  if (mode === "download") return { kind: "saved", uri };
  await shareFile(uri);
  return { kind: "shared", uri };
}

/** Copie le récapitulatif texte des mesures dans le presse-papier. */
export async function copyMeasures(args: ExportArgs): Promise<void> {
  const text = copyText(
    args.garment,
    args.values,
    args.unit,
    args.size,
    args.coupeId === "droit" ? null : args.coupeId,
  );
  await Clipboard.setStringAsync(text);
}
