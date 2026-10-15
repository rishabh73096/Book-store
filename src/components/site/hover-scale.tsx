import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export function HoverScale({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "transition-transform duration-200 ease-out hover:scale-[1.04] active:scale-[0.96]",
        className
      )}
      {...props}
    />
  );
}
