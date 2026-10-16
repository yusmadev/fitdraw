// Calcul des cotations (flèches, traits d'attache, pastilles) à partir des nœuds déformés.
import type { DeformedShape, Pt } from './shapes'

export interface ArrowDef {
  key: string
  from: Pt
  to: Pt
  attach: [Pt, Pt][]   // traits d'attache en pointillé
  ticks: [Pt, Pt][]    // petits traits d'extrémité (flèches verticales)
  pill: Pt             // centre de la pastille
}

const dist = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y)

/** Flèche parallèle à un bord, décalée le long de la normale extérieure. */
function parallelArrow(key: string, a: Pt, b: Pt, off: number, pillExtra: number): ArrowDef {
  const L = dist(a, b)
  const n = { x: (b.y - a.y) / L, y: -(b.x - a.x) / L }
  const shift = (p: Pt, k: number): Pt => ({ x: p.x + n.x * k, y: p.y + n.y * k })
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  return {
    key,
    from: shift(a, off),
    to: shift(b, off),
    attach: [[shift(a, 1.5), shift(a, off + 1.5)], [shift(b, 1.5), shift(b, off + 1.5)]],
    ticks: [],
    pill: shift(mid, off + pillExtra),
  }
}

function hArrow(key: string, xLeft: number, xRight: number, y: number, attachFrom?: number): ArrowDef {
  const attach: [Pt, Pt][] = attachFrom !== undefined
    ? [[{ x: xLeft, y: attachFrom }, { x: xLeft, y }], [{ x: xRight, y: attachFrom }, { x: xRight, y }]]
    : []
  return {
    key,
    from: { x: xLeft, y },
    to: { x: xRight, y },
    attach,
    ticks: [],
    pill: { x: (xLeft + xRight) / 2, y },
  }
}

function vArrow(key: string, x: number, yTop: number, yBottom: number): ArrowDef {
  return {
    key,
    from: { x, y: yTop },
    to: { x, y: yBottom },
    attach: [],
    ticks: [[{ x: x - 6, y: yTop }, { x: x + 6, y: yTop }], [{ x: x - 6, y: yBottom }, { x: x + 6, y: yBottom }]],
    pill: { x, y: (yTop + yBottom) / 2 },
  }
}

const TOP_IDS = ['tshirt', 'polo', 'pull', 'sweat', 'capuche', 'chemise', 'veste']

/**
 * Calcule les flèches pour un vêtement déformé.
 * pillW/pillH : demi-dimensions de la pastille pour le calcul du support (flèche de manche).
 */
export function computeArrows(id: string, ds: DeformedShape, pillW: number, pillH: number): ArrowDef[] {
  const N = ds.nodes.map((s) => s.p)
  const rightMost = Math.max(...N.map((p) => p.x), ds.p0.x)

  if (TOP_IDS.includes(id)) {
    // N0 col, N1 épaule, N2 bas ext. manche, N3 bas int. manche, N4 aisselle, N5 côté, N6 ourlet
    const arrows: ArrowDef[] = []
    arrows.push(hArrow('epaules', 100 - N[1].x, N[1].x, N[1].y - 23, N[1].y))
    arrows.push(hArrow('aisselles', 100 - N[4].x, N[4].x, N[4].y + 6))
    arrows.push(vArrow('longueur', rightMost + 37, N[0].y, N[5].y + 1))
    // manche : parallèle au bord extérieur N1 -> N2, normale vers le haut/droite
    const L = dist(N[1], N[2])
    const nrm = { x: (N[2].y - N[1].y) / L, y: -(N[2].x - N[1].x) / L }
    const support = (pillW / 2) * Math.abs(nrm.x) + (pillH / 2) * Math.abs(nrm.y)
    arrows.push(parallelArrow('manche', N[1], N[2], 7, support + 1.5))
    return orderArrows(id, arrows)
  }

  if (id === 'pantalon' || id === 'short') {
    // N0 ceinture, N1 hanche, N2 bas ext., N3 bas int., N4 entrejambe
    const arrows: ArrowDef[] = []
    arrows.push(hArrow('taille', 100 - N[0].x, N[0].x, N[0].y - 8, N[0].y))
    arrows.push(hArrow('hanches', 100 - N[1].x, N[1].x, N[1].y + 6))
    arrows.push(vArrow('longueur', rightMost + 37, N[0].y, N[2].y + 1))
    // entrejambe : parallèle à la couture intérieure N4 -> N3, décalée vers l'intérieur
    const a = parallelArrow('entrejambe', N[4], N[3], 7, 0)
    // pastille sous le bas de jambe pour ne pas recouvrir le vêtement
    const e = { x: N[3].x - N[4].x, y: N[3].y - N[4].y }
    const L = Math.hypot(e.x, e.y)
    a.pill = { x: N[3].x + (e.x / L) * 8, y: N[3].y + (e.y / L) * 8 }
    arrows.push(a)
    return orderArrows(id, arrows)
  }

  if (id === 'jupe') {
    const arrows: ArrowDef[] = []
    arrows.push(hArrow('taille', 100 - N[0].x, N[0].x, N[0].y - 8, N[0].y))
    arrows.push(hArrow('bas', 100 - N[1].x, N[1].x, N[2].y + 8, N[1].y))
    arrows.push(vArrow('longueur', rightMost + 37, N[0].y, N[2].y + 1))
    return orderArrows(id, arrows)
  }

  if (id === 'robe') {
    // N0 bretelle int., N1 bretelle ext., N2 aisselle, N3 taille, N4 ourlet, N5 milieu ourlet
    const arrows: ArrowDef[] = []
    arrows.push(hArrow('aisselles', 100 - N[2].x, N[2].x, N[2].y + 6))
    arrows.push(hArrow('taille', 100 - N[3].x, N[3].x, N[3].y, N[3].y))
    arrows.push(hArrow('bas', 100 - N[4].x, N[4].x, N[5].y + 8, N[4].y))
    arrows.push(vArrow('longueur', rightMost + 37, N[0].y, N[5].y + 1))
    return orderArrows(id, arrows)
  }

  if (id === 'debardeur') {
    const arrows: ArrowDef[] = []
    arrows.push(hArrow('epaules', 100 - N[1].x, N[1].x, N[1].y - 6, N[1].y))
    arrows.push(hArrow('aisselles', 100 - N[3].x, N[3].x, N[2].y + 6))
    arrows.push(vArrow('longueur', rightMost + 37, N[1].y, N[3].y + 1))
    return orderArrows(id, arrows)
  }

  return []
}

function orderArrows(_id: string, arrows: ArrowDef[]): ArrowDef[] {
  return arrows
}

/** Corps d'une flèche : la ligne s'arrête à 80 % des pointes triangulaires. */
export function arrowBody(a: ArrowDef): { line: [Pt, Pt]; heads: [Pt[], Pt[]] } {
  const L = dist(a.from, a.to)
  const u = { x: (a.to.x - a.from.x) / L, y: (a.to.y - a.from.y) / L }
  const perp = { x: -u.y, y: u.x }
  const HL = 4.2, HW = 1.9
  const headAt = (tip: Pt, dir: 1 | -1): Pt[] => {
    const bx = tip.x - dir * u.x * HL, by = tip.y - dir * u.y * HL
    return [
      tip,
      { x: bx + perp.x * HW, y: by + perp.y * HW },
      { x: bx - perp.x * HW, y: by - perp.y * HW },
    ]
  }
  return {
    line: [
      { x: a.from.x + u.x * HL * 0.8, y: a.from.y + u.y * HL * 0.8 },
      { x: a.to.x - u.x * HL * 0.8, y: a.to.y - u.y * HL * 0.8 },
    ],
    heads: [headAt(a.from, -1), headAt(a.to, 1)],
  }
}
