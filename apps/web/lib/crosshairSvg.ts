import { colorToHex, DEFAULT_PREVIEW_BACKGROUND, parseCrosshairCode, type LineState } from "@/lib/parseCrosshairCode";

// CrosshairPreview.tsx(ブラウザ向けのJSX版)と全く同じ計算式を、
// サーバー側(画像生成用)でも使えるようプレーンなSVG文字列組み立てに移植したもの。
// ロジックを変更する場合は両方に反映すること。
const SIZE = 128;
const CENTER = SIZE / 2;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function perpendicularOffset(thickness: number): number {
  return Math.floor(CENTER - thickness / 2);
}

function armRects(gap: number, hLength: number, vLength: number, thickness: number): Rect[] {
  const perp = perpendicularOffset(thickness);
  const g = thickness % 2;
  return [
    { x: CENTER - gap - hLength - g, y: perp, width: hLength, height: thickness },
    { x: CENTER + gap, y: perp, width: hLength, height: thickness },
    { x: perp, y: CENTER - gap - vLength - g, width: thickness, height: vLength },
    { x: perp, y: CENTER + gap, width: thickness, height: vLength },
  ];
}

function expandRect(r: Rect, extraPx: number): Rect {
  return { x: r.x - extraPx, y: r.y - extraPx, width: r.width + extraPx * 2, height: r.height + extraPx * 2 };
}

function rectTag(r: Rect, fill: string, opacity: number): string {
  if (r.width <= 0 || r.height <= 0) return "";
  return `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="${fill}" opacity="${opacity}" />`;
}

function renderLineGroup(
  line: LineState,
  color: string,
  outline: { enabled: boolean; opacity: number; extraPx: number }
): string {
  if (!line.enabled) return "";

  const hLength = Math.max(0, line.length);
  const vLength = Math.max(0, line.verticalLength);
  const thickness = Math.max(0, line.thickness);
  const gap = Math.max(0, line.gap);
  const rects = armRects(gap, hLength, vLength, thickness);

  const outlineSvg = outline.enabled
    ? rects.map((r) => rectTag(expandRect(r, outline.extraPx), "#000000", outline.opacity)).join("")
    : "";
  const lineSvg = rects.map((r) => rectTag(r, color, line.opacity)).join("");
  return outlineSvg + lineSvg;
}

export function buildCrosshairSvg(code: string, options?: { zoom?: number; background?: string }): string {
  const zoom = options?.zoom ?? 2.2;
  const background = options?.background ?? DEFAULT_PREVIEW_BACKGROUND;
  const state = parseCrosshairCode(code);
  const color = colorToHex(state.color);
  const outline = {
    enabled: state.outlinesEnabled,
    opacity: state.outlineOpacity,
    extraPx: Math.max(0, state.outlineThickness),
  };

  const dotSide = Math.max(0, state.dotThickness);
  const dotOffset = CENTER - Math.ceil(dotSide / 2);
  const dotRect: Rect = { x: dotOffset, y: dotOffset, width: dotSide, height: dotSide };

  const noArms = !state.inner.enabled && !state.outer.enabled;
  const fallbackDot = noArms && !state.dotEnabled ? rectTag({ x: CENTER - 3, y: CENTER - 3, width: 6, height: 6 }, color, 1) : "";

  const dotSvg = state.dotEnabled
    ? (outline.enabled ? rectTag(expandRect(dotRect, outline.extraPx), "#000000", outline.opacity) : "") +
      rectTag(dotRect, color, state.dotOpacity)
    : "";

  const corners = `
    <path d="M10 26 V10 H26" fill="none" stroke="#2a3a45" stroke-width="2" />
    <path d="M102 10 H118 V26" fill="none" stroke="#2a3a45" stroke-width="2" />
    <path d="M118 102 V118 H102" fill="none" stroke="#2a3a45" stroke-width="2" />
    <path d="M26 118 H10 V102" fill="none" stroke="#2a3a45" stroke-width="2" />
  `;

  // vcrdb.netの描画順(inner→dot→outer、後勝ち)に合わせる。CrosshairPreview.tsxと揃えること。
  const body =
    renderLineGroup(state.inner, color, outline) + dotSvg + renderLineGroup(state.outer, color, outline) + fallbackDot;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
    <rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="${background}" />
    ${corners}
    <g transform="translate(${CENTER} ${CENTER}) scale(${zoom}) translate(${-CENTER} ${-CENTER})">
      ${body}
    </g>
  </svg>`;
}
