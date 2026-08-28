"use client";

export function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="font-display text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
        <span className="font-mono text-xs text-gray-500">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none bg-valo-line accent-valo-red"
      />
    </label>
  );
}
