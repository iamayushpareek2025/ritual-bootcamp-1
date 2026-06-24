"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { parseEther, parseEventLogs } from "viem";
import { contractAddress, isContractConfigured } from "@/config/contract";
import { ritualChain } from "@/config/wagmi";
import aiJudgeAbi from "@/abi/AIJudgeCommitReveal";
import { useWriteTx } from "@/hooks/useWriteTx";
import {
  Card,
  CardHeader,
  CardBody,
  Field,
  Input,
  Textarea,
  Button,
  TxStatus,
  Notice,
} from "@/components/ui";

const explorerBase = ritualChain.blockExplorers?.default.url;

/** Format a Date to YYYY-MM-DDTHH:mm (datetime-local value). */
function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** Default submission deadline = now + 1 hour. */
function defaultSubmissionDeadline(): string {
  return toDatetimeLocal(new Date(Date.now() + 60 * 60 * 1000));
}

/** Default reveal deadline = now + 2 hours (1 h after submission). */
function defaultRevealDeadline(): string {
  return toDatetimeLocal(new Date(Date.now() + 2 * 60 * 60 * 1000));
}

export function CreateBountyForm({ onCreated }: { onCreated?: (bountyId: bigint) => void }) {
  const { isConnected } = useAccount();
  const [title, setTitle] = useState("");
  const [rubric, setRubric] = useState("");
  const [submissionDeadline, setSubmissionDeadline] = useState(defaultSubmissionDeadline());
  const [revealDeadline, setRevealDeadline]         = useState(defaultRevealDeadline());
  const [reward, setReward] = useState("");
  const [createdId, setCreatedId] = useState<bigint | null>(null);

  // Once confirmed, pull the new bountyId out of the BountyCreated event log.
  const tx = useWriteTx((receipt) => {
    try {
      const logs = parseEventLogs({
        abi: aiJudgeAbi,
        eventName: "BountyCreated",
        logs: receipt.logs,
      });
      const id = logs[0]?.args?.bountyId;
      if (id !== undefined) {
        setCreatedId(id);
        onCreated?.(id);
      }
    } catch {
      /* couldn't decode — not fatal */
    }
  });

  // Pure, render-safe validation (no clock reads here — see handleSubmit).
  const validation = useMemo(() => {
    if (!title.trim()) return "Title is required.";
    if (!rubric.trim()) return "Rubric is required.";
    if (!submissionDeadline) return "Pick a submission deadline.";
    if (!revealDeadline)     return "Pick a reveal deadline.";
    const subTs = new Date(submissionDeadline).getTime();
    const revTs = new Date(revealDeadline).getTime();
    if (!Number.isFinite(subTs)) return "Invalid submission deadline.";
    if (!Number.isFinite(revTs)) return "Invalid reveal deadline.";
    if (revTs <= subTs) return "Reveal deadline must be after submission deadline.";
    if (reward !== "") {
      try {
        parseEther(reward);
      } catch {
        return "Reward must be a valid number.";
      }
    }
    return null;
  }, [title, rubric, submissionDeadline, revealDeadline, reward]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validation || !contractAddress) return;

    const subMs = new Date(submissionDeadline).getTime();
    const revMs = new Date(revealDeadline).getTime();
    if (subMs <= Date.now()) {
      window.alert("Submission deadline must be in the future.");
      return;
    }
    if (revMs <= subMs) {
      window.alert("Reveal deadline must be after the submission deadline.");
      return;
    }

    // The public Ritual testnet (1979) uses millisecond block.timestamps!
    // Local hardhat (31337) uses standard EVM second block.timestamps.
    const isRitualTestnet = ritualChain.id === 1979;
    const subTs = BigInt(isRitualTestnet ? subMs : Math.floor(subMs / 1000));
    const revTs = BigInt(isRitualTestnet ? revMs : Math.floor(revMs / 1000));
    console.log("Creating commit-reveal bounty", { title, rubric, subTs, revTs, reward });
    const value = reward.trim() === "" ? 0n : parseEther(reward.trim());
    setCreatedId(null);

    try {
      await tx.run({
        address: contractAddress,
        abi: aiJudgeAbi,
        functionName: "createBounty",
        args: [title.trim(), rubric.trim(), subTs, revTs],
        value,
        chainId: ritualChain.id,
      });
    } catch {
      /* surfaced via tx.state */
    }
  }

  return (
    <Card>
      <CardHeader
        title="Create a bounty"
        subtitle="Fund a reward and define how submissions will be judged."
      />
      <CardBody>
        {!isContractConfigured && (
          <Notice tone="amber">
            Set <code className="font-mono">NEXT_PUBLIC_CONTRACT_ADDRESS</code> in your{" "}
            <code className="font-mono">.env.local</code> to enable transactions.
          </Notice>
        )}

        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <Field label="Title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Best gas-optimization writeup"
              maxLength={200}
            />
          </Field>

          <Field label="Rubric" hint="How submissions are scored. The AI judges only against this.">
            <Textarea
              value={rubric}
              onChange={(e) => setRubric(e.target.value)}
              rows={4}
              placeholder="Correctness 50%, clarity 30%, novelty 20%…"
            />
          </Field>

          {/* Lifecycle note */}
          <div className="rounded-lg bg-indigo-500/10 px-3 py-2 text-xs text-indigo-300 ring-1 ring-inset ring-indigo-500/20">
            <strong>Commit-Reveal flow:</strong> Participants commit a hash before the submission
            deadline, then reveal their answer before the reveal deadline. Only revealed answers
            are judged — keeping submissions private until judging begins.
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Submission deadline" hint="Commit phase closes here.">
              <Input
                type="datetime-local"
                value={submissionDeadline}
                onChange={(e) => setSubmissionDeadline(e.target.value)}
              />
            </Field>
            <Field label="Reveal deadline" hint="Reveal phase closes here (must be after submission deadline).">
              <Input
                type="datetime-local"
                value={revealDeadline}
                onChange={(e) => setRevealDeadline(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Reward (RITUAL)" hint="Locked in the contract on create.">
              <Input
                type="number"
                min="0"
                step="any"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                placeholder="1.0"
              />
            </Field>
          </div>

          {validation && (title || rubric || reward) ? (
            <p className="text-xs text-amber-300">{validation}</p>
          ) : null}

          <Button
            type="submit"
            disabled={!isConnected || !isContractConfigured || !!validation || tx.isBusy}
            className="w-full"
          >
            {tx.isBusy ? "Creating…" : "Create bounty"}
          </Button>

          {!isConnected && (
            <p className="text-xs text-zinc-500">Connect your wallet to create a bounty.</p>
          )}

          <TxStatus state={tx.state} error={tx.error} hash={tx.hash} explorerBase={explorerBase} />

          {createdId !== null && (
            <Notice tone="green">
              Bounty created with id{" "}
              <span className="font-mono font-semibold">#{createdId.toString()}</span>. Loaded
              below.
            </Notice>
          )}
        </form>
      </CardBody>
    </Card>
  );
}
