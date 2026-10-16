// Persistance locale FitDraw sur mobile — mêmes clés que la version web,
// stockage asynchrone (AsyncStorage sur natif, localStorage sur Expo Web).
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Coupe, Size } from "@template/web/fitdraw/garments";
import type { MeasureValues } from "@template/web/fitdraw/shapes";

export const KEYS = {
  branding: "fitdraw-branding",
  draft: (id: string) => `fitdraw-draft:${id}`,
  garment: "fitdraw-garment",
  unit: "fitdraw-unit",
  entered: "fitdraw-entered",
  usage: "fitdraw-usage",
  theme: "fitdraw-theme",
} as const;

export interface Draft {
  garmentId: string;
  values: MeasureValues;
  size: Size | null;
  coupe: Coupe;
  updatedAt: number;
}

export interface Branding {
  shopName: string;
  logoDataUrl: string;
  showWatermark: boolean;
}

export interface UsageEntry {
  garmentId: string;
  count: number;
  lastUsed: number;
}

export const DEFAULT_BRANDING: Branding = { shopName: "", logoDataUrl: "", showWatermark: true };

export async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function readString(key: string, fallback: string): Promise<string> {
  try {
    return (await AsyncStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function write(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  } catch {
    /* stockage plein : on continue en mémoire */
  }
}

export const emptyDraft = (garmentId: string): Draft => ({
  garmentId,
  values: {},
  size: null,
  coupe: "droit",
  // 0, pas Date.now() : un brouillon jamais touché ne doit jamais gagner face à une
  // version venue du serveur. C'est ce qui fait qu'un nouvel appareil récupère bien
  // les croquis déjà synchronisés (sinon l'horodatage local les écrase à l'ouverture).
  updatedAt: 0,
});

export async function loadDraft(garmentId: string): Promise<Draft> {
  const d = await read<Draft | null>(KEYS.draft(garmentId), null);
  if (!d || d.garmentId !== garmentId) return emptyDraft(garmentId);
  return { ...emptyDraft(garmentId), ...d, values: d.values ?? {} };
}

export const saveDraft = (d: Draft) => write(KEYS.draft(d.garmentId), { ...d, updatedAt: Date.now() });

export const loadBranding = async (): Promise<Branding> => ({
  ...DEFAULT_BRANDING,
  ...(await read<Partial<Branding>>(KEYS.branding, {})),
});
export const saveBranding = (b: Branding) => write(KEYS.branding, b);

export const loadUsage = () => read<UsageEntry[]>(KEYS.usage, []);
export const saveUsage = (u: UsageEntry[]) => write(KEYS.usage, u);

export async function bumpUsage(garmentId: string): Promise<UsageEntry[]> {
  const list = await loadUsage();
  const found = list.find((e) => e.garmentId === garmentId);
  if (found) {
    found.count += 1;
    found.lastUsed = Date.now();
  } else {
    list.push({ garmentId, count: 1, lastUsed: Date.now() });
  }
  await saveUsage(list);
  return list;
}

export type Theme = "light" | "dark";
