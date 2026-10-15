export type Category = 'hauts' | 'bas' | 'robes' | 'vestes'

export interface MeasureDef {
  key: string
  label: string
  help: string
  def: number // valeur par défaut en cm (jamais affichée)
  short: string // nom court pour la pastille d'export
}

export interface GarmentDef {
  id: string
  name: string
  category: Category
  measures: MeasureDef[]
}

const HELP = {
  longueurHaut: "Du point le plus haut de l'épaule, près du col, jusqu'au bas du vêtement, à plat.",
  aisselles: "D'une aisselle à l'autre, vêtement à plat.",
  epaules: "D'une pointe d'épaule à l'autre, dans le dos, en passant par la base du cou.",
  manche: "De la pointe de l'épaule jusqu'au bas de la manche.",
  taille: "D'un bord à l'autre de la ceinture, vêtement à plat.",
  hanches: "À l'endroit le plus large, sous la poche, vêtement à plat.",
  entrejambe: "De l'entrejambe jusqu'au bas de la jambe, le long de la couture intérieure.",
  longueurBas: "Du haut de la ceinture (ou de l'épaule pour la robe) jusqu'au bas.",
  bas: "D'un bord à l'autre de l'ourlet, vêtement à plat.",
}

const topMeasures = (L: number, A: number, S: number, M: number): MeasureDef[] => [
  { key: 'longueur', label: 'Longueur', help: HELP.longueurHaut, def: L, short: 'LONGUEUR' },
  { key: 'aisselles', label: 'Largeur aux aisselles', help: HELP.aisselles, def: A, short: 'AISSELLES' },
  { key: 'epaules', label: "Largeur d'épaules", help: HELP.epaules, def: S, short: 'ÉPAULES' },
  { key: 'manche', label: 'Longueur de manche', help: HELP.manche, def: M, short: 'MANCHE' },
]

export const GARMENTS: GarmentDef[] = [
  { id: 'tshirt', name: 'T-shirt', category: 'hauts', measures: topMeasures(70, 52, 46, 22) },
  { id: 'pull', name: 'Pull', category: 'hauts', measures: topMeasures(66, 54, 46, 60) },
  { id: 'chemise', name: 'Chemise', category: 'hauts', measures: topMeasures(74, 54, 46, 62) },
  { id: 'pantalon', name: 'Pantalon', category: 'bas', measures: [
    { key: 'taille', label: 'Largeur de taille', help: HELP.taille, def: 40, short: 'TAILLE' },
    { key: 'hanches', label: 'Largeur de hanches', help: HELP.hanches, def: 50, short: 'HANCHES' },
    { key: 'entrejambe', label: 'Entrejambe', help: HELP.entrejambe, def: 78, short: 'ENTREJAMBE' },
    { key: 'longueur', label: 'Longueur totale', help: HELP.longueurBas, def: 102, short: 'LONGUEUR' },
  ]},
  { id: 'short', name: 'Short', category: 'bas', measures: [
    { key: 'taille', label: 'Largeur de taille', help: HELP.taille, def: 40, short: 'TAILLE' },
    { key: 'hanches', label: 'Largeur de hanches', help: HELP.hanches, def: 50, short: 'HANCHES' },
    { key: 'entrejambe', label: 'Entrejambe', help: HELP.entrejambe, def: 20, short: 'ENTREJAMBE' },
    { key: 'longueur', label: 'Longueur totale', help: HELP.longueurBas, def: 45, short: 'LONGUEUR' },
  ]},
  { id: 'jupe', name: 'Jupe', category: 'bas', measures: [
    { key: 'taille', label: 'Largeur de taille', help: HELP.taille, def: 36, short: 'TAILLE' },
    { key: 'bas', label: 'Largeur en bas', help: HELP.bas, def: 70, short: 'EN BAS' },
    { key: 'longueur', label: 'Longueur', help: HELP.longueurBas, def: 55, short: 'LONGUEUR' },
  ]},
  { id: 'robe', name: 'Robe', category: 'robes', measures: [
    { key: 'aisselles', label: 'Largeur aux aisselles', help: HELP.aisselles, def: 46, short: 'AISSELLES' },
    { key: 'taille', label: 'Largeur de taille', help: HELP.taille, def: 38, short: 'TAILLE' },
    { key: 'bas', label: 'Largeur en bas', help: HELP.bas, def: 70, short: 'EN BAS' },
    { key: 'longueur', label: 'Longueur', help: HELP.longueurBas, def: 100, short: 'LONGUEUR' },
  ]},
  { id: 'veste', name: 'Veste', category: 'vestes', measures: topMeasures(72, 54, 46, 62) },
  { id: 'capuche', name: 'Sweat à capuche', category: 'hauts', measures: topMeasures(70, 58, 52, 60) },
  { id: 'sweat', name: 'Sweat', category: 'hauts', measures: topMeasures(68, 56, 50, 60) },
  { id: 'polo', name: 'Polo', category: 'hauts', measures: topMeasures(70, 52, 46, 22) },
  { id: 'debardeur', name: 'Débardeur', category: 'hauts', measures: [
    { key: 'longueur', label: 'Longueur', help: HELP.longueurHaut, def: 62, short: 'LONGUEUR' },
    { key: 'aisselles', label: 'Largeur aux aisselles', help: HELP.aisselles, def: 46, short: 'AISSELLES' },
    { key: 'epaules', label: "Largeur d'épaules", help: HELP.epaules, def: 34, short: 'ÉPAULES' },
  ]},
]

export const CATEGORIES: { id: Category | 'tous'; label: string }[] = [
  { id: 'tous', label: 'Tous' },
  { id: 'hauts', label: 'Hauts' },
  { id: 'bas', label: 'Bas' },
  { id: 'robes', label: 'Robes' },
  { id: 'vestes', label: 'Vestes' },
]

export const getGarment = (id: string): GarmentDef =>
  GARMENTS.find((g) => g.id === id) ?? GARMENTS[0]

/** Noms courts de mesure déjà en MAJUSCULES dans les defs */
export const isTopLike = (id: string) =>
  ['tshirt', 'polo', 'pull', 'sweat', 'capuche', 'chemise', 'veste'].includes(id)

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const
export type Size = (typeof SIZES)[number]

/** Facteur de largeur par taille (M = 1). Les longueurs évoluent moins vite. */
export const SIZE_FACTOR: Record<Size, number> = {
  XS: 0.9, S: 0.95, M: 1, L: 1.06, XL: 1.13, XXL: 1.2,
}

export const LENGTH_KEYS = ['longueur', 'manche', 'entrejambe']

/** Valeur indicative à plat pour une taille donnée, arrondie au 0,5 cm. */
export function sizeValue(def: number, key: string, size: Size): number {
  const f = SIZE_FACTOR[size]
  const k = LENGTH_KEYS.includes(key) ? 1 + (f - 1) * 0.55 : f
  return Math.round(def * k * 2) / 2
}

export type Coupe = 'slim' | 'droit' | 'baggy'
export const COUPES: { id: Coupe; label: string; factor: number }[] = [
  { id: 'slim', label: 'Slim', factor: 0.86 },
  { id: 'droit', label: 'Droit', factor: 1 },
  { id: 'baggy', label: 'Baggy', factor: 1.2 },
]
export const coupeFactor = (c: Coupe) => COUPES.find((x) => x.id === c)?.factor ?? 1
export const hasCoupe = (garmentId: string) => garmentId === 'pantalon' || garmentId === 'short'
