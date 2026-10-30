import React from 'react';
import { Search, ChevronRight, User, Hash, Filter, CheckCircle2, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import type { Bounty } from '../data/hubData';

interface BountyLedgerProps {
  bounties: Bounty[];
  selectedBounty: Bounty | null;
  onSelectBounty: (bounty: Bounty) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTag: string | null;
  onClearTag: () => void;
}

export const BountyLedger: React.FC<BountyLedgerProps> = ({
  bounties,
  selectedBounty,
  onSelectBounty,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  activeTag,
  onClearTag,
}) => {
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search input
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const statuses = ['ALL', 'COMPLETED', 'IN_PROGRESS', 'CLAIMED', 'OPEN', 'BLOCKED'] as const;

  const getStatusBadge = (status: Bounty['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded border bg-emerald-950/60 border-emerald-800/80 text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            COMPLETED
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded border bg-amber-950/60 border-amber-800/80 text-amber-300">
            <Clock className="h-3 w-3" />
            IN PROGRESS
          </span>
        );
      case 'CLAIMED':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded border bg-blue-950/60 border-blue-800/80 text-blue-300">
            <User className="h-3 w-3" />
            CLAIMED
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded border bg-rose-950/60 border-rose-800/80 text-rose-300">
            <ShieldAlert className="h-3 w-3" />
            BLOCKED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded border bg-obsidian-850 border-obsidian-700 text-slate-300">
            OPEN
          </span>
        );
    }
  };

  return (
    <div className="bg-obsidian-900 border border-obsidian-800 rounded-lg p-5 space-y-4">
      {/* Title & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-obsidian-800">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span>Central Bounty & Task Ledger</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-obsidian-800 text-slate-300 tabular-nums">
              {bounties.length} items
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Atomic cross-project claims, verified milestones, and hardware validation anchors
          </p>
        </div>

        {/* Search input with '/' hotkey */}
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search bounties, tags, agents..."
            className="w-full bg-obsidian-950 border border-obsidian-800 rounded pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] px-1.5 py-0.5 rounded bg-obsidian-850 text-slate-500 border border-obsidian-800">
            /
          </div>
        </div>
      </div>

      {/* Filter Tabs & Active Filter Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {statuses.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onStatusFilterChange(st)}
              className={`text-xs font-mono px-3 py-1.5 rounded transition-colors ${
                statusFilter === st
                  ? 'bg-slate-100 text-obsidian-950 font-medium'
                  : 'bg-obsidian-850 text-slate-400 hover:text-slate-200 hover:bg-obsidian-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {activeTag && (
          <div className="flex items-center gap-1.5 text-xs font-mono bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded text-emerald-300">
            <Filter className="h-3 w-3" />
            <span>Tag: {activeTag}</span>
            <button
              type="button"
              onClick={onClearTag}
              className="ml-1 hover:text-white font-bold"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Bounty Ledger Rows */}
      <div className="space-y-2 pt-2">
        {bounties.length === 0 ? (
          <div className="text-center py-12 px-4 rounded border border-dashed border-obsidian-800 space-y-2">
            <p className="text-sm text-slate-400 font-mono">No bounties match current query or filter criteria.</p>
            <button
              type="button"
              onClick={() => {
                onStatusFilterChange('ALL');
                onSearchChange('');
                onClearTag();
              }}
              className="text-xs font-mono text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Reset all filters
            </button>
          </div>
        ) : (
          bounties.map((bounty) => {
            const isSelected = selectedBounty?.id === bounty.id;
            return (
              <div
                key={bounty.id}
                onClick={() => onSelectBounty(bounty)}
                className={`group p-3.5 rounded border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-obsidian-850 border-emerald-500/70 shadow-sm'
                    : 'bg-obsidian-950 hover:bg-obsidian-850 border-obsidian-800/90 hover:border-obsidian-700'
                }`}
              >
                {/* Left meta & title */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-300">
                      {bounty.id}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-obsidian-800 text-slate-400 border border-obsidian-700">
                      {bounty.project}
                    </span>
                    {getStatusBadge(bounty.status)}
                    <span className="font-mono text-[11px] text-slate-400 ml-auto md:ml-0">
                      {bounty.milestone}
                    </span>
                  </div>

                  <h3 className="text-sm font-medium text-slate-100 group-hover:text-emerald-300 transition-colors leading-snug">
                    {bounty.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-1">
                    {bounty.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {bounty.domainTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-0.5 font-mono text-[10px] px-1.5 py-0.5 rounded bg-obsidian-900 text-slate-400 border border-obsidian-800"
                      >
                        <Hash className="h-2.5 w-2.5 text-slate-500" />
                        {tag.replace('#', '')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right claimant & inspect action */}
                <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-obsidian-850">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                    <User className="h-3 w-3 text-slate-500" />
                    <span className="truncate max-w-[130px]">{bounty.claimant}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 group-hover:text-emerald-300 transition-colors">
                    Inspect
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
