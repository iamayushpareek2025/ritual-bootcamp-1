"use client";

import { useReadContract } from "wagmi";
import aiJudgeAbi from "@/abi/AIJudgeCommitReveal";
import { contractAddress } from "@/config/contract";
import { ritualChain } from "@/config/wagmi";
import { shortenAddress } from "@/lib/format";
import type { JudgeResult } from "@/lib/aiReview";
import type { CommitRevealBounty } from "@/lib/bounty";
import { Card, CardHeader, CardBody, Badge } from "@/components/ui";

export function CommitmentsList({
  bountyId,
  bounty,
  judge,
  finalWinner,
}: {
  bountyId: bigint;
  bounty: CommitRevealBounty;
  judge?: JudgeResult | null;
  finalWinner?: number;
}) {
  const count = Number(bounty.totalCommitted);
  const indices = Array.from({ length: count }, (_, i) => i);

  const subtitle = bounty.judged
    ? "Answers are now visible — judging is complete."
    : bounty.totalRevealed > 0n
    ? `${bounty.totalRevealed} revealed, ${bounty.totalEligible} eligible for judging.`
    : "Answers are hidden until judging completes.";

  return (
    <Card>
      <CardHeader
        title="Submissions"
        subtitle={subtitle}
        action={
          <div className="flex items-center gap-1.5">
            <Badge tone="zinc">{count} committed</Badge>
            {bounty.totalEligible > 0n && (
              <Badge tone="green">{bounty.totalEligible.toString()} eligible</Badge>
            )}
          </div>
        }
      />
      <CardBody className="space-y-3">
        {count === 0 ? (
          <p className="text-sm text-emerald-700/60 italic">No commitments yet.</p>
        ) : (
          indices.map((i) => (
            <CommitmentRow
              key={i}
              bountyId={bountyId}
              index={i}
              showAnswer={bounty.judged}
              ranking={judge?.ranking?.find((r) => r.index === i)}
              recommended={judge?.winnerIndex === i}
              isWinner={finalWinner === i}
            />
          ))
        )}
      </CardBody>
    </Card>
  );
}

function CommitmentRow({
  bountyId,
  index,
  showAnswer,
  ranking,
  recommended,
  isWinner,
}: {
  bountyId:    bigint;
  index:       number;
  showAnswer:  boolean;
  ranking?:    { index: number; score: number; reason: string };
  recommended?: boolean;
  isWinner?:   boolean;
}) {
  const { data, isLoading } = useReadContract({
    address: contractAddress,
    abi: aiJudgeAbi,
    functionName: "getSubmission",
    args: [bountyId, BigInt(index)],
    chainId: ritualChain.id,
    query: { enabled: !!contractAddress },
  });

  const submitter  = data?.[0];
  const commitment = data?.[1];
  const revealed   = data?.[2];
  const eligible   = data?.[3];
  const answer     = data?.[4];

  const borderClass = isWinner
    ? "border-emerald-500/50 bg-emerald-500/8 shadow-[0_0_15px_rgba(16,185,129,0.12)]"
    : recommended
    ? "border-teal-500/40 bg-teal-500/5 shadow-[0_0_10px_rgba(20,184,166,0.08)]"
    : "border-emerald-500/10 bg-black/25";

  return (
    <div className={`rounded-xl border p-3 transition-all duration-200 ${borderClass}`}>
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-emerald-700/60">#{index}</span>
          <span className="font-mono text-sm text-emerald-200/80">
            {submitter ? shortenAddress(submitter) : isLoading ? "loading…" : "—"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {revealed === true && eligible === true && (
            <Badge tone="green">Revealed ✓</Badge>
          )}
          {revealed === true && eligible === false && (
            <Badge tone="amber">Invalid reveal</Badge>
          )}
          {revealed === false && (
            <Badge tone="zinc">Not revealed</Badge>
          )}
          {ranking && <Badge tone="zinc">score {ranking.score}</Badge>}
          {isWinner ? (
            <Badge tone="green">Winner 🏆</Badge>
          ) : recommended ? (
            <Badge tone="cyan">AI pick ✦</Badge>
          ) : null}
        </div>
      </div>

      {/* Commitment hash */}
      {commitment && (
        <p className="mt-2 break-all font-mono text-[10px] text-emerald-800/60" title="Commitment hash">
          {commitment}
        </p>
      )}

      {/* Answer */}
      {showAnswer && answer ? (
        <p className="mt-2 whitespace-pre-wrap break-words text-sm text-emerald-100/85">{answer}</p>
      ) : showAnswer && eligible ? (
        <p className="mt-2 text-xs text-emerald-700/60 italic">Answer not available.</p>
      ) : !showAnswer && (revealed || eligible) ? (
        <p className="mt-2 text-xs text-emerald-800/60 italic">
          🔒 Answer hidden until judging completes.
        </p>
      ) : null}

      {/* AI reasoning */}
      {ranking?.reason && (
        <p className="mt-2 border-t border-emerald-500/10 pt-2 text-xs text-emerald-400/70">
          <span className="text-emerald-600/60">AI: </span>
          {ranking.reason}
        </p>
      )}
    </div>
  );
}
