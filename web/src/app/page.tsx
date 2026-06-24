"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { WalletConnect } from "@/components/WalletConnect";
import { CreateBountyForm } from "@/components/CreateBountyForm";
import { LoadBountyPanel } from "@/components/LoadBountyPanel";
import { BountyView } from "@/components/BountyView";
import { useRecentBounties } from "@/hooks/useRecentBounties";
import { isContractConfigured, contractAddress } from "@/config/contract";
import { ritualChain } from "@/config/wagmi";
import { shortenAddress } from "@/lib/format";
import { Notice } from "@/components/ui";

export default function Home() {
  const [selectedId, setSelectedId] = useState<bigint | null>(null);
  const { ids, add } = useRecentBounties();

  useEffect(() => {
    if (selectedId !== null) add(selectedId);
  }, [selectedId, add]);

  const handleCreated = useCallback(
    (id: bigint) => {
      add(id);
      setSelectedId(id);
    },
    [add],
  );

  return (
    <div className="min-h-full">
      {/* Top Nav */}
      <header
        className="sticky top-0 z-50 border-b border-emerald-500/20 backdrop-blur-xl"
        style={{ background: "rgba(1,10,4,0.88)" }}
      >
        <div className="header-glow-line" />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10">
                <div className="absolute inset-0 rounded-xl bg-emerald-500/25 blur-lg animate-pulse" />
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-emerald-400/40 shadow-[0_0_18px_rgba(16,185,129,0.4)]">
                  <Image src="/ritual-logo.jpg" alt="Ritual" width={40} height={40} className="w-full h-full object-cover" priority />
                </div>
              </div>
              <div>
                <h1 className="text-sm font-bold leading-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Bounty Judge
                </h1>
                <p className="text-[10px] leading-tight text-emerald-400 font-medium tracking-widest uppercase animate-neon-flicker">
                  Powered by Ritual
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
              <div className="dot-live" />
              Live on Chain {ritualChain.id}
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Hero */}
        <section className="mb-10 animate-fade-in-up">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-72 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-float" />
            <div className="absolute -top-4 right-0 w-48 h-24 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
              Powered by Ritual AI
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Post a bounty.{" "}
              <span className="text-neon-green">Let AI pick the winner.</span>
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-zinc-400 leading-relaxed">
              Create a bounty, set your judging rules, and let participants submit their answers.
              Ritual AI scores every entry and picks the best one — fair, fast, and on-chain.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { icon: "🔒", text: "Private submissions" },
                { icon: "🤖", text: "AI scoring" },
                { icon: "⛓️", text: "On-chain rewards" },
              ].map((f) => (
                <span
                  key={f.text}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-emerald-500/8 border border-emerald-500/20 text-emerald-200 hover:border-emerald-400/50 hover:bg-emerald-500/15 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all duration-200"
                >
                  <span>{f.icon}</span>
                  {f.text}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { step: "01", label: "Post",   desc: "Create a bounty with prize money",    color: "emerald" },
              { step: "02", label: "Submit", desc: "Participants submit locked answers",   color: "teal"    },
              { step: "03", label: "Unlock", desc: "Answers are revealed after deadline", color: "cyan"    },
              { step: "04", label: "Win",    desc: "AI scores all answers, you pay out",  color: "emerald" },
            ].map((s) => (
              <div
                key={s.step}
                className="glass-card rounded-xl px-4 py-3 border border-emerald-500/10 hover:border-emerald-400/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all duration-300 group"
              >
                <div className={`text-xs font-mono font-bold mb-1 text-${s.color}-500/60 group-hover:text-${s.color}-400 transition-colors`}>
                  {s.step}
                </div>
                <div className="text-sm font-semibold text-white mb-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {s.label}
                </div>
                <div className="text-[11px] text-zinc-500">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {!isContractConfigured && (
          <div className="mb-6 animate-fade-in-up">
            <Notice tone="amber">
              Contract not set up yet. Copy{" "}
              <code className="font-mono text-amber-200">.env.example</code> to{" "}
              <code className="font-mono text-amber-200">.env.local</code> and add your{" "}
              <code className="font-mono text-amber-200">NEXT_PUBLIC_CONTRACT_ADDRESS</code> to get started.
            </Notice>
          </div>
        )}

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <CreateBountyForm onCreated={handleCreated} />
          <LoadBountyPanel selectedId={selectedId} onSelect={setSelectedId} recentIds={ids} />
        </section>

        {selectedId !== null && (
          <section className="mt-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/40 to-transparent" />
              <span className="text-xs font-mono text-emerald-400 px-3 text-neon-cyan">
                Bounty #{selectedId.toString()}
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-emerald-500/40 to-transparent" />
            </div>
            <BountyView bountyId={selectedId} />
          </section>
        )}

        <footer className="mt-12 border-t border-emerald-500/10 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <div className="dot-live" style={{ width: 6, height: 6 }} />
              {contractAddress ? (
                <>
                  Contract <span className="font-mono text-zinc-500">{shortenAddress(contractAddress, 6)}</span>
                </>
              ) : (
                "Demo mode — no contract"
              )}
              <span className="text-zinc-700">·</span>
              <span className="text-emerald-600/80">{ritualChain.name}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative w-6 h-6 rounded-full overflow-hidden border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.35)]">
                <Image src="/ayush-pfp.jpg" alt="Ayush" width={24} height={24} className="w-full h-full object-cover" />
              </div>
              <span className="text-zinc-500">
                Made by <span className="text-emerald-400 font-medium">Ayush</span> · Ritual Chain Workshop
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
