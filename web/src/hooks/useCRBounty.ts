"use client";

import { useReadContract } from "wagmi";
import aiJudgeAbi from "@/abi/AIJudgeCommitReveal";
import { contractAddress, isContractConfigured } from "@/config/contract";
import { ritualChain } from "@/config/wagmi";
import { parseCRBounty, type CommitRevealBounty } from "@/lib/bounty";

/** Read + parse a commit-reveal bounty, polling every 12 s for deadline transitions. */
export function useCRBounty(bountyId?: bigint) {
  const enabled = bountyId !== undefined && isContractConfigured;

  const query = useReadContract({
    address: contractAddress,
    abi: aiJudgeAbi,
    functionName: "getBounty",
    args: bountyId !== undefined ? [bountyId] : undefined,
    chainId: ritualChain.id,
    query: {
      enabled,
      refetchInterval: 12_000,
    },
  });

  const bounty: CommitRevealBounty | undefined = query.data
    ? parseCRBounty(query.data)
    : undefined;

  return {
    bounty,
    isLoading: query.isLoading,
    isError:   query.isError,
    error:     query.error,
    refetch:   query.refetch,
  };
}
