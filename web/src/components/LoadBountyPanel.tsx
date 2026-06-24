"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody, Field, Input, Button } from "@/components/ui";

export function LoadBountyPanel({
  selectedId,
  onSelect,
  recentIds,
}: {
  selectedId: bigint | null;
  onSelect: (id: bigint | null) => void;
  recentIds: string[];
}) {
  const [override, setOverride] = useState<string | null>(null);
  const value =
    override ?? (selectedId !== null ? selectedId.toString() : "");

  function load(raw: string) {
    const trimmed = raw.trim();
    if (trimmed === "") {
      onSelect(null);
      return;
    }
    try {
      const id = BigInt(trimmed);
      if (id < 0n) return;
      onSelect(id);
    } catch {
      /* not a number — ignore */
    }
  }

  return (
    <Card>
      <CardHeader
        title="View a Bounty"
        subtitle="Enter a bounty ID to see its details and take action."
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        }
      />
      <CardBody className="space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(value);
          }}
          className="flex items-end gap-2"
        >
          <div className="flex-1">
            <Field label="Bounty ID">
              <Input inputMode="numeric" value={value} onChange={(e) => setOverride(e.target.value)} placeholder="Enter ID number…" />
            </Field>
          </div>
          <Button type="submit" className="mb-0">Open</Button>
        </form>

        {recentIds.length > 0 && (
          <div>
            <div className="mb-2 text-[10px] uppercase tracking-widest text-emerald-700/60 font-medium">
              Recently Viewed
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentIds.map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setOverride(null);
                    load(id);
                  }}
                  className={`rounded-lg px-2.5 py-1 font-mono text-xs ring-1 ring-inset transition-all duration-200 ${
                    selectedId?.toString() === id
                      ? "bg-emerald-500/20 text-emerald-200 ring-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                      : "bg-black/30 text-zinc-400 ring-white/10 hover:bg-emerald-500/10 hover:text-emerald-300 hover:ring-emerald-500/30"
                  }`}
                >
                  #{id}
                </button>
              ))}
            </div>
          </div>
        )}

        {recentIds.length === 0 && (
          <div className="text-center py-8 px-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 flex items-center justify-center text-2xl mb-4 shadow-[0_0_20px_rgba(16,185,129,0.08)]">
              🔍
            </div>
            <p className="text-sm font-medium text-emerald-700/60">No bounties opened yet</p>
            <p className="text-xs text-zinc-700 mt-1">Create a new bounty or enter an ID above to get started.</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
