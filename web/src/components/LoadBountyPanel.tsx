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
        title="Load a Bounty"
        subtitle="Open any bounty by its numeric id."
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
              <Input
                inputMode="numeric"
                value={value}
                onChange={(e) => setOverride(e.target.value)}
                placeholder="Enter bounty ID…"
              />
            </Field>
          </div>
          <Button type="submit" className="mb-0">
            Load
          </Button>
        </form>

        {recentIds.length > 0 && (
          <div>
            <div className="mb-2 text-[10px] uppercase tracking-widest text-zinc-600 font-medium">
              Recent Bounties
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
          <div className="text-center py-6">
            <div className="text-3xl mb-2 opacity-30">🔍</div>
            <p className="text-xs text-zinc-600">Create or load a bounty to get started.</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
