"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  COLOR_OPTIONS,
  DEFAULT_CROSSHAIR_STATE,
  DOT_RANGE,
  LINE_RANGES,
  OUTLINE_RANGE,
  parseCrosshairCode,
  serializeCrosshairState,
  type CrosshairState,
  type LineState,
} from "@/lib/parseCrosshairCode";
import { CrosshairPreview } from "@/components/CrosshairPreview";
import { SliderField } from "@/components/builder/SliderField";
import { ToggleField } from "@/components/builder/ToggleField";

function LineSection({
  title,
  thicknessLabel,
  range,
  line,
  onChange,
}: {
  title: string;
  thicknessLabel: string;
  range: (typeof LINE_RANGES)["inner"];
  line: LineState;
  onChange: (line: LineState) => void;
}) {
  return (
    <div className="clip-corner flex flex-col gap-4 border border-valo-line bg-valo-panel p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white">{title}</h3>
        <ToggleField
          label={`${title}を表示`}
          value={line.enabled}
          onChange={(enabled) => onChange({ ...line, enabled })}
        />
      </div>
      {line.enabled && (
        <div className="flex flex-col gap-3">
          <SliderField
            label={`${title}の不透明度`}
            value={line.opacity}
            min={range.opacity.min}
            max={range.opacity.max}
            step={range.opacity.step}
            onChange={(opacity) => onChange({ ...line, opacity })}
          />
          <SliderField
            label={`${title}の長さ`}
            value={line.length}
            min={range.length.min}
            max={range.length.max}
            step={range.length.step}
            onChange={(length) => onChange({ ...line, length, verticalLength: length })}
          />
          <SliderField
            label={`${title}の${thicknessLabel}`}
            value={line.thickness}
            min={range.thickness.min}
            max={range.thickness.max}
            step={range.thickness.step}
            onChange={(thickness) => onChange({ ...line, thickness })}
          />
          <SliderField
            label={`${title}オフセット`}
            value={line.gap}
            min={range.gap.min}
            max={range.gap.max}
            step={range.gap.step}
            onChange={(gap) => onChange({ ...line, gap })}
          />
        </div>
      )}
    </div>
  );
}

function randomInRange(min: number, max: number, step: number): number {
  const steps = Math.round((max - min) / step);
  const n = min + Math.floor(Math.random() * (steps + 1)) * step;
  return Math.round(n * 1000) / 1000;
}

function randomLine(range: (typeof LINE_RANGES)["inner"]): LineState {
  const length = randomInRange(range.length.min, range.length.max, range.length.step);
  return {
    enabled: Math.random() > 0.3,
    length,
    verticalLength: length,
    thickness: randomInRange(range.thickness.min, Math.min(range.thickness.max, 6), range.thickness.step),
    gap: randomInRange(range.gap.min, Math.min(range.gap.max, range.gap.max / 2), range.gap.step),
    opacity: 1,
  };
}

function randomizeState(): CrosshairState {
  return {
    color: String(Math.floor(Math.random() * 8)),
    customHex: DEFAULT_CROSSHAIR_STATE.customHex,
    outlinesEnabled: true,
    outlineOpacity: DEFAULT_CROSSHAIR_STATE.outlineOpacity,
    outlineThickness: DEFAULT_CROSSHAIR_STATE.outlineThickness,
    dotEnabled: Math.random() > 0.5,
    dotOpacity: 1,
    dotThickness: randomInRange(DOT_RANGE.thickness.min, DOT_RANGE.thickness.max, DOT_RANGE.thickness.step),
    inner: randomLine(LINE_RANGES.inner),
    outer: randomLine(LINE_RANGES.outer),
  };
}

export default function BuilderPage() {
  return (
    <Suspense fallback={null}>
      <Builder />
    </Suspense>
  );
}

function Builder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code");
  const [state, setState] = useState<CrosshairState>(
    initialCode ? parseCrosshairCode(initialCode) : DEFAULT_CROSSHAIR_STATE
  );
  const [pasteValue, setPasteValue] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const code = serializeCrosshairState(state);
  const isDirty = JSON.stringify(state) !== JSON.stringify(DEFAULT_CROSSHAIR_STATE);

  function handleCancelClick() {
    if (isDirty) {
      setShowCancelConfirm(true);
    } else {
      router.back();
    }
  }

  function confirmCancel() {
    setShowCancelConfirm(false);
    router.back();
  }

  function handleLoadCode() {
    if (!pasteValue.trim().startsWith("0;")) {
      setPasteError("VALORANTのクロスヘアコードの形式（0;から始まる文字列）で入力してください。");
      return;
    }
    setState(parseCrosshairCode(pasteValue.trim()));
    setPasteError(null);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // クリップボードAPIが使えない環境では何もしない
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="font-display text-xs font-semibold tracking-[0.3em] text-valo-red">BUILDER</p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={handleCancelClick}
          aria-label="キャンセルして戻る"
          className="clip-corner-sm flex h-9 w-9 shrink-0 items-center justify-center border border-valo-line bg-valo-panel2 text-lg text-gray-400 transition-colors hover:text-white"
        >
          ←
        </button>
        <h1 className="font-display text-3xl font-bold text-white">クロスヘアビルダー</h1>
      </div>
      <p className="mt-2 max-w-xl text-sm text-gray-400">
        スライダーで調整しながら、その場でプレビューを確認できます。完成したらコードをコピーするか、そのまま投稿できます。
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {/* --- Controls --- */}
        <div className="flex flex-col gap-4">
          <div className="clip-corner flex flex-col gap-4 border border-valo-line bg-valo-panel p-5">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white">クロスヘア</h3>
            <label className="flex flex-col gap-1.5">
              <span className="font-display text-xs font-semibold uppercase tracking-wide text-gray-400">
                クロスヘアの色
              </span>
              <select
                value={state.color}
                onChange={(e) => setState({ ...state, color: e.target.value })}
                className="clip-corner-sm border border-valo-line bg-valo-panel2 px-3 py-2 text-sm text-white"
              >
                {COLOR_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <ToggleField
              label="輪郭"
              value={state.outlinesEnabled}
              onChange={(outlinesEnabled) => setState({ ...state, outlinesEnabled })}
            />
            {state.outlinesEnabled && (
              <>
                <SliderField
                  label="輪郭の不透明度"
                  value={state.outlineOpacity}
                  min={OUTLINE_RANGE.opacity.min}
                  max={OUTLINE_RANGE.opacity.max}
                  step={OUTLINE_RANGE.opacity.step}
                  onChange={(outlineOpacity) => setState({ ...state, outlineOpacity })}
                />
                <SliderField
                  label="輪郭の厚さ"
                  value={state.outlineThickness}
                  min={OUTLINE_RANGE.thickness.min}
                  max={OUTLINE_RANGE.thickness.max}
                  step={OUTLINE_RANGE.thickness.step}
                  onChange={(outlineThickness) => setState({ ...state, outlineThickness })}
                />
              </>
            )}
          </div>

          <div className="clip-corner flex flex-col gap-4 border border-valo-line bg-valo-panel p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white">センタードット</h3>
              <ToggleField
                label="センタードットを表示"
                value={state.dotEnabled}
                onChange={(dotEnabled) => setState({ ...state, dotEnabled })}
              />
            </div>
            {state.dotEnabled && (
              <div className="flex flex-col gap-3">
                <SliderField
                  label="センタードットの不透明度"
                  value={state.dotOpacity}
                  min={DOT_RANGE.opacity.min}
                  max={DOT_RANGE.opacity.max}
                  step={DOT_RANGE.opacity.step}
                  onChange={(dotOpacity) => setState({ ...state, dotOpacity })}
                />
                <SliderField
                  label="センタードットのサイズ"
                  value={state.dotThickness}
                  min={DOT_RANGE.thickness.min}
                  max={DOT_RANGE.thickness.max}
                  step={DOT_RANGE.thickness.step}
                  onChange={(dotThickness) => setState({ ...state, dotThickness })}
                />
              </div>
            )}
          </div>

          <LineSection
            title="インナーライン"
            thicknessLabel="太さ"
            range={LINE_RANGES.inner}
            line={state.inner}
            onChange={(inner) => setState({ ...state, inner })}
          />
          <LineSection
            title="アウターライン"
            thicknessLabel="厚さ"
            range={LINE_RANGES.outer}
            line={state.outer}
            onChange={(outer) => setState({ ...state, outer })}
          />
        </div>

        {/* --- Preview + code --- */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <div className="clip-corner flex flex-col items-center gap-4 border border-valo-line bg-valo-panel p-6">
            <CrosshairPreview code={code} className="h-44 w-44 shrink-0" />
          </div>

          <div className="clip-corner flex flex-col gap-3 border border-valo-line bg-valo-panel p-5">
            <p className="font-display text-xs font-semibold uppercase tracking-widest text-gray-500">Import Code</p>
            <code className="clip-corner-sm break-all border border-valo-line bg-valo-panel2 px-3 py-2 font-mono text-xs text-gray-300">
              {code}
            </code>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopy}
                className="clip-corner-sm bg-valo-red px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-red-500"
              >
                {copied ? "コピーしました" : "コードをコピー"}
              </button>
              <button
                onClick={() => setState(randomizeState())}
                className="clip-corner-sm border border-valo-line bg-valo-panel2 px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-gray-300 transition-colors hover:text-white"
              >
                ランダム生成
              </button>
              <button
                onClick={() => router.push(`/submit?code=${encodeURIComponent(code)}`)}
                className="clip-corner-sm border border-valo-red bg-valo-panel2 px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-valo-red transition-colors hover:bg-valo-red hover:text-white"
              >
                この設定で投稿する →
              </button>
              <button
                onClick={handleCancelClick}
                className="clip-corner-sm border border-valo-line bg-valo-panel2 px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-gray-400 transition-colors hover:text-white"
              >
                キャンセル
              </button>
            </div>
          </div>

          <div className="clip-corner flex flex-col gap-3 border border-valo-line bg-valo-panel p-5">
            <p className="font-display text-xs font-semibold uppercase tracking-widest text-gray-500">
              既存のコードを読み込む
            </p>
            <input
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
              placeholder="0;P;c;1;h;0;..."
              className="clip-corner-sm border border-valo-line bg-valo-panel2 px-3 py-2 font-mono text-xs text-white placeholder:text-gray-600"
            />
            {pasteError && <p className="text-xs text-valo-red">{pasteError}</p>}
            <button
              onClick={handleLoadCode}
              className="clip-corner-sm w-fit border border-valo-line bg-valo-panel2 px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-gray-300 transition-colors hover:text-white"
            >
              読み込む
            </button>
          </div>
        </div>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="clip-corner w-full max-w-sm border border-valo-line bg-valo-panel p-6">
            <h2 className="font-display text-lg font-semibold text-white">変更を破棄しますか？</h2>
            <p className="mt-2 text-sm text-gray-400">
              編集中の内容は保存されていません。キャンセルすると前のページに戻ります。
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="clip-corner-sm border border-valo-line bg-valo-panel2 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-gray-300 transition-colors hover:text-white"
              >
                編集に戻る
              </button>
              <button
                onClick={confirmCancel}
                className="clip-corner-sm bg-valo-red px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-red-500"
              >
                破棄する
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
