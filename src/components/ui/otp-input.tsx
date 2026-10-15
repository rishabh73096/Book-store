"use client";

import { useRef, useState, useCallback, ClipboardEvent, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  hasError?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  hasError = false,
  autoFocus = false,
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [focused, setFocused] = useState<number | null>(autoFocus ? 0 : null);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focusAt = useCallback((index: number) => {
    const el = inputsRef.current[Math.max(0, Math.min(index, length - 1))];
    el?.focus();
  }, [length]);

  function handleChange(index: number, char: string) {
    const digit = char.replace(/\D/g, "").slice(-1);
    if (!digit) return;

    const next = value.split("");
    next[index] = digit;
    // Fill gaps with empty strings
    const padded = Array.from({ length }, (_, i) => next[i] ?? "");
    onChange(padded.join(""));

    if (index < length - 1) focusAt(index + 1);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        // Clear current box
        const next = value.split("");
        next[index] = "";
        onChange(Array.from({ length }, (_, i) => next[i] ?? "").join(""));
      } else if (index > 0) {
        // Move back and clear
        const next = value.split("");
        next[index - 1] = "";
        onChange(Array.from({ length }, (_, i) => next[i] ?? "").join(""));
        focusAt(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(index + 1);
    } else if (e.key === "Delete") {
      e.preventDefault();
      const next = value.split("");
      next[index] = "";
      onChange(Array.from({ length }, (_, i) => next[i] ?? "").join(""));
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const padded = Array.from({ length }, (_, i) => pasted[i] ?? "");
    onChange(padded.join(""));
    // Focus the last filled box or last box
    focusAt(Math.min(pasted.length, length - 1));
  }

  return (
    <div className="flex gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1} of ${length}`}
          onFocus={() => setFocused(i)}
          onBlur={() => setFocused(null)}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onClick={() => focusAt(i)}
          className={cn(
            // Base
            "h-12 w-full min-w-0 rounded-none border-0 border-b-2 bg-transparent",
            "text-center text-xl font-semibold tracking-widest",
            "transition-all duration-150 outline-none",
            "caret-transparent select-none",
            // Default border
            "border-foreground/20",
            // Filled
            digits[i] && "border-foreground/60",
            // Focused
            focused === i && !hasError && "border-foreground",
            // Error
            hasError && "border-destructive",
            // Disabled
            disabled && "opacity-40 cursor-not-allowed",
          )}
        />
      ))}
    </div>
  );
}
