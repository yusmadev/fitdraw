import { describe, expect, it } from 'vitest'
import { GARMENTS, SIZES, sizeValue } from './garments'
import { buildSketchModel } from './renderSketch'

const parseViewBox = (viewBox: string) => viewBox.split(/\s+/).map(Number)

describe('buildSketchModel', () => {
  it('fits every garment contour, labels and arrow tips inside its viewBox', () => {
    for (const garment of GARMENTS) {
      const values = Object.fromEntries(garment.measures.map((measure) => [measure.key, measure.def]))
      const model = buildSketchModel(garment, values, 'cm', null, false)
      const [x, y, width, height] = parseViewBox(model.viewBox)
      const right = x + width
      const bottom = y + height

      expect(Number.isFinite(x), garment.id).toBe(true)
      expect(Number.isFinite(y), garment.id).toBe(true)
      expect(Number.isFinite(width) && width > 0, garment.id).toBe(true)
      expect(Number.isFinite(height) && height > 0, garment.id).toBe(true)

      for (const arrow of model.arrows) {
        expect(arrow.pill.x - arrow.pill.w / 2, `${garment.id}:${arrow.key} left`).toBeGreaterThanOrEqual(x)
        expect(arrow.pill.x + arrow.pill.w / 2, `${garment.id}:${arrow.key} right`).toBeLessThanOrEqual(right)
        expect(arrow.pill.y - arrow.pill.h / 2, `${garment.id}:${arrow.key} top`).toBeGreaterThanOrEqual(y)
        expect(arrow.pill.y + arrow.pill.h / 2, `${garment.id}:${arrow.key} bottom`).toBeLessThanOrEqual(bottom)
        for (const point of arrow.line) {
          expect(point.x, `${garment.id}:${arrow.key} line x`).toBeGreaterThanOrEqual(x)
          expect(point.x, `${garment.id}:${arrow.key} line x`).toBeLessThanOrEqual(right)
          expect(point.y, `${garment.id}:${arrow.key} line y`).toBeGreaterThanOrEqual(y)
          expect(point.y, `${garment.id}:${arrow.key} line y`).toBeLessThanOrEqual(bottom)
        }
      }
    }
  })

  it('shows missing measurements as question marks and formats filled measurements in French', () => {
    const tshirt = GARMENTS.find((garment) => garment.id === 'tshirt')!
    const model = buildSketchModel(tshirt, { aisselles: 52.5 }, 'cm', null, false)
    const byKey = Object.fromEntries(model.arrows.map((arrow) => [arrow.key, arrow]))

    expect(byKey.aisselles.pill.line1).toBe('52,5 cm')
    expect(byKey.longueur.pill.empty).toBe(true)
    expect(byKey.longueur.pill.line1).toBe('?')
  })
})

describe('sizeValue', () => {
  it('keeps length presets changing more gently than widths', () => {
    expect(SIZES).toContain('XS')
    expect(sizeValue(50, 'aisselles', 'XS')).toBe(45)
    expect(sizeValue(70, 'longueur', 'XS')).toBe(66)
    expect(sizeValue(70, 'longueur', 'XXL')).toBe(77.5)
  })
})
