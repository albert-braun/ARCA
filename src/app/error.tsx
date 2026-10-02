"use client";

import { Button } from "@/components/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-5xl">This page could not open</h1>
      <p className="mt-3 text-sm text-muted">Try again. The catalog can still open if the external API does not answer.</p>
      <Button className="mt-8" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
