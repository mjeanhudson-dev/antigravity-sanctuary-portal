import React, { useState } from 'react';
import {
  Flame,
  ArrowUpRight,
  Check,
  DollarSign,
  GitBranch,
  Cpu,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { VENTURE_TRACKS, PUBLIC_GITHUB_REPOS } from '../data/hubData';

export const VentureIncubatorPanel: React.FC = () => {
  const [selectedTrackId, setSelectedTrackId] = useState<string>('ALL');

  const visibleTracks =
    selectedTrackId === 'ALL'
      ? VENTURE_TRACKS
      : VENTURE_TRACKS.filter((t) => t.id === selectedTrackId);

  return (
    <div className="bg-obsidian-900 border border-obsidian-800 rounded-lg p-5 space-y-5">
      {/* Header & Track Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-obsidian-800">
        <div>
          <div className="flex items-center gap-2 text-base font-semibold text-slate-100">
            <Flame className="h-5 w-5 text-amber-400" />
            <span>Venture Incubator Telemetry &amp; 6-Track Patent Vault</span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/80 text-amber-300">
              6 Active Tracks
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            High-Moat Human + Multi-AI Synthesis &bull; Revenue Wedges &bull; Cryptographic &amp; Physics Prototypes
          </p>
        </div>

        {/* Filter pills (default ALL so all 6 tracks are rendered and visible) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedTrackId('ALL')}
            className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors ${
              selectedTrackId === 'ALL'
                ? 'bg-slate-100 text-obsidian-950 border-white font-semibold'
                : 'bg-obsidian-950 text-slate-400 border-obsidian-800 hover:text-slate-200'
            }`}
          >
            ALL 6 TRACKS
          </button>
          {VENTURE_TRACKS.map((tr) => (
            <button
              key={tr.id}
              type="button"
              onClick={() => setSelectedTrackId(tr.id === selectedTrackId ? 'ALL' : tr.id)}
              className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors ${
                selectedTrackId === tr.id
                  ? 'bg-amber-400 text-obsidian-950 border-amber-300 font-semibold'
                  : 'bg-obsidian-950 text-slate-400 border-obsidian-800 hover:text-slate-200'
              }`}
            >
              T{tr.trackNumber}: {tr.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Public GitHub Repositories Fleet Bar */}
      <div className="p-3.5 rounded bg-obsidian-950 border border-obsidian-800 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs font-mono">
          <span className="text-slate-200 font-semibold flex items-center gap-1.5">
            <GitBranch className="h-3.5 w-3.5 text-emerald-400" />
            <span>Public GitHub Fleet (4 Repositories &bull; Isolated Project Branches)</span>
          </span>
          <span className="text-emerald-400 text-[11px]">
            Master Invariant: Thinking Overlay Untouched
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PUBLIC_GITHUB_REPOS.map((repo) => (
            <a
              key={repo.slug}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-2.5 rounded bg-obsidian-900 hover:bg-obsidian-850 border border-obsidian-800 hover:border-emerald-600/70 transition-all flex flex-col justify-between gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1 font-mono text-xs font-semibold text-emerald-300 group-hover:text-emerald-200">
                  <span className="truncate">{repo.slug}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                  {repo.description}
                </p>
              </div>
              <div className="pt-1.5 border-t border-obsidian-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className="text-amber-300">{repo.primaryTrack}</span>
                <span className="text-emerald-400">{repo.verificationBadge}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Showcase Cards Grid for All 6 Venture Tracks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleTracks.map((track) => (
          <div
            key={track.id}
            className="p-4 rounded-lg bg-obsidian-950 border border-obsidian-800 hover:border-obsidian-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Track Badge & Status */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-amber-950/70 border border-amber-800/80 text-amber-300">
                  Track {track.trackNumber}
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>{track.status}</span>
                </span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h3 className="text-base font-semibold text-slate-100 leading-snug">
                  {track.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {track.tagline}
                </p>
              </div>

              {/* Revenue Wedge & Live Telemetry Box */}
              <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-obsidian-900 border border-obsidian-800 space-y-1">
                  <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Commercial Revenue Wedge</span>
                  </div>
                  <p className="text-slate-200 leading-snug">{track.revenueWedge}</p>
                </div>

                <div className="p-2.5 rounded bg-obsidian-900 border border-obsidian-800 space-y-1">
                  <div className="flex items-center gap-1 text-blue-400 text-[11px] font-semibold">
                    <Cpu className="h-3.5 w-3.5" />
                    <span>Live Crucible Telemetry &amp; Moat</span>
                  </div>
                  <p className="text-amber-300 text-[11px]">{track.telemetryHighlight}</p>
                  <p className="text-slate-400 text-[11px] leading-snug">{track.moat}</p>
                </div>
              </div>

              {/* Key Components */}
              <div className="space-y-1.5 text-xs">
                <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                  Verified Architecture Primitives
                </div>
                <ul className="space-y-1">
                  {track.keyComponents.map((comp) => (
                    <li key={comp} className="flex items-start gap-2 text-slate-300">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-tight text-[11px]">{comp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer Link to Public GitHub Repo */}
            <div className="pt-3 border-t border-obsidian-800 flex items-center justify-between gap-2 text-xs font-mono">
              <span className="text-[11px] text-slate-500 truncate" title={track.prototypePath}>
                {track.prototypePath}
              </span>
              <a
                href={track.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 shrink-0 font-medium"
              >
                <span>{track.githubRepo}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
