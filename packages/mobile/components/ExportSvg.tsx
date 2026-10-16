import { forwardRef } from "react";
import Svg, { Image as SvgImage, Rect, SvgProps, Text as SvgText } from "react-native-svg";
import { buildSketchModel, COLORS, type Unit } from "@template/web/fitdraw/renderSketch";
import type { GarmentDef } from "@template/web/fitdraw/garments";
import type { MeasureValues } from "@template/web/fitdraw/shapes";
import { SketchContent } from "./Sketch";

const BG = "#F3F4F8";
const SIZE = 320;
const SCALE = 5;

export interface ExportBranding {
  showWatermark: boolean;
  shopName: string;
  logoDataUrl: string;
}

export interface ExportSvgProps {
  garment: GarmentDef;
  values: MeasureValues;
  unit: Unit;
  branding: ExportBranding;
  title: string;
  coupe?: number;
}

/**
 * Composition d'export 1600 × 1600 — mêmes repères que le canvas web (espace 320 × 320 × 5) :
 * titre, sous-titre, croquis centré dans son cadre, pied de page et signature boutique.
 */
const ExportSvg = forwardRef<Svg, ExportSvgProps>(function ExportSvg(
  { garment, values, unit, branding, title, coupe = 1 },
  ref,
) {
  const model = buildSketchModel(garment, values, unit, null, true, coupe);
  const shopName = branding.shopName.trim().slice(0, 32);
  const hasLogo = Boolean(branding.logoDataUrl);

  return (
    <Svg ref={ref} width={SIZE * SCALE} height={SIZE * SCALE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Rect x={0} y={0} width={SIZE} height={SIZE} fill={BG} />

      <SvgText x={20} y={30} fontSize={13} fontWeight={800} fill={COLORS.ink} letterSpacing={1.2}>
        {title}
      </SvgText>
      <SvgText x={300} y={30} fontSize={11} fontWeight={600} fill="#6B7080" textAnchor="end">
        Mesures à plat
      </SvgText>

      {/* cadre du croquis : x 9, y 38, 302 × 246, fit « meet » */}
      <Svg
        x={9}
        y={38}
        width={302}
        height={246}
        viewBox={model.viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        <SketchContent
          garment={garment}
          values={values}
          unit={unit}
          activeKey={null}
          coupe={coupe}
          forExport
        />
      </Svg>

      <SvgText x={20} y={306} fontSize={10.5} fontWeight={600} fill="#6B7080">
        Mesures prises à plat, ± 1 cm
      </SvgText>

      {hasLogo ? (
        <SvgImage
          href={{ uri: branding.logoDataUrl }}
          x={20}
          y={288}
          width={18}
          height={18}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : null}

      <SvgText
        x={hasLogo ? 44 : 300}
        y={306}
        fontSize={13}
        fontWeight={800}
        fill={shopName ? COLORS.ink : COLORS.accent}
        textAnchor={hasLogo ? "start" : "end"}
      >
        {shopName || "FitDraw"}
      </SvgText>
    </Svg>
  );
});

export default ExportSvg;
export type { SvgProps };
