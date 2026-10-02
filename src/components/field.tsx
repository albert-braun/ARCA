import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export const fieldClass =
  "w-full rounded-xl border border-line bg-card px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-forest aria-[invalid=true]:border-danger";

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium">{label}</span>
      {children}
      {hint && !error ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
      {error ? <span className="mt-1 block text-sm text-danger">{error}</span> : null}
    </label>
  );
}

export function TextInput({ error, ...props }: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return <input aria-invalid={error ? true : undefined} className={fieldClass} {...props} />;
}

export function TextArea({ error, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return <textarea aria-invalid={error ? true : undefined} className={fieldClass} {...props} />;
}
