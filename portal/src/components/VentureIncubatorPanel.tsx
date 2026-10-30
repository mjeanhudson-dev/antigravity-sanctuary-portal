import React from 'react';
import { Flame, ArrowUpRight, Check, DollarSign } from 'lucide-react';
import { VENTURE_TRACK } from '../data/hubData';

export const VentureIncubatorPanel: React.FC = () => {
  return (
    <div className="bg-obsidian-900 border border-obsidian-800 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-obsidian-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Flame className="h-4 w-4 text-amber-400" />
          <span>Venture Incubator Spotlight</span>
        </div>
        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/80 text-amber-300">
          Track 1
        </span>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-200">
          {VENTURE_TRACK.title}
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          {VENTURE_TRACK.tagline}
        </p>
      </div>

      {/* Revenue Wedge Box */}
      <div className="p-3 rounded bg-obsidian-850 border border-obsidian-800 space-y-1.5 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <DollarSign className="h-3.5 w-3.5" />
          <span>Revenue Wedge</span>
        </div>
        <p className="text-slate-300 leading-tight">
          {VENTURE_TRACK.revenueWedge}
        </p>
      </div>

      {/* Key Architectural Moats */}
      <div className="space-y-2 text-xs">
        <div className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">
          Core Technical Moats
        </div>
        <ul className="space-y-1.5">
          {VENTURE_TRACK.keyComponents.map((comp) => (
            <li key={comp} className="flex items-start gap-2 text-slate-300">
              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-tight">{comp}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-2 border-t border-obsidian-800">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Ledger Source</span>
          <span className="text-slate-300 hover:text-white flex items-center gap-1">
            VENTURE_INCUBATOR.md
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
