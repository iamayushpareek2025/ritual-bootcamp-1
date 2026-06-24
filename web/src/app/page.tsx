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
      <header className="sticky top-0 z-50 border-b border-violet-500/15 backdrop-blur-xl" style={{background: 'rgba(4,4,10,0.85)'}}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            {/* Logo / Brand */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-9 h-9">
                <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md"></div>
                <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-emerald-400/30 shadow-[0_0_12px_rgba(52,211,153,0.25)]">
                  <Image
                    src="/ritual-logo.jpg"
                    alt="Ritual Logo"
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              </div>
              <div>
                <h1 className="text-sm font-bold leading-tight text-white" style={{fontFamily: "'Space Grotesk', sans-serif"}}>
                  AI Bounty Judge
                </h1>
                <p className="text-[10px] leading-tight text-emerald-400 font-medium tracking-wide uppercase">
                  on {ritualChain.name}
                </p>
              </div>
            </div>

            {/* Chain pill */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium bg-violet-500/10 border border-violet-500/20 text-violet-300">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></div>
              Chain {ritualChain.id}
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Hero Section */}
        <section className="mb-10 animate-fade-in-up">
          <div className="relative">
            {/* Background glow */}
            <div className="absolute -top-8 left-0 w-64 h-32 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium bg-violet-500/10 border border-violet-500/25 text-violet-300 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]"></span>
              Powered by Ritual AI
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl" style={{fontFamily: "'Space Grotesk', sans-serif"}}>
              Crowd-judged bounties,{" "}
              <span className="text-neon-violet">settled by AI.</span>
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-zinc-400 leading-relaxed">
              Submit answers, commit a hash before the deadline, reveal your answer after — and let Ritual AI rank all submissions fairly. The bounty owner finalizes the winner.
            </p>

            {/* Feature pills */}
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { icon: "🔒", text: "Commit-Reveal scheme" },
                { icon: "🤖", text: "AI-powered judging" },
                { icon: "⛓️", text: "On-chain rewards" },
              ].map((f) => (
                <span
                  key={f.text}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-white/5 border border-white/10 text-zinc-300 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-200"
                >
                  <span>{f.icon}</span>
                  {f.text}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { step: "01", label: "Create", desc: "Fund a bounty with a rubric", color: "violet" },
              { step: "02", label: "Commit", desc: "Submit hashed answers", color: "indigo" },
              { step: "03", label: "Reveal", desc: "Reveal after deadline", color: "cyan" },
              { step: "04", label: "Win", desc: "AI judges, owner finalizes", color: "emerald" },
            ].map((s) => (
              <div key={s.step} className="glass-card rounded-xl px-4 py-3 border border-white/5 hover:border-violet-500/20 transition-all duration-300 group">
                <div className={`text-xs font-mono font-bold mb-1 text-${s.color}-500/70 group-hover:text-${s.color}-400 transition-colors`}>{s.step}</div>
                <div className="text-sm font-semibold text-white mb-0.5" style={{fontFamily: "'Space Grotesk', sans-serif"}}>{s.label}</div>
                <div className="text-[11px] text-zinc-500">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Contract not configured warning */}
        {!isContractConfigured && (
          <div className="mb-6 animate-fade-in-up">
            <Notice tone="amber">
              No contract address configured. Copy{" "}
              <code className="font-mono text-amber-200">.env.example</code> to{" "}
              <code className="font-mono text-amber-200">.env.local</code> and set{" "}
              <code className="font-mono text-amber-200">NEXT_PUBLIC_CONTRACT_ADDRESS</code> to start.
            </Notice>
          </div>
        )}

        {/* Main Dashboard */}
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <CreateBountyForm onCreated={handleCreated} />
          <LoadBountyPanel selectedId={selectedId} onSelect={setSelectedId} recentIds={ids} />
        </section>

        {/* Selected Bounty Detail */}
        {selectedId !== null && (
          <section className="mt-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-violet-500/30 to-transparent"></div>
              <span className="text-xs font-mono text-violet-400 px-3">Bounty #{selectedId.toString()}</span>
              <div className="h-px flex-1 bg-gradient-to-l from-violet-500/30 to-transparent"></div>
            </div>
            <BountyView bountyId={selectedId} />
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-white/5 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60"></span>
              {contractAddress ? (
                <>
                  Contract{" "}
                  <span className="font-mono text-zinc-500">{shortenAddress(contractAddress, 6)}</span>
                </>
              ) : (
                "Workshop demo"
              )}
              <span className="text-zinc-700">·</span>
              <span className="text-violet-500/60">{ritualChain.name}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative w-6 h-6 rounded-full overflow-hidden border border-violet-500/30 shadow-[0_0_8px_rgba(139,92,246,0.3)]">
                <Image
                  src="/ayush-pfp.jpg"
                  alt="Ayush"
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-zinc-500">Built by <span className="text-violet-400 font-medium">Ayush</span> · Ritual Chain Workshop</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
