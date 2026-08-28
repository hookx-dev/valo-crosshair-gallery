"use client";

export function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-display text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`clip-corner-sm px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-wide transition-colors ${
            value ? "bg-valo-red text-white" : "border border-valo-line bg-valo-panel text-gray-500"
          }`}
        >
          On
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`clip-corner-sm px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-wide transition-colors ${
            !value ? "bg-valo-red text-white" : "border border-valo-line bg-valo-panel text-gray-500"
          }`}
        >
          Off
        </button>
      </div>
    </div>
  );
}
