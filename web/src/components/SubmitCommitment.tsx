"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useNow } from "@/hooks/useNow";
import aiJudgeAbi from "@/abi/AIJudgeCommitReveal";
import { contractAddress } from "@/config/contract";
import { ritualChain } from "@/config/wagmi";
import { canCommit, type CommitRevealBounty } from "@/lib/bounty";
import { computeCommitment, generateSalt, saveAnswerLocally } from "@/lib/commitReveal";
import { useWriteTx } from "@/hooks/useWriteTx";
import {
  Card,
  CardHeader,
  CardBody,
  Field,
  Textarea,
  Button,
  TxStatus,
  Notice,
} from "@/components/ui";
import type { Address } from "viem";

const explorerBase = ritualChain.blockExplorers?.default.url;

export function SubmitCommitment({
  bountyId,
  bounty,
  onCommitted,
}: {
  bountyId: bigint;
  bounty: CommitRevealBounty;
  onCommitted: () => void;
}) {
  const { address, isConnected } = useAccount();
  const now = useNow();
  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(false);

  const tx = useWriteTx(() => {
    setSaved(false);
    setAnswer("");
    onCommitted();
  });

  // Only render during the commit phase
  if (!canCommit(bounty, now / 1000)) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim() || !address || !contractAddress) return;

    const salt = generateSalt();
    const commitment = computeCommitment(
      answer.trim(),
      salt,
      address as Address,
      bountyId,
    );

    // Save locally BEFORE sending tx so the user can reveal even if page refreshes
    saveAnswerLocally(bountyId, address as Address, answer.trim(), salt);
    setSaved(true);

    try {
      await tx.run({
        address: contractAddress,
        abi: aiJudgeAbi,
        functionName: "submitCommitment",
        args: [bountyId, commitment],
        chainId: ritualChain.id,
      });
    } catch {
      /* surfaced via tx.state */
    }
  }

  return (
    <Card>
      <CardHeader
        title="Submit Your Answer"
        subtitle="Your answer stays hidden until the deadline passes."
      />
      <CardBody>
        <Notice tone="green">
          <strong>Your answer is kept secret.</strong> We lock a fingerprint of it on-chain so no one can peek. After the deadline, you reveal the real answer and it gets scored.
        </Notice>

        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <Field
            label="Your Answer"
            hint="Type your best answer. It stays private until you reveal it."
          >
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
              placeholder="Write your answer here…"
            />
          </Field>

          {saved && (
            <Notice tone="amber">
              ⚠️ Saved to this browser. Use the same browser to reveal your answer after the deadline, or copy the answer and salt from the Reveal section.
            </Notice>
          )}

          <Button type="submit" disabled={!isConnected || !answer.trim() || tx.isBusy} className="w-full">
            {tx.isBusy ? "Locking in…" : "Lock In My Answer"}
          </Button>

          {!isConnected && (
            <p className="text-xs text-emerald-700/60">Connect your wallet to submit.</p>
          )}

          <TxStatus
            state={tx.state}
            error={tx.error}
            hash={tx.hash}
            explorerBase={explorerBase}
          />
        </form>
      </CardBody>
    </Card>
  );
}
