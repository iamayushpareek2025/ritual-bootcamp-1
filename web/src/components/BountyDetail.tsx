"use client";

import type { CommitRevealBounty } from "@/lib/bounty";
import { getCRBountyStatus, CR_STATUS_META } from "@/lib/bounty";
import { useNow } from "@/hooks/useNow";
import { shortenAddress, formatReward, formatTimestamp, formatRelative } from "@/lib/format";
import { Card, CardHeader, CardBody, Badge, Stat } from "@/components/ui";

export function BountyDetail({
  bountyId,
  bounty,
  isOwner,
}: {
  bountyId: bigint;
  bounty: CommitRevealBounty;
  isOwner: boolean;
}) {
  const now    = useNow();
  const status = getCRBountyStatus(bounty, now / 1000);
  const meta   = CR_STATUS_META[status];

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <span className="font-mono text-emerald-600/70">#{bountyId.toString()}</span>
            <span className="normal-case text-base text-white">
              {bounty.title || "Untitled"}
            </span>
          </span>
        }
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {isOwner && <Badge tone="green">You own this</Badge>}
            <Badge tone={meta.tone}>{meta.label}</Badge>
          </div>
        }
      />
      <CardBody className="space-y-4">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-emerald-600/70 font-medium">Rubric</div>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-emerald-100/80">
            {bounty.rubric || "—"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Stat label="Reward"    value={formatReward(bounty.reward)} />
          <Stat label="Committed" value={bounty.totalCommitted.toString()} />
          <Stat label="Revealed"  value={bounty.totalRevealed.toString()} />
          <Stat label="Eligible"  value={bounty.totalEligible.toString()} />
        </div>

        {/* Two-deadline display */}
        <div className="rounded-lg bg-emerald-500/5 px-3 py-2.5 ring-1 ring-emerald-500/15 space-y-1.5 text-xs border border-emerald-500/10">
          <div className="flex items-center justify-between gap-2">
            <span className="text-emerald-600/80">Submission deadline</span>
            <span className="text-emerald-200/90">
              {formatTimestamp(bounty.submissionDeadline)}
              <span className="ml-1 text-emerald-600/60">({formatRelative(bounty.submissionDeadline)})</span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-emerald-600/80">Reveal deadline</span>
            <span className="text-emerald-200/90">
              {formatTimestamp(bounty.revealDeadline)}
              <span className="ml-1 text-emerald-600/60">({formatRelative(bounty.revealDeadline)})</span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-emerald-500/10">
            <span className="text-emerald-600/80">Owner</span>
            <span className="font-mono text-emerald-300/80">{shortenAddress(bounty.owner)}</span>
          </div>
        </div>

        {bounty.finalized && (
          <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 ring-1 ring-inset ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            🏆 Finalized — winner is submission{" "}
            <span className="font-mono font-semibold text-emerald-300">#{bounty.winnerIndex.toString()}</span>.
          </div>
        )}
      </CardBody>
    </Card>
  );
}
