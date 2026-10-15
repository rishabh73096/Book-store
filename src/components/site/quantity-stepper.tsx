"use client";

import { Minus, Plus } from "lucide-react";

// − / + stepper. `max` is already the smaller of stock and the per-book purchase limit.
export function QuantityStepper({
  value,
  max,
  onChange,
  label,
}: {
  value: number;
  max: number;
  onChange: (next: number) => void;
  label: string;
}) {
  const btn =
    "inline-flex size-11 items-center justify-center border-2 border-ink bg-white transition-colors hover:bg-clay disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white";
  return (
    <div role="group" aria-label={label} className="inline-flex items-stretch">
      <button type="button" className={btn} aria-label="Decrease quantity" disabled={value <= 1} onClick={() => onChange(value - 1)}>
        <Minus className="size-4" />
      </button>
      <output aria-live="polite" className="inline-flex min-w-12 items-center justify-center border-y-2 border-ink bg-paper px-2 font-bold">
        {value}
      </output>
      <button type="button" className={btn} aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus className="size-4" />
      </button>
    </div>
  );
}
