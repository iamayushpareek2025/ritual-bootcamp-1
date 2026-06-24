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
    (id: bigint) => { add(id); setSelectedId(id); },
    [add],
  );

  return (
    <div className="min-h-full">

      {/* ── Header ───────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b border-emerald-500/20 backdrop-blur-xl"
        style={{ background: "rgba(1,10,4,0.92)" }}
      >
        <div className="header-glow-line" />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">

          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-xl bg-emerald-500/30 blur-md animate-pulse" />
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.45)]">
                  <Image src="/ritual-logo.jpg" alt="Ritual" width={40} height={40} className="w-full h-full object-cover" priority />
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Bounty Judge
                </div>
                <div className="text-[9px] text-emerald-500 font-semibold tracking-[0.2em] uppercase animate-neon-flicker">
                  Powered by Ritual
                </div>
              </div>
            </div>

            {/* Live pill */}
            <div className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
              <div className="dot-live" />
              Live · Chain {ritualChain.id}
            </div>
          </div>

          <WalletConnect />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="mb-12 animate-fade-in-up">

          {/* glow orbs */}
          <div className="pointer-events-none absolute left-0 w-96 h-48 bg-emerald-500/8 rounded-full blur-[80px] -translate-y-1/2" />
          <div className="pointer-events-none absolute right-0 w-64 h-32 bg-teal-500/6 rounded-full blur-[60px]" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 mb-6 shadow-[0_0_15px_rgba(16,185,129,0.12)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-pulse" />
            Powered by Ritual AI Network
          </div>

          {/* Headline */}
          <h2
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Post a bounty.{" "}
            <span className="text-neon-green">Let AI pick the winner.</span>
          </h2>

          <p className="mt-4 max-w-xl text-base text-zinc-400 leading-relaxed">
            Create a challenge, set your scoring rules, and let participants compete.
            Ritual AI scores every entry and picks the best one — fair, fast, and fully on-chain.
          </p>

          {/* Feature pills */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { icon: "🔐", text: "Zero-knowledge Commits",  sub: "No one sees your answer early" },
              { icon: "🤖", text: "AI-powered Scoring",      sub: "Ritual LLM judges every entry" },
              { icon: "💎", text: "Instant Crypto Rewards",  sub: "Winner paid directly on-chain" },
            ].map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm bg-emerald-500/6 border border-emerald-500/20 text-emerald-200 hover:border-emerald-400/50 hover:bg-emerald-500/12 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-250 group cursor-default"
              >
                <span className="text-lg">{f.icon}</span>
                <div>
                  <div className="font-semibold text-xs text-emerald-100">{f.text}</div>
                  <div className="text-[10px] text-emerald-600/80 group-hover:text-emerald-500/90 transition-colors">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────── */}
        <section className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-700/60 font-semibold mb-3">How it works</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { step: "01", icon: "🏆", label: "Post",   desc: "Create a bounty with a prize" },
              { step: "02", icon: "🔒", label: "Submit", desc: "Participants lock in answers"  },
              { step: "03", icon: "🔓", label: "Reveal", desc: "Answers unlock after deadline" },
              { step: "04", icon: "🤖", label: "Judge",  desc: "AI scores all, you pay winner" },
            ].map((s, i) => (
              <div
                key={s.step}
                className="glass-card rounded-2xl px-4 py-4 border border-emerald-500/10 hover:border-emerald-400/35 hover:shadow-[0_0_25px_rgba(16,185,129,0.12)] transition-all duration-300 group relative overflow-hidden"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700/50 group-hover:text-emerald-500/70 transition-colors">{s.step}</span>
                </div>
                <div className="text-sm font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.label}</div>
                <div className="text-[11px] text-zinc-500 leading-snug">{s.desc}</div>
                {/* bottom glow line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </section>

        {!isContractConfigured && (
          <div className="mb-8 animate-fade-in-up">
            <Notice tone="amber">
              Contract not configured. Copy{" "}
              <code className="font-mono text-amber-200">.env.example</code> to{" "}
              <code className="font-mono text-amber-200">.env.local</code> and set{" "}
              <code className="font-mono text-amber-200">NEXT_PUBLIC_CONTRACT_ADDRESS</code>.
            </Notice>
          </div>
        )}

        {/* ── Main Grid ────────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CreateBountyForm onCreated={handleCreated} />
          <LoadBountyPanel selectedId={selectedId} onSelect={setSelectedId} recentIds={ids} />
        </section>

        {/* ── Selected Bounty ──────────────────────────────── */}
        {selectedId !== null && (
          <section className="mt-8 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-5">
              <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/40 to-transparent" />
              <div className="flex items-center gap-2 rounded-full px-3 py-1 bg-emerald-500/10 border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span className="text-xs font-mono text-emerald-300">Bounty #{selectedId.toString()}</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-emerald-500/40 to-transparent" />
            </div>
            <BountyView bountyId={selectedId} />
          </section>
        )}

        {/* ── Footer ───────────────────────────────────────── */}
        <footer className="mt-16 border-t border-emerald-500/10 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <div className="dot-live" style={{ width: 5, height: 5 }} />
              {contractAddress ? (
                <span className="font-mono text-zinc-500">{shortenAddress(contractAddress, 8)}</span>
              ) : (
                <span>Demo — no contract</span>
              )}
              <span className="text-zinc-800">·</span>
              <span className="text-emerald-700/80">{ritualChain.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                <Image src="/ayush-pfp.jpg" alt="Ayush" width={28} height={28} className="w-full h-full object-cover" />
              </div>
              <span>
                Built by <span className="text-emerald-400 font-semibold">Ayush Pareek</span>
                <span className="text-zinc-700"> · Ritual Chain Workshop</span>
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
