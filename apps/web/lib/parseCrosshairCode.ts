// VALORANTのクロスヘアコードのパース/組み立て。
//
// パラメータ仕様は vcrdb.net のクロスヘアビルダー(https://vcrdb.net/builder)のDOM構造
// (各コントロールの data-binding 属性、例: data-binding="P:0l" = Inner Line Length)を
// 直接確認して割り出したもの。公式ドキュメントは存在しないが、実際に動作しているビルダー
// ツールの内部バインディングそのものなので信頼度は高い。
//
// 例: "0;P;c;6;h;0;d;1;z;1;0t;4;0l;1;0o;2;0a;1;1t;10;1l;1;1o;5;1a;1"
//
// トップレベル(プレフィックスなし): 全体設定
//   c = 色番号(0-8)  h = アウトライン表示  o = アウトライン不透明度  t = アウトライン太さ
//   d = 中央ドット表示  a = 中央ドット不透明度  z = 中央ドット太さ
// "0" プレフィックス: 内側の線
//   0b = 表示  0a = 不透明度  0l = 水平方向の長さ(0-20)  0v = 垂直方向の長さ(未指定時は0lと同じ)
//   0t = 太さ(0-10)  0o = 隙間(0-20)
// "1" プレフィックス: 外側の線 (0系と同じ構造、値域のみ異なる)
//   1b = 表示  1a = 不透明度  1l = 水平方向の長さ(0-10)  1v = 垂直方向の長さ
//   1t = 太さ(0-10)  1o = 隙間(0-40)
//
// 水平/垂直の長さは、ビルダーの"Link sliders"ボタンで連動を解除すると別々の値になる
// (連動時は0l/1lのみ、解除すると0v/1vも別途出力される)。
//
// Movement/Firing Error系のパラメータ(m, 0m/0s, 0f/0e, 1m/1s, 1f/1e)は、動いている時だけ
// 変化する動的な広がりを表すもので静止画のプレビューには影響しないため、このアプリでは扱わない。

export const COLOR_OPTIONS = [
  { value: "0", label: "White", hex: "#FFFFFF" },
  { value: "1", label: "Green", hex: "#00FF00" },
  { value: "2", label: "Yellow Green", hex: "#7FFF00" },
  { value: "3", label: "Green Yellow", hex: "#DFFF00" },
  { value: "4", label: "Yellow", hex: "#FFFF00" },
  { value: "5", label: "Cyan", hex: "#00FFFF" },
  { value: "6", label: "Pink", hex: "#FF00FF" },
  { value: "7", label: "Red", hex: "#FF0000" },
  { value: "8", label: "Custom", hex: "#FFFFFF" },
] as const;

const COLOR_HEX: Record<string, string> = Object.fromEntries(COLOR_OPTIONS.map((c) => [c.value, c.hex]));

// vcrdb.netはプレビュー背景に実際のマップテクスチャ(コンクリート等の中間トーン)を使っており、
// 黒アウトラインが常にはっきり見える。サイトのパネル色(#0f151c)をそのまま背景に使うと
// 黒アウトラインがほぼ同化して見えなくなってしまうため、コンクリート相当の中間グレーを
// プレビューのデフォルト背景として使う。
export const DEFAULT_PREVIEW_BACKGROUND = "#8a8a86";

export interface RangeSpec {
  min: number;
  max: number;
  step: number;
}

export const LINE_RANGES: Record<"inner" | "outer", { length: RangeSpec; thickness: RangeSpec; gap: RangeSpec; opacity: RangeSpec }> = {
  inner: {
    length: { min: 0, max: 20, step: 1 },
    thickness: { min: 0, max: 10, step: 1 },
    gap: { min: 0, max: 20, step: 1 },
    opacity: { min: 0, max: 1, step: 0.001 },
  },
  outer: {
    length: { min: 0, max: 10, step: 1 },
    thickness: { min: 0, max: 10, step: 1 },
    gap: { min: 0, max: 40, step: 1 },
    opacity: { min: 0, max: 1, step: 0.001 },
  },
};

export const DOT_RANGE = {
  thickness: { min: 1, max: 6, step: 1 } as RangeSpec,
  opacity: { min: 0, max: 1, step: 0.001 } as RangeSpec,
};

export const OUTLINE_RANGE = {
  thickness: { min: 1, max: 6, step: 1 } as RangeSpec,
  opacity: { min: 0, max: 1, step: 0.001 } as RangeSpec,
};

export interface LineState {
  enabled: boolean;
  opacity: number;
  length: number;
  verticalLength: number;
  thickness: number;
  gap: number;
}

export interface CrosshairState {
  color: string;
  outlinesEnabled: boolean;
  outlineOpacity: number;
  outlineThickness: number;
  dotEnabled: boolean;
  dotOpacity: number;
  dotThickness: number;
  inner: LineState;
  outer: LineState;
}

export const DEFAULT_CROSSHAIR_STATE: CrosshairState = {
  color: "0",
  outlinesEnabled: true,
  outlineOpacity: 0.5,
  outlineThickness: 1,
  dotEnabled: false,
  dotOpacity: 1,
  dotThickness: 2,
  inner: { enabled: true, opacity: 0.8, length: 6, verticalLength: 6, thickness: 2, gap: 3 },
  outer: { enabled: true, opacity: 0.35, length: 2, verticalLength: 2, thickness: 2, gap: 10 },
};

export function colorToHex(color: string): string {
  return COLOR_HEX[color] ?? COLOR_HEX["1"];
}

function toNumber(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clampOpacity(n: number): number {
  return Math.min(1, Math.max(0, n));
}

// vcrdb.netのパーサーも範囲外の値をここと同じmin/maxにクランプしてから描画している
// (手入力・古い形式のコードなどで規定範囲外の値が来た場合の見た目崩れを防ぐため)。
function clampRange(n: number, range: RangeSpec): number {
  return Math.min(range.max, Math.max(range.min, n));
}

export function parseCrosshairCode(code: string): CrosshairState {
  const tokens = code.split(";");
  const params: Record<string, string> = {};

  // 先頭の "0"(バージョン) "P"(プロファイル種別。ADS/Sniperは "A"/"S")を飛ばし、
  // 残りをkey/valueペアとして読む。
  for (let i = 2; i < tokens.length - 1; i += 2) {
    params[tokens[i]] = tokens[i + 1];
  }

  function readLine(prefix: "0" | "1", d: LineState, range: (typeof LINE_RANGES)["inner"]): LineState {
    const length = clampRange(toNumber(params[`${prefix}l`], d.length), range.length);
    return {
      // 表示トグル(b)のデフォルトはON。明示的に"0"が指定された時だけ非表示。
      enabled: params[`${prefix}b`] !== "0",
      opacity: clampOpacity(toNumber(params[`${prefix}a`], d.opacity)),
      length,
      // 垂直方向の長さ(v)が未指定の場合は水平方向と同じ値(連動している状態)とみなす。
      // vcrdb.net側は垂直方向のみ内側・外側とも上限20(水平方向の上限とは別)。
      verticalLength: clampRange(toNumber(params[`${prefix}v`], length), { min: 0, max: 20, step: 1 }),
      thickness: clampRange(toNumber(params[`${prefix}t`], d.thickness), range.thickness),
      gap: clampRange(toNumber(params[`${prefix}o`], d.gap), range.gap),
    };
  }

  return {
    color: params.c ?? DEFAULT_CROSSHAIR_STATE.color,
    outlinesEnabled: params.h !== "0",
    outlineOpacity: clampOpacity(toNumber(params.o, DEFAULT_CROSSHAIR_STATE.outlineOpacity)),
    outlineThickness: clampRange(
      toNumber(params.t, DEFAULT_CROSSHAIR_STATE.outlineThickness),
      OUTLINE_RANGE.thickness
    ),
    dotEnabled: params.d === "1",
    dotOpacity: clampOpacity(toNumber(params.a, DEFAULT_CROSSHAIR_STATE.dotOpacity)),
    dotThickness: clampRange(toNumber(params.z, DEFAULT_CROSSHAIR_STATE.dotThickness), DOT_RANGE.thickness),
    inner: readLine("0", DEFAULT_CROSSHAIR_STATE.inner, LINE_RANGES.inner),
    outer: readLine("1", DEFAULT_CROSSHAIR_STATE.outer, LINE_RANGES.outer),
  };
}

export function serializeCrosshairState(state: CrosshairState): string {
  const parts: (string | number)[] = ["0", "P", "c", state.color];

  parts.push("h", state.outlinesEnabled ? 1 : 0);
  if (state.outlinesEnabled) {
    parts.push("o", state.outlineOpacity, "t", state.outlineThickness);
  }

  parts.push("d", state.dotEnabled ? 1 : 0);
  if (state.dotEnabled) {
    parts.push("a", state.dotOpacity, "z", state.dotThickness);
  }

  parts.push("0b", state.inner.enabled ? 1 : 0);
  if (state.inner.enabled) {
    parts.push(
      "0l",
      state.inner.length,
      "0v",
      state.inner.verticalLength,
      "0t",
      state.inner.thickness,
      "0o",
      state.inner.gap,
      "0a",
      state.inner.opacity
    );
  }

  parts.push("1b", state.outer.enabled ? 1 : 0);
  if (state.outer.enabled) {
    parts.push(
      "1l",
      state.outer.length,
      "1v",
      state.outer.verticalLength,
      "1t",
      state.outer.thickness,
      "1o",
      state.outer.gap,
      "1a",
      state.outer.opacity
    );
  }

  return parts.join(";");
}
