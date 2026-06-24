"use client";

import { useState } from "react";
import aiJudgeAbi from "@/abi/AIJudgeCommitReveal";
import { contractAddress } from "@/config/contract";
import { ritualChain } from "@/config/wagmi";
import type { CommitRevealBounty } from "@/lib/bounty";
import { decodeAiReview } from "@/lib/aiReview";
import { formatReward } from "@/lib/format";
import { useWriteTx } from "@/hooks/useWriteTx";
import {
  Card,
  CardHeader,
  CardBody,
  Field,
  Input,
  Button,
  TxStatus,
  Notice,
} from "@/components/ui";

const explorerBase = ritualChain.blockExplorers?.default.url;

export function FinalizeWinner({
  bountyId,
  bounty,
  isOwner,
  onFinalized,
}: {
  bountyId: bigint;
  bounty: CommitRevealBounty;
  isOwner: boolean;
  onFinalized: () => void;
}) {
  const count = Number(bounty.totalCommitted);
  const recommended = decodeAiReview(bounty.aiReview)?.parsed?.winnerIndex;

  // The input is prefilled with the AI recommendation until the owner edits it.
  // `override === null` means "untouched, show the recommendation".
  const [override, setOverride] = useState<string | null>(null);
  const winnerIndex =
    override ?? (recommended !== undefined ? String(recommended) : "");

  const tx = useWriteTx(() => onFinalized());

  // Gate per spec: owner only, judged, not finalized.
  if (!isOwner || !bounty.judged || bounty.finalized) return null;

  const idxNum = Number(winnerIndex);
  const valid =
    winnerIndex !== "" &&
    Number.isInteger(idxNum) &&
    idxNum >= 0 &&
    idxNum < count;

  async function handleFinalize() {
    if (!valid || !contractAddress) return;
    try {
      await tx.run({
        address: contractAddress,
        abi: aiJudgeAbi,
        functionName: "finalizeWinner",
        args: [bountyId, BigInt(idxNum)],
        chainId: ritualChain.id,
      });
    } catch {
      /* surfaced via tx.state */
    }
  }

  return (
    <Card>
      <CardHeader
        title="Pay the Winner"
        subtitle="Send the prize to the best answer. This cannot be undone."
      />
      <CardBody className="space-y-3">
        <Notice tone="zinc">
          Only one person gets the prize ({formatReward(bounty.reward)}). Choose wisely.
        </Notice>

        <Field
          label="Winning Answer Number"
          hint={
            recommended !== undefined
              ? `AI suggests answer #${recommended}. Final choice is yours.`
              : `Pick a number between 0 and ${Math.max(count - 1, 0)}.`
          }
        >
          <Input type="number" min={0} max={Math.max(count - 1, 0)} value={winnerIndex} onChange={(e) => setOverride(e.target.value)} />
        </Field>

        {winnerIndex !== "" && !valid && (
          <p className="text-xs text-amber-300">
            Index must be between 0 and {Math.max(count - 1, 0)}.
          </p>
        )}

        <Button onClick={handleFinalize} disabled={!valid || tx.isBusy} className="w-full">
          {tx.isBusy ? "Sending prize…" : "Pay Winner Now"}
        </Button>

        <TxStatus
          state={tx.state}
          error={tx.error}
          hash={tx.hash}
          explorerBase={explorerBase}
        />
      </CardBody>
    </Card>
  );
}
