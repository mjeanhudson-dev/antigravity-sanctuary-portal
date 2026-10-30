import React from 'react';
import { X, Copy, Check, FileCode, CheckCircle2, Clock, User, GitBranch, Shield } from 'lucide-react';
import type { Bounty } from '../data/hubData';

interface BountyDetailDrawerProps {
  bounty: Bounty | null;
  onClose: () => void;
  onStatusChange: (bountyId: string, newStatus: Bounty['status']) => void;
  onSelectTag: (tag: string) => void;
}

export const BountyDetailDrawer: React.FC<BountyDetailDrawerProps> = ({
  bounty,
  onClose,
  onStatusChange,
  onSelectTag,
}) => {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!bounty) return null;

  const handleCopy = () => {
    const text = `[${bounty.id}] ${bounty.title} (Status: ${bounty.status}, Claimant: ${bounty.claimant}, Milestone: ${bounty.milestone})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: Bounty['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80';
      case 'IN_PROGRESS':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/80';
      case 'CLAIMED':
        return 'text-blue-400 bg-blue-950/60 border-blue-800/80';
      case 'BLOCKED':
        return 'text-rose-400 bg-rose-950/60 border-rose-800/80';
      default:
        return 'text-slate-300 bg-obsidian-850 border-obsidian-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-obsidian-900 border-l border-obsidian-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          {/* Top action bar */}
          <div className="flex items-center justify-between pb-4 border-b border-obsidian-800">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-obsidian-800 border border-obsidian-700 text-slate-200">
                {bounty.id}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded border font-mono font-medium ${getStatusColor(bounty.status)}`}>
                {bounty.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded hover:bg-obsidian-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Copy markdown reference"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded hover:bg-obsidian-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Close drawer (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Title & Summary */}
          <div>
            <h2 className="text-lg font-semibold text-slate-100 leading-snug">
              {bounty.title}
            </h2>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed bg-obsidian-950/80 p-3.5 rounded border border-obsidian-800/80">
              {bounty.summary}
            </p>
          </div>

          {/* Detailed metadata matrix */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded bg-obsidian-850 border border-obsidian-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <User className="h-3.5 w-3.5" />
                <span>Claimant Owner</span>
              </div>
              <p className="font-medium text-slate-200 truncate">{bounty.claimant}</p>
            </div>

            <div className="p-3 rounded bg-obsidian-850 border border-obsidian-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                <span>Timestamp</span>
              </div>
              <p className="font-medium text-slate-200">{bounty.dates}</p>
            </div>

            <div className="p-3 rounded bg-obsidian-850 border border-obsidian-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <GitBranch className="h-3.5 w-3.5" />
                <span>Target Project</span>
              </div>
              <p className="font-medium text-slate-200 truncate">{bounty.project}</p>
            </div>

            <div className="p-3 rounded bg-obsidian-850 border border-obsidian-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Shield className="h-3.5 w-3.5" />
                <span>Handoff Milestone</span>
              </div>
              <p className="font-medium text-emerald-400">{bounty.milestone}</p>
            </div>
          </div>

          {/* Artifacts & Verification proofs */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <FileCode className="h-3.5 w-3.5" />
              <span>Verified Artifacts & Proofs</span>
            </div>
            <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800 text-xs font-mono text-slate-300">
              {bounty.artifacts}
            </div>
          </div>

          {/* Dependencies */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Task Dependencies</span>
            </div>
            <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800 text-xs font-mono text-slate-300">
              {bounty.dependencies}
            </div>
          </div>

          {/* Domain Tags */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400">
              Associated Domain Overlays
            </div>
            <div className="flex flex-wrap gap-1.5">
              {bounty.domainTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    onSelectTag(tag);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded bg-obsidian-800 hover:bg-obsidian-750 border border-obsidian-700 text-xs font-mono text-slate-300 hover:text-emerald-300 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* State Toggle Action Panel */}
        <div className="pt-6 border-t border-obsidian-800 space-y-3">
          <div className="text-xs font-mono text-slate-400">Update Bounty Status (Live Handoff)</div>
          <div className="grid grid-cols-3 gap-2">
            {(['OPEN', 'CLAIMED', 'IN_PROGRESS', 'COMPLETED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onStatusChange(bounty.id, st)}
                className={`py-2 px-3 text-xs font-mono font-medium rounded border transition-colors ${
                  bounty.status === st
                    ? 'bg-slate-100 text-obsidian-950 border-white'
                    : 'bg-obsidian-850 hover:bg-obsidian-800 text-slate-300 border-obsidian-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
