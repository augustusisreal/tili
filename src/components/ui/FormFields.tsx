"use client";

import { inputCls, labelCls } from "@/lib/ui-classes";

type FieldProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
};

export function Field({ label, hint, children, className = "" }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className={labelCls}>{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-[var(--muted)]">{hint}</span> : null}
    </label>
  );
}

type TextInputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
};

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
}: TextInputProps) {
  return (
    <input
      type={type}
      className={inputCls}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

type MoneyInputProps = {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
};

export function MoneyInput({ value, onChange, disabled }: MoneyInputProps) {
  return (
    <div className="relative">
      <input
        type="number"
        step="0.01"
        className={`${inputCls} pr-8`}
        value={Number.isFinite(value) ? value : 0}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]">
        €
      </span>
    </div>
  );
}

type YesNoProps = {
  value: boolean | null;
  onChange: (v: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
};

export function YesNo({
  value,
  onChange,
  yesLabel = "Kyllä",
  noLabel = "Ei",
}: YesNoProps) {
  return (
    <div className="flex gap-2">
      {[
        { v: true, label: yesLabel },
        { v: false, label: noLabel },
      ].map((opt) => {
        const active = value === opt.v;
        return (
          <button
            key={String(opt.v)}
            type="button"
            onClick={() => onChange(opt.v)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              active
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

type CheckboxProps = {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
};

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--fg)]">
      <input
        type="checkbox"
        className="size-4 rounded border-[var(--border)] accent-[var(--accent)]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
