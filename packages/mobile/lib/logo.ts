// Logo de boutique : sélection dans la galerie, redimensionné à 256 px,
// renvoyé en data URL plafonnée à 350 000 caractères — mêmes règles que le web.
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

export const MAX_LOGO_CHARS = 350_000;
const MAX_SIDE = 256;

export interface LogoResult {
  ok: boolean
  cancelled?: boolean
  error?: string
  dataUrl?: string
}

/** Ouvre la galerie, redimensionne et renvoie le logo prêt à être stocké. */
export async function pickLogo(): Promise<LogoResult> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return { ok: false, error: "Accès à la galerie refusé." };

  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 1,
  });
  if (picked.canceled || !picked.assets?.length) return { ok: false, cancelled: true };

  const asset = picked.assets[0];

  try {
    const ref = await ImageManipulator.manipulate(asset.uri).resize({ width: MAX_SIDE }).renderAsync();
    const saved = await ref.saveAsync({ base64: true, format: SaveFormat.PNG });
    if (saved.base64) {
      const dataUrl = `data:image/png;base64,${saved.base64}`;
      if (dataUrl.length > MAX_LOGO_CHARS) {
        return { ok: false, error: "Logo trop lourd une fois optimisé — essaie une image plus simple." };
      }
      return { ok: true, dataUrl };
    }
  } catch {
    /* on retente avec le base64 brut de la galerie */
  }

  if (asset.base64) {
    const dataUrl = `data:image/jpeg;base64,${asset.base64}`;
    if (dataUrl.length > MAX_LOGO_CHARS) return { ok: false, error: "Logo trop lourd — essaie une image plus simple." };
    return { ok: true, dataUrl };
  }

  return { ok: false, error: "Redimensionnement impossible." };
}
