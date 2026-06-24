"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { ritualChain } from "@/config/wagmi";
import { shortenAddress } from "@/lib/format";
import { Button, Badge } from "@/components/ui";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const wrongChain = isConnected && chainId !== ritualChain.id;

  if (!mounted) return <div className="h-9 w-36" />;

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {wrongChain ? (
          <Button
            variant="secondary"
            onClick={() => switchChain({ chainId: ritualChain.id })}
            className="text-amber-300 border-amber-500/30 hover:border-amber-400/50"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Switch to {ritualChain.name}
          </Button>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></div>
            {ritualChain.name}
          </div>
        )}
        <button
          onClick={() => disconnect()}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-mono bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:border-violet-500/30 transition-all duration-200"
        >
          <div className="relative w-5 h-5 rounded-full overflow-hidden border border-violet-400/40 shadow-[0_0_6px_rgba(139,92,246,0.4)] flex-shrink-0">
            <Image
              src="/ayush-pfp.jpg"
              alt="Ayush"
              width={20}
              height={20}
              className="w-full h-full object-cover object-top"
            />
          </div>
          {shortenAddress(address)}
        </button>
      </div>
    );
  }

  const seen = new Set<string>();
  const list = connectors.filter((c) => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });

  return (
    <div className="relative">
      <Button onClick={() => setOpen((v) => !v)} disabled={isPending} className="gap-2">
        {isPending ? (
          <>
            <span className="spinner inline-block h-3 w-3 rounded-full border-2 border-white border-t-transparent"></span>
            Connecting…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
            </svg>
            Connect Wallet
          </>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-violet-500/20 shadow-2xl shadow-violet-900/30 animate-fade-in-up" style={{background: 'rgba(10,5,25,0.95)', backdropFilter: 'blur(20px)'}}>
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Select wallet</p>
            </div>
            {list.length === 0 && (
              <div className="px-4 py-4 text-xs text-zinc-500 text-center">
                No wallet connectors found.
              </div>
            )}
            {list.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => {
                  connect({ connector });
                  setOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-zinc-200 hover:bg-violet-500/10 transition-colors duration-150 border-b border-white/3 last:border-0"
              >
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-base">
                  {connector.name === "MetaMask" ? "🦊" : connector.name === "WalletConnect" ? "🔗" : "💼"}
                </div>
                <span className="font-medium">{connector.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
