"use client";

import { useId } from "react";

function Star({ fill }: { fill: number }) {
  const id = useId();
  const amount = Math.max(0, Math.min(1, fill));
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
      <defs>
        <linearGradient id={id}>
          <stop offset={`${amount * 100}%`} stopColor="#a24e2d" />
          <stop offset={`${amount * 100}%`} stopColor="#ddd4c6" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M10 1.7 12.35 7.1l5.85.48-4.45 3.74 1.38 5.68L10 13.9l-5.13 3.1 1.38-5.68L1.8 7.58l5.85-.48L10 1.7Z"
      />
    </svg>
  );
}

export function Stars({ value, count }: { value: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm" aria-label={`Rating ${value.toFixed(1)} out of 5`}>
      <span className="inline-flex">
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={index} fill={value - index} />
        ))}
      </span>
      <span className="text-muted">
        {value.toFixed(1)}
        {count != null ? ` (${count})` : ""}
      </span>
    </span>
  );
}
