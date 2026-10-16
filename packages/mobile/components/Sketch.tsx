import Svg, { Circle, ClipPath, Defs, G, Line, Path, Polygon, Rect, Text as SvgText } from "react-native-svg";
import { buildSketchModel, parseViewBox, COLORS, type Unit } from "@template/web/fitdraw/renderSketch";
import type { GarmentDef } from "@template/web/fitdraw/garments";
import type { MeasureValues } from "@template/web/fitdraw/shapes";

export interface SketchProps {
  garment: GarmentDef;
  values: MeasureValues;
  unit: Unit;
  activeKey?: string | null;
  coupe?: number;
  width?: number | string;
  height?: number | string;
  /** Rendu d'export : pastilles nom court + valeur, pas de surbrillance. */
  forExport?: boolean;
}

/** Même pavage « FitDraw » que l'export : pas de 24 × 11, incliné à −22°. */
function watermarkGrid(viewBox: string) {
  const vb = parseViewBox(viewBox);
  const rows: number[] = [];
  const cols: number[] = [];
  for (let y = vb.minY - 60; y < vb.minY + vb.h + 60; y += 11) rows.push(y);
  for (let x = vb.minX - 60; x < vb.minX + vb.w + 60; x += 24) cols.push(x);
  return { rows, cols };
}

function detailStyle(type: string) {
  switch (type) {
    case "dark":
      return { fill: "none", stroke: COLORS.ink, width: 1.2, dash: undefined };
    case "dash":
      return { fill: "none", stroke: COLORS.line, width: 0.8, dash: "1.6 1.6" };
    case "fold":
      return { fill: "none", stroke: COLORS.fold, width: 0.8, dash: undefined };
    case "leaf":
      return { fill: "#FFFFFF", stroke: COLORS.ink, width: 1, dash: undefined };
    case "grayfill":
      return { fill: "#E3E6EE", stroke: COLORS.line, width: 0.8, dash: undefined };
    default:
      return { fill: "none", stroke: COLORS.line, width: 0.8, dash: undefined };
  }
}

/**
 * Contenu du croquis, sans <Svg> racine : réutilisé tel quel par le rendu d'écran
 * et par la composition d'export 1600 × 1600 (où il est imbriqué dans un <Svg>).
 */
export function SketchContent({ garment, values, unit, activeKey = null, coupe = 1, forExport = false }: SketchProps) {
  const model = buildSketchModel(garment, values, unit, activeKey, forExport, coupe);
  const wm = watermarkGrid(model.viewBox);
  const clipId = `fd-contour-${garment.id}-${forExport ? "x" : "s"}`;

  return (
    <>
      <Defs>
        <ClipPath id={clipId}>
          <Path d={model.contour} />
        </ClipPath>
      </Defs>

      <Path d={model.contour} fill="#FFFFFF" />

      <G clipPath={`url(#${clipId})`} opacity={0.5}>
        {wm.rows.map((y, r) => (
          <G key={`r${r}`}>
            {wm.cols.map((x, c) => (
              <SvgText
                key={`c${c}`}
                x={0}
                y={0}
                fontSize={3.8}
                fontWeight={800}
                fill="#7F87A8"
                transform={`translate(${x} ${y}) rotate(-22)`}
              >
                FitDraw
              </SvgText>
            ))}
          </G>
        ))}
      </G>

      <Path
        d={model.contour}
        fill="none"
        stroke={COLORS.ink}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {model.details.map((d, i) => {
        const st = detailStyle(d.type);
        return (
          <Path
            key={`d${i}`}
            d={d.d}
            fill={st.fill}
            stroke={st.stroke}
            strokeWidth={st.width}
            strokeDasharray={st.dash}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        );
      })}

      {model.btns.map((b, i) => (
        <Circle key={`b${i}`} cx={b.x} cy={b.y} r={1.3} fill="#FFFFFF" stroke={COLORS.line} strokeWidth={0.7} />
      ))}

      {model.arrows.map((a) => (
        <G key={a.key}>
          {a.attach.map((att, i) => (
            <Line
              key={`at${i}`}
              x1={att[0].x}
              y1={att[0].y}
              x2={att[1].x}
              y2={att[1].y}
              stroke={COLORS.attach}
              strokeWidth={0.6}
              strokeDasharray="1 1.4"
            />
          ))}
          {a.ticks.map((t, i) => (
            <Line key={`tk${i}`} x1={t[0].x} y1={t[0].y} x2={t[1].x} y2={t[1].y} stroke={a.color} strokeWidth={0.7} />
          ))}
          <Line
            x1={a.line[0].x}
            y1={a.line[0].y}
            x2={a.line[1].x}
            y2={a.line[1].y}
            stroke={a.color}
            strokeWidth={a.width}
          />
          {a.heads.map((h, i) => (
            <Polygon key={`hd${i}`} points={h} fill={a.color} />
          ))}
          <Rect
            x={a.pill.x - a.pill.w / 2}
            y={a.pill.y - a.pill.h / 2}
            width={a.pill.w}
            height={a.pill.h}
            rx={a.pill.h / 2}
            fill={a.pill.empty ? "#FFFFFF" : COLORS.accent}
            stroke={a.pill.empty ? COLORS.pillStroke : "#FFFFFF"}
            strokeWidth={a.pill.empty ? 0.8 : 1.2}
            strokeDasharray={a.pill.empty ? "1.6 1.6" : undefined}
          />
          {a.pill.line2 ? (
            <SvgText x={a.pill.x} y={a.pill.y - 0.9} textAnchor="middle" fontSize={3.1} fontWeight={700} fill="#CBD0F5">
              {a.pill.line1}
            </SvgText>
          ) : null}
          <SvgText
            x={a.pill.x}
            y={a.pill.y + (a.pill.line2 ? 3.6 : 1.9)}
            textAnchor="middle"
            fontSize={5.4}
            fontWeight={800}
            fill={a.pill.empty ? COLORS.emptyText : "#FFFFFF"}
          >
            {a.pill.empty ? "?" : (a.pill.line2 ?? a.pill.line1)}
          </SvgText>
        </G>
      ))}
    </>
  );
}

/** Croquis à l'écran — même modèle que l'export, rendu en react-native-svg. */
export default function Sketch({
  garment,
  values,
  unit,
  activeKey = null,
  coupe = 1,
  width = "100%",
  height = "100%",
}: SketchProps) {
  const model = buildSketchModel(garment, values, unit, activeKey, false, coupe);
  return (
    <Svg viewBox={model.viewBox} width={width} height={height} preserveAspectRatio="xMidYMid meet">
      <SketchContent garment={garment} values={values} unit={unit} activeKey={activeKey} coupe={coupe} />
    </Svg>
  );
}
