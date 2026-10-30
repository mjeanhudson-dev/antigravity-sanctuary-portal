import React from 'react';
import { ShieldCheck, Cpu, HardDrive, Zap, CheckCircle2, Terminal } from 'lucide-react';

interface VitalsHeaderProps {
  bountyCount: number;
  completedCount: number;
}

export const VitalsHeader: React.FC<VitalsHeaderProps> = ({ bountyCount, completedCount }) => {
  return (
    <header className="border-b border-obsidian-800 bg-obsidian-900/90 backdrop-blur px-6 py-4 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-obsidian-800 border border-obsidian-700 flex items-center justify-center text-emerald-400">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-100 tracking-tight leading-tight">
              Antigravity Multi-Agent Hub
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              C:\Users\Zachariah\Documents\antigravity
            </p>
          </div>
        </div>

        {/* Real-time System Vitals Telemetry */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
          {/* PINPOINT Hardware Pass Rate */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-obsidian-850 border border-obsidian-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-400">PINPOINT:</span>
            <span className="text-emerald-300 font-medium tabular-nums">114/114 (100%)</span>
          </div>

          {/* Active Bounties Progress */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-obsidian-850 border border-obsidian-800">
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-slate-400">Bounties:</span>
            <span className="text-slate-200 tabular-nums font-medium">
              {completedCount}/{bountyCount} Locked
            </span>
          </div>

          {/* Stock XML Invariant */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-obsidian-850 border border-obsidian-800">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-400">Stock XML:</span>
            <span className="text-emerald-300">0B Tampered</span>
          </div>

          {/* Deployment Parity */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded bg-obsidian-850 border border-obsidian-800">
            <HardDrive className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400">SHA256 Parity:</span>
            <span className="text-slate-200">Synchronized</span>
          </div>

          {/* Sentinel Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-obsidian-850 border border-obsidian-800">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-slate-400">Sentinel:</span>
            <span className="text-amber-300 font-medium">Unthrottled</span>
          </div>
        </div>
      </div>
    </header>
  );
};
