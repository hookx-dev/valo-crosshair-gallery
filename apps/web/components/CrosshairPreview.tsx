import { colorToHex, parseCrosshairCode, type LineState } from "@/lib/parseCrosshairCode";

// vcrdb.net(https://vcrdb.net)のクロスヘアビルダーが実際に使っている描画関数
// (公開JSバンドル内の`renderCrosshair`)を解析し、その計算式をそのまま移植している。
// 長さ・太さ・隙間の値はスケーリングせずピクセル数としてそのまま使う。
// 基準キャンバスサイズも同じ128x128に合わせてある(値の意味を変えずに済むため)。
const SIZE = 128;
const CENTER = SIZE / 2;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 中心を挟んで太さを均等に割れない(太さが奇数の)場合、片側に1pxだけ寄る。
// これは意図的な仕様で、VALORANT/vcrdb.netの実際の描画もこの通りに丸めている。
function perpendicularOffset(thickness: number): number {
  return Math.floor(CENTER - thickness / 2);
}

// 内向き(中心に近い側)のアームは、太さが奇数のとき追加で1px分だけ余分にずれる。
// vcrdb.netのソースコードに実際にあった補正で、理由までは公開されていないが、
// 実機の見た目に合わせるためそのまま踏襲している。
function armRects(gap: number, hLength: number, vLength: number, thickness: number): Rect[] {
  const perp = perpendicularOffset(thickness);
  const g = thickness % 2;
  return [
    { x: CENTER - gap - hLength - g, y: perp, width: hLength, height: thickness }, // left
    { x: CENTER + gap, y: perp, width: hLength, height: thickness }, // right
    { x: perp, y: CENTER - gap - vLength - g, width: thickness, height: vLength }, // top
    { x: perp, y: CENTER + gap, width: thickness, height: vLength }, // bottom
  ];
}

function expandRect(r: Rect, extraPx: number): Rect {
  return { x: r.x - extraPx, y: r.y - extraPx, width: r.width + extraPx * 2, height: r.height + extraPx * 2 };
}

function renderLineGroup(
  line: LineState,
  color: string,
  outline: { enabled: boolean; opacity: number; extraPx: number },
  key: string
) {
  if (!line.enabled) return null;

  const hLength = Math.max(0, line.length);
  const vLength = Math.max(0, line.verticalLength);
  const thickness = Math.max(0, line.thickness);
  const gap = Math.max(0, line.gap);
  const rects = armRects(gap, hLength, vLength, thickness);

  return (
    <g key={key}>
      {outline.enabled && (
        <g fill="#000000" opacity={outline.opacity}>
          {rects.map(
            (r, i) => r.width !== 0 && r.height !== 0 && <rect key={i} {...expandRect(r, outline.extraPx)} />
          )}
        </g>
      )}
      <g fill={color} opacity={line.opacity}>
        {rects.map((r, i) => (
          <rect key={i} {...r} />
        ))}
      </g>
    </g>
  );
}

// クロスヘアコードを実際にパースして描画するプレビュー。
// HUDのスコープ枠っぽいコーナーブラケットを添えて単なる四角+線に見えないようにしている。
// background: マップの壁面色などを想定した背景色。省略時はサイトのパネル色。
export function CrosshairPreview({
  code,
  background,
  className = "h-20 w-20 shrink-0",
  zoom = 1,
  label = "クロスヘアのプレビュー",
}: {
  code: string;
  background?: string;
  className?: string;
  // 1より大きい値でキャンバス中心をズームインし、枠のサイズは変えずにクロスヘア本体だけを大きく見せる。
  zoom?: number;
  // スクリーンリーダー向けの説明。クロスヘア名がわかる場合は呼び出し側から渡す。
  label?: string;
}) {
  const state = parseCrosshairCode(code);
  const color = colorToHex(state.color);
  const outline = {
    enabled: state.outlinesEnabled,
    opacity: state.outlineOpacity,
    extraPx: Math.max(0, state.outlineThickness),
  };
  // VALORANTの中央ドットは丸ではなく正方形。
  const dotSide = Math.max(0, state.dotThickness);
  const dotOffset = CENTER - Math.ceil(dotSide / 2);
  const dotRect: Rect = { x: dotOffset, y: dotOffset, width: dotSide, height: dotSide };

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      style={{ backgroundColor: background ?? "#0f151c" }}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
    >
      <path d="M10 26 V10 H26" fill="none" stroke="#2a3a45" strokeWidth="2" />
      <path d="M102 10 H118 V26" fill="none" stroke="#2a3a45" strokeWidth="2" />
      <path d="M118 102 V118 H102" fill="none" stroke="#2a3a45" strokeWidth="2" />
      <path d="M26 118 H10 V102" fill="none" stroke="#2a3a45" strokeWidth="2" />

      {/* zoomは四隅のコーナーブラケットには適用せず、クロスヘア本体だけを中心基準で拡大する */}
      <g transform={`translate(${CENTER} ${CENTER}) scale(${zoom}) translate(${-CENTER} ${-CENTER})`}>
        {renderLineGroup(state.outer, color, outline, "outer")}
        {renderLineGroup(state.inner, color, outline, "inner")}

        {state.dotEnabled && (
          <>
            {outline.enabled && <rect {...expandRect(dotRect, outline.extraPx)} fill="#000000" opacity={outline.opacity} />}
            <rect {...dotRect} fill={color} opacity={state.dotOpacity} />
          </>
        )}

        {!state.inner.enabled && !state.outer.enabled && !state.dotEnabled && (
          <rect x={CENTER - 3} y={CENTER - 3} width={6} height={6} fill={color} />
        )}
      </g>
    </svg>
  );
}
