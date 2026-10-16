// Formes de référence des 12 vêtements + déformation par les mesures.
// Boîte 100×100, symétrie x = 50. On ne stocke que la moitié droite du contour.

export interface Pt { x: number; y: number }
export interface Seg { p: Pt; c?: Pt } // segment droit ou quadratique (contrôle c)

export type DetailType = 'dark' | 'line' | 'dash' | 'fold' | 'leaf' | 'grayfill' | 'btn'
export type Zone = 'body' | 'collar' | 'sleeve' | 'armhole' | 'fly'

export interface DetailDef {
  type: DetailType
  d?: string        // chemin SVG absolu (M/L/Q/Z)
  mirror?: boolean  // dessiner aussi en miroir
  at?: Pt[]         // pour BTN : centres des boutons
  zone?: Zone       // zone de déformation (défaut 'body')
}

export interface ShapeDef {
  p0: Pt
  nodes: Seg[]
  details: DetailDef[]
}

export type MeasureValues = Record<string, number | undefined> // cm saisis (undefined = vide)

const n = (x: number, y: number, cx?: number, cy?: number): Seg =>
  ({ p: { x, y }, c: cx !== undefined ? { x: cx, y: cy! } : undefined })

export const SHAPES: Record<string, ShapeDef> = {
  tshirt: {
    p0: { x: 50, y: 17 },
    nodes: [n(63, 8, 59, 17), n(85, 17), n(97, 34), n(89, 42), n(79, 36, 83, 37), n(79, 92), n(50, 94, 66, 94)],
    details: [
      { type: 'dark', d: 'M37 8 Q50 3 63 8', zone: 'collar' },
      { type: 'line', d: 'M38 9 Q50 27 62 9', zone: 'collar' },
      { type: 'line', d: 'M85 17 Q74 26 79 36', mirror: true, zone: 'armhole' },
      { type: 'dash', d: 'M94 32 L86 40', mirror: true, zone: 'sleeve' },
      { type: 'dash', d: 'M23 88 Q50 91 77 88' },
      { type: 'fold', d: 'M63 76 Q57 66 61 55', mirror: true },
    ],
  },
  polo: {
    p0: { x: 50, y: 17 },
    nodes: [n(63, 8, 59, 17), n(85, 17), n(97, 34), n(89, 42), n(79, 36, 83, 37), n(79, 92), n(50, 94, 66, 94)],
    details: [
      { type: 'dark', d: 'M37 8 Q50 3 63 8', zone: 'collar' },
      { type: 'line', d: 'M47.5 20 L47.5 38 L52.5 38 L52.5 20', zone: 'collar' },
      { type: 'leaf', d: 'M50 15 L63 6 L68 15 L56 20 Z', mirror: true, zone: 'collar' },
      { type: 'line', d: 'M85 17 Q74 26 79 36', mirror: true, zone: 'armhole' },
      { type: 'dash', d: 'M94 32 L86 40', mirror: true, zone: 'sleeve' },
      { type: 'dash', d: 'M23 88 Q50 91 77 88' },
      { type: 'btn', at: [{ x: 50, y: 26 }, { x: 50, y: 33 }], zone: 'collar' },
    ],
  },
  pull: {
    p0: { x: 50, y: 15 },
    nodes: [n(62, 7, 58, 15), n(82, 14), n(95, 72), n(86, 74), n(74, 38), n(73, 86), n(50, 88, 62, 88)],
    details: [
      { type: 'dark', d: 'M38 7 Q50 3 62 7', zone: 'collar' },
      { type: 'line', d: 'M39 8 Q50 25 61 8', zone: 'collar' },
      { type: 'line', d: 'M82 14 Q73 24 74 38', mirror: true, zone: 'armhole' },
      { type: 'line', d: 'M94 65 L85 67.5', mirror: true, zone: 'sleeve' },
      { type: 'line', d: 'M27 80 Q50 83 73 80' },
    ],
  },
  sweat: {
    p0: { x: 50, y: 15 },
    nodes: [n(62, 7, 58, 15), n(86, 17), n(96, 70), n(86, 73), n(75, 36), n(75, 84), n(50, 86, 64, 86)],
    details: [
      { type: 'dark', d: 'M38 7 Q50 3 62 7', zone: 'collar' },
      { type: 'line', d: 'M38 8 Q50 26 62 8', zone: 'collar' },
      { type: 'line', d: 'M86 17 Q77 24 75 36', mirror: true, zone: 'armhole' },
      { type: 'line', d: 'M95 63 L85.5 66', mirror: true, zone: 'sleeve' },
      { type: 'line', d: 'M26 78 Q50 81 74 78' },
    ],
  },
  capuche: {
    p0: { x: 50, y: 28 },
    nodes: [n(64, 18, 61, 29), n(84, 22), n(96, 72), n(86, 75), n(75, 42), n(75, 88), n(50, 90, 64, 90)],
    details: [
      { type: 'leaf', d: 'M34 20 Q31 2 50 2 Q69 2 66 20 Q58 31 50 31 Q42 31 34 20 Z', zone: 'collar' },
      { type: 'grayfill', d: 'M40 18 Q50 8 60 18 Q55 27 50 27 Q45 27 40 18 Z', zone: 'collar' },
      { type: 'line', d: 'M45.5 30 L44.5 46', zone: 'collar' },
      { type: 'line', d: 'M54.5 30 L55.5 46', zone: 'collar' },
      { type: 'line', d: 'M29 80 L34 64 L66 64 L71 80' },
      { type: 'line', d: 'M84 22 Q76 30 75 42', mirror: true, zone: 'armhole' },
      { type: 'line', d: 'M95 65 L85.5 68', mirror: true, zone: 'sleeve' },
      { type: 'line', d: 'M26 84 Q50 87 74 84' },
    ],
  },
  chemise: {
    p0: { x: 50, y: 13 },
    nodes: [n(62, 6), n(82, 14), n(95, 72), n(86, 74), n(74, 38), n(73, 88), n(50, 93, 62, 93)],
    details: [
      { type: 'dark', d: 'M38 6 Q50 2 62 6', zone: 'collar' },
      { type: 'line', d: 'M46.5 21 L46.5 92', zone: 'collar' },
      { type: 'line', d: 'M53.5 21 L53.5 92', zone: 'collar' },
      { type: 'leaf', d: 'M50 13 L63 5 L67 15 L55 21 Z', mirror: true, zone: 'collar' },
      { type: 'line', d: 'M82 14 Q73 24 74 38', mirror: true, zone: 'armhole' },
      { type: 'line', d: 'M94 65 L85 67.5', mirror: true, zone: 'sleeve' },
      { type: 'btn', at: [{ x: 50, y: 28 }, { x: 50, y: 40 }, { x: 50, y: 52 }, { x: 50, y: 64 }, { x: 50, y: 76 }, { x: 50, y: 86 }], zone: 'collar' },
    ],
  },
  veste: {
    p0: { x: 50, y: 6 },
    nodes: [n(60, 6), n(82, 14), n(95, 72), n(85, 74), n(74, 38), n(73, 90), n(50, 90)],
    details: [
      { type: 'dark', d: 'M40 6 Q50 2 60 6', zone: 'collar' },
      { type: 'line', d: 'M50 28 L50 90', zone: 'collar' },
      { type: 'leaf', d: 'M60 6 L67 15 L58 24 L51 36 L50 22 Z', mirror: true, zone: 'collar' },
      { type: 'line', d: 'M82 14 Q73 24 74 38', mirror: true, zone: 'armhole' },
      { type: 'line', d: 'M94 66 L85 68.5', mirror: true, zone: 'sleeve' },
      { type: 'line', d: 'M58 74 L70 74', mirror: true },
      { type: 'btn', at: [{ x: 55, y: 46 }, { x: 55, y: 60 }] },
    ],
  },
  debardeur: {
    p0: { x: 50, y: 22 },
    nodes: [n(62, 6, 58, 22), n(73, 6), n(74, 34, 66, 16), n(77, 92), n(50, 94, 66, 94)],
    details: [
      { type: 'line', d: 'M39 7 Q50 40 61 7' },
      { type: 'dash', d: 'M25 88 Q50 91 75 88' },
    ],
  },
  pantalon: {
    p0: { x: 50, y: 6 },
    nodes: [n(72, 6), n(74, 24), n(71, 96), n(55, 96), n(50, 38)],
    details: [
      { type: 'line', d: 'M27.5 13 L72.5 13' },
      { type: 'line', d: 'M52 13 L52 31 Q52 36 47 35', zone: 'fly' },
      { type: 'line', d: 'M72.9 14 Q60 17 60 30', mirror: true },
      { type: 'dash', d: 'M57 91 L70 91', mirror: true },
    ],
  },
  short: {
    p0: { x: 50, y: 24 },
    nodes: [n(72, 24), n(75, 42), n(73, 76), n(55, 76), n(50, 50)],
    details: [
      { type: 'line', d: 'M26.8 31 L73.2 31' },
      { type: 'line', d: 'M52 31 L52 45 Q52 50 47 49', zone: 'fly' },
      { type: 'line', d: 'M73.8 32 Q61 35 61 46', mirror: true },
      { type: 'dash', d: 'M57 72 L72 72', mirror: true },
    ],
  },
  jupe: {
    p0: { x: 50, y: 18 },
    nodes: [n(63, 18), n(88, 84, 66, 48), n(50, 89, 70, 89)],
    details: [
      { type: 'line', d: 'M35.5 26 L64.5 26' },
      { type: 'dash', d: 'M50 26 L50 44' },
      { type: 'line', d: 'M57 27 L56 40', mirror: true },
      { type: 'dash', d: 'M84 80 Q70 84 50 84', mirror: true },
    ],
  },
  robe: {
    p0: { x: 50, y: 18 },
    nodes: [n(61, 6, 58, 18), n(71, 6), n(69, 32, 64, 18), n(64, 52), n(88, 94, 66, 72), n(50, 98, 72, 98)],
    details: [
      { type: 'line', d: 'M39 7 Q50 38 61 7' },
      { type: 'line', d: 'M36 52 L64 52' },
      { type: 'line', d: 'M58 54 Q60 74 68 92', mirror: true },
    ],
  },
}

// ---------- utilitaires de chemins ----------

type Cmd = { cmd: string; pts: number[] }

export function parsePath(d: string): Cmd[] {
  const tokens = d.match(/[MLQZ]|-?\d*\.?\d+/gi) ?? []
  const cmds: Cmd[] = []
  let i = 0
  while (i < tokens.length) {
    const c = tokens[i].toUpperCase()
    if (c === 'Z') { cmds.push({ cmd: 'Z', pts: [] }); i++ }
    else if (c === 'M' || c === 'L') { cmds.push({ cmd: c, pts: [+tokens[i + 1], +tokens[i + 2]] }); i += 3 }
    else if (c === 'Q') { cmds.push({ cmd: c, pts: [+tokens[i + 1], +tokens[i + 2], +tokens[i + 3], +tokens[i + 4]] }); i += 5 }
    else i++
  }
  return cmds
}

export function transformPath(d: string, t: (x: number, y: number) => Pt): string {
  const fmt = (v: number) => Math.round(v * 100) / 100
  return parsePath(d).map((c) => {
    if (c.cmd === 'Z') return 'Z'
    if (c.cmd === 'M' || c.cmd === 'L') {
      const p = t(c.pts[0], c.pts[1])
      return `${c.cmd}${fmt(p.x)} ${fmt(p.y)}`
    }
    const p1 = t(c.pts[0], c.pts[1])
    const p2 = t(c.pts[2], c.pts[3])
    return `Q${fmt(p1.x)} ${fmt(p1.y)} ${fmt(p2.x)} ${fmt(p2.y)}`
  }).join(' ')
}

export const mirrorPath = (d: string) => transformPath(d, (x, y) => ({ x: 100 - x, y }))

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

// ---------- déformation ----------

export interface DeformedShape {
  /** nœuds déformés de la moitié droite (P0 compris en tête implicite) */
  p0: Pt
  nodes: Seg[]
  transform: (x: number, y: number) => Pt
  zoneTransform: (zone: Zone) => (x: number, y: number) => Pt
}

const TOP_IDS = ['tshirt', 'polo', 'pull', 'sweat', 'capuche', 'chemise', 'veste']

export function deformShape(id: string, vals: MeasureValues, defs: Record<string, number>, coupe = 1): DeformedShape {
  const s = SHAPES[id]
  const k = (key: string) => {
    const v = vals[key]
    return v !== undefined && v > 0 ? v / defs[key] : 1
  }
  const N = s.nodes.map((seg) => ({ p: { ...seg.p }, c: seg.c ? { ...seg.c } : undefined }))
  const sx = (p: Pt, kk: number) => { p.x = 50 + (p.x - 50) * kk }

  if (TOP_IDS.includes(id)) {
    const kS = k('epaules'), kA = k('aisselles'), kM = k('manche')
    const vL = k('longueur')
    const yCol = N[0].p.y, yArm = N[4].p.y, yHem = N[5].p.y
    const yHem2 = yCol + (yHem - yCol) * vL
    // N0 col, N1 épaule : kS
    sx(N[0].p, kS); if (N[0].c) sx(N[0].c, kS)
    sx(N[1].p, kS)
    // N2 : vecteur N1->N2 × kM ; N3 : largeur de manchette inchangée
    const e = { x: N[2].p.x - N[1].p.x, y: N[2].p.y - N[1].p.y }
    const cuff = { x: N[3].p.x - N[2].p.x, y: N[3].p.y - N[2].p.y }
    N[2].p = { x: N[1].p.x + e.x * kM, y: N[1].p.y + e.y * kM }
    N[3].p = { x: N[2].p.x + cuff.x, y: N[2].p.y + cuff.y }
    // N4 aisselle, N5 côté : kA
    sx(N[4].p, kA); if (N[4].c) sx(N[4].c, kA)
    sx(N[5].p, kA)
    N[5].p.y = yCol + (N[5].p.y - yCol) * vL
    N[6].p.y = yCol + (N[6].p.y - yCol) * vL
    if (N[6].c) { sx(N[6].c, kA); N[6].c.y = yCol + (N[6].c.y - yCol) * vL }

    const vs = (yHem2 - yArm) / (yHem - yArm)
    const bodyT = (x: number, y: number): Pt => {
      const kk = y <= yCol ? kS : y < yArm ? lerp(kS, kA, (y - yCol) / (yArm - yCol)) : kA
      return { x: 50 + (x - 50) * kk, y: y <= yArm ? y : yArm + (y - yArm) * vs }
    }
    const collarT = (x: number, y: number): Pt => ({ x: 50 + (x - 50) * kS, y })
    // translation subie par N2 par rapport à une simple mise à l'échelle des épaules
    const n2Base = { x: 50 + (SHAPES[id].nodes[2].p.x - 50) * kS, y: SHAPES[id].nodes[2].p.y }
    const t2 = { x: N[2].p.x - n2Base.x, y: N[2].p.y - n2Base.y }
    const sleeveT = (x: number, y: number): Pt => ({ x: 50 + (x - 50) * kS + t2.x, y: y + t2.y })

    return {
      p0: { ...s.p0 }, nodes: N, transform: bodyT,
      zoneTransform: (z) => z === 'collar' ? collarT : z === 'sleeve' ? sleeveT : bodyT,
    }
  }

  if (id === 'pantalon' || id === 'short') {
    const kW = k('taille'), kH = k('hanches'), vL = k('longueur'), kI = k('entrejambe')
    const kLeg = kH * coupe
    const yC = N[0].p.y, yHip = N[1].p.y, yB = N[2].p.y, yCr = N[4].p.y
    const yB2 = yC + (yB - yC) * vL
    sx(N[0].p, kW)
    sx(N[1].p, kH); sx(N[2].p, kLeg); sx(N[3].p, kLeg)
    N[2].p.y = yB2; N[3].p.y = yB2
    N[4].p.y = yB2 - (yB - yCr) * kI
    const vs = (yB2 - yHip) / (yB - yHip)
    const bodyT = (x: number, y: number): Pt => {
      const kk = y <= yC ? kW : y < yHip ? lerp(kW, kH, (y - yC) / (yHip - yC)) : kLeg
      return { x: 50 + (x - 50) * kk, y: y <= yHip ? y : yHip + (y - yHip) * vs }
    }
    const flyMaxY = N[4].p.y - 7
    const flyT = (x: number, y: number): Pt => {
      const p = bodyT(x, y)
      return { x: p.x, y: Math.min(p.y, flyMaxY) }
    }
    return { p0: { ...s.p0 }, nodes: N, transform: bodyT, zoneTransform: (z) => z === 'fly' ? flyT : bodyT }
  }

  if (id === 'jupe') {
    const kW = k('taille'), kB = k('bas'), vL = k('longueur')
    const yC = N[0].p.y, yH = N[1].p.y
    sx(N[0].p, kW)
    sx(N[1].p, kB); if (N[1].c) { sx(N[1].c, kB); N[1].c.y = yC + (N[1].c.y - yC) * vL }
    N[1].p.y = yC + (N[1].p.y - yC) * vL
    N[2].p.y = yC + (N[2].p.y - yC) * vL
    if (N[2].c) { sx(N[2].c, kB); N[2].c.y = yC + (N[2].c.y - yC) * vL }
    const bodyT = (x: number, y: number): Pt => {
      const kk = lerp(kW, kB, clamp01((y - yC) / (yH - yC)))
      return { x: 50 + (x - 50) * kk, y: yC + (y - yC) * vL }
    }
    return { p0: { ...s.p0 }, nodes: N, transform: bodyT, zoneTransform: () => bodyT }
  }

  if (id === 'robe') {
    const kA = k('aisselles'), kT = k('taille'), kB = k('bas'), vL = k('longueur')
    const yH = N[0].p.y, yArm = N[2].p.y, yT = N[3].p.y, yB = N[4].p.y
    const yscale = (p: Pt) => { p.y = yH + (p.y - yH) * vL }
    sx(N[0].p, kA); if (N[0].c) sx(N[0].c, kA)
    sx(N[1].p, kA)
    sx(N[2].p, kA); if (N[2].c) sx(N[2].c, kA)
    sx(N[3].p, kT); yscale(N[3].p)
    sx(N[4].p, kB); yscale(N[4].p); if (N[4].c) { sx(N[4].c, kB); yscale(N[4].c) }
    yscale(N[5].p); if (N[5].c) { sx(N[5].c, kB); yscale(N[5].c) }
    const bodyT = (x: number, y: number): Pt => {
      let kk: number
      if (y <= yArm) kk = kA
      else if (y < yT) kk = lerp(kA, kT, (y - yArm) / (yT - yArm))
      else if (y < yB) kk = lerp(kT, kB, (y - yT) / (yB - yT))
      else kk = kB
      return { x: 50 + (x - 50) * kk, y: yH + (y - yH) * vL }
    }
    return { p0: { ...s.p0 }, nodes: N, transform: bodyT, zoneTransform: () => bodyT }
  }

  if (id === 'debardeur') {
    const kS = k('epaules'), kA = k('aisselles'), vL = k('longueur')
    const yH = N[0].p.y, yArm = N[2].p.y
    sx(N[0].p, kS); if (N[0].c) sx(N[0].c, kS)
    sx(N[1].p, kS)
    sx(N[2].p, kA); if (N[2].c) sx(N[2].c, kS)
    sx(N[3].p, kA); N[3].p.y = yH + (N[3].p.y - yH) * vL
    N[4].p.y = yH + (N[4].p.y - yH) * vL
    if (N[4].c) { sx(N[4].c, kA); N[4].c.y = yH + (N[4].c.y - yH) * vL }
    const vs = (N[3].p.y - yArm) / (SHAPES.debardeur.nodes[3].p.y - yArm)
    const bodyT = (x: number, y: number): Pt => {
      const kk = y <= yH ? kS : y < yArm ? lerp(kS, kA, (y - yH) / (yArm - yH)) : kA
      return { x: 50 + (x - 50) * kk, y: y <= yArm ? y : yArm + (y - yArm) * vs }
    }
    return { p0: { ...s.p0 }, nodes: N, transform: bodyT, zoneTransform: () => bodyT }
  }

  return { p0: { ...s.p0 }, nodes: N, transform: (x, y) => ({ x, y }), zoneTransform: () => (x, y) => ({ x, y }) }
}

// ---------- construction du tracé ----------

const f = (v: number) => Math.round(v * 100) / 100

/** Contour complet (droite + miroir gauche) à partir de nœuds déformés */
export function contourPath(p0: Pt, nodes: Seg[]): string {
  let d = `M${f(p0.x)} ${f(p0.y)}`
  for (const seg of nodes) {
    d += seg.c ? ` Q${f(seg.c.x)} ${f(seg.c.y)} ${f(seg.p.x)} ${f(seg.p.y)}` : ` L${f(seg.p.x)} ${f(seg.p.y)}`
  }
  // remontée en miroir : segments inversés
  for (let i = nodes.length - 1; i >= 0; i--) {
    const target = i === 0 ? p0 : nodes[i - 1].p
    const mTarget = { x: 100 - target.x, y: target.y }
    const c = nodes[i].c
    if (c) d += ` Q${f(100 - c.x)} ${f(c.y)} ${f(mTarget.x)} ${f(mTarget.y)}`
    else d += ` L${f(mTarget.x)} ${f(mTarget.y)}`
  }
  return d + ' Z'
}

/** Boîte englobante approximative d'une liste de chemins (points de contrôle inclus) */
export function pathBBox(ds: string[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const d of ds) {
    const nums = d.match(/-?\d*\.?\d+/g) ?? []
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const x = +nums[i], y = +nums[i + 1]
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  return { minX, minY, maxX, maxY }
}
