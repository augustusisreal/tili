/** Yhteiset Tailwind-luokat Linear/Stripe-tyylille. */

export const panel =
  "rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]";

export const inputCls =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] placeholder:text-[var(--muted)]";

export const labelCls = "mb-1.5 block text-xs font-medium text-[var(--muted)]";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50";

/** Iso CTA (esim. PDF-lataus). */
export const btnCta =
  "inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white shadow-[var(--shadow-sm)] transition hover:brightness-110 disabled:opacity-50 sm:w-auto";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--surface-hover)] disabled:opacity-50";

export const btnSoft =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent-soft)] px-3 py-2 text-sm font-medium text-[var(--accent)] transition hover:brightness-105";

export const sectionTitle = "text-lg font-semibold tracking-tight text-[var(--fg)]";

export const sectionDesc = "mt-1 text-sm text-[var(--muted)]";

export const cardRow =
  "rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4";
