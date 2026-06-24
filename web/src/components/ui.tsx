"use client";

import type { ReactNode, ButtonHTMLAttributes } from "react";
import type { TxState } from "@/hooks/useWriteTx";

/* ------------------------------------------------------------------ Card */

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass-card rounded-2xl gradient-border ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-emerald-500/15 px-5 py-4">
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2
            className="text-sm font-semibold tracking-wide text-emerald-200"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

/* ----------------------------------------------------------------- Badge */

type Tone = "green" | "amber" | "indigo" | "zinc" | "red" | "violet" | "cyan";

const TONES: Record<Tone, string> = {
  green:  "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30 badge-glow-green",
  amber:  "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  indigo: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/25 badge-glow-green",
  zinc:   "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
  red:    "bg-red-500/15 text-red-300 ring-red-500/30",
  violet: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30 badge-glow-green",
  cyan:   "bg-teal-500/15 text-teal-300 ring-teal-500/30 badge-glow-cyan",
};

export function Badge({
  children,
  tone = "zinc",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------- Button */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const styles: Record<string, string> = {
    primary:
      "btn-glow text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
    secondary:
      "bg-emerald-500/8 text-emerald-200 border border-emerald-500/20 hover:bg-emerald-500/15 hover:border-emerald-400/40 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200",
    ghost:
      "bg-transparent text-zinc-400 hover:text-emerald-300 hover:bg-emerald-500/8 transition-all duration-200",
    danger:
      "bg-red-500/15 text-red-300 border border-red-500/25 hover:bg-red-500/25 hover:border-red-400/40 transition-all duration-200 disabled:opacity-40",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm transition-all duration-200 ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ----------------------------------------------------------- Form fields */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-emerald-600/80 uppercase tracking-wide">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-1.5 block text-[11px] text-zinc-600">{hint}</span>
      ) : null}
    </label>
  );
}

const inputBase =
  "input-glow w-full rounded-xl border border-emerald-500/15 bg-black/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none transition-all duration-200";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={`${inputBase} resize-y ${props.className ?? ""}`}
    />
  );
}

/* ---------------------------------------------------------- Tx status UI */

const TX_LABEL: Record<TxState, string> = {
  idle:      "",
  wallet:    "Waiting for wallet…",
  pending:   "Confirming on-chain…",
  confirmed: "✓ Confirmed!",
  failed:    "Transaction failed",
};

const TX_TONE: Record<TxState, Tone> = {
  idle:      "zinc",
  wallet:    "amber",
  pending:   "violet",
  confirmed: "green",
  failed:    "red",
};

export function TxStatus({
  state,
  error,
  hash,
  explorerBase,
}: {
  state: TxState;
  error?: string | null;
  hash?: `0x${string}`;
  explorerBase?: string;
}) {
  if (state === "idle" && !error) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs animate-fade-in-up">
      <Badge tone={TX_TONE[state]}>
        {(state === "wallet" || state === "pending") && <Spinner />}
        {state === "failed" && error ? error : TX_LABEL[state]}
      </Badge>
      {hash && explorerBase ? (
        <a
          href={`${explorerBase}/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
        >
          View tx ↗
        </a>
      ) : null}
    </div>
  );
}

export function Spinner() {
  return (
    <span className="spinner inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent" />
  );
}

export function Notice({
  tone = "zinc",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-xl px-3 py-2.5 text-xs ring-1 ring-inset ${TONES[tone]}`}
    >
      {children}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="stat-neon rounded-xl bg-emerald-500/5 border border-emerald-500/12 px-3 py-2.5 hover:border-emerald-500/25 hover:bg-emerald-500/8 transition-all duration-200">
      <div className="text-[10px] uppercase tracking-widest text-emerald-700 font-medium">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-zinc-100 break-words">
        {value}
      </div>
    </div>
  );
}
