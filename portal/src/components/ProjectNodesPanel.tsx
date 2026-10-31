import React from 'react';
import { Network, FolderGit2, ExternalLink, GitBranch } from 'lucide-react';
import { PROJECT_NODES } from '../data/hubData';

export const ProjectNodesPanel: React.FC = () => {
  return (
    <div className="bg-obsidian-900 border border-obsidian-800 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-obsidian-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Network className="h-4 w-4 text-blue-400" />
          <span>Public GitHub &amp; Workspace Nodes</span>
        </div>
        <span className="font-mono text-[11px] text-emerald-400">
          4 Public Repos Synced
        </span>
      </div>

      <div className="space-y-2.5">
        {PROJECT_NODES.map((node) => (
          <div
            key={node.name}
            className="p-3 rounded bg-obsidian-850 border border-obsidian-800/80 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-200 truncate">
                <FolderGit2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{node.name}</span>
              </div>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                  node.status === 'ONLINE'
                    ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                    : node.status === 'SYNCED'
                    ? 'bg-blue-950/60 border-blue-800/80 text-blue-300'
                    : 'bg-obsidian-800 border-obsidian-700 text-slate-400'
                }`}
              >
                {node.status}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-snug">
              {node.domain}
            </p>

            <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
              <a
                href={node.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 truncate"
              >
                <span className="truncate">{node.githubRepo}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
              <span className="text-slate-300 tabular-nums shrink-0">
                {node.completedBounties}/{node.totalBounties} Bounties
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-obsidian-800/60">
              <span className="flex items-center gap-1 text-amber-300/90 truncate">
                <GitBranch className="h-3 w-3 shrink-0" />
                <span className="truncate">{node.branchIsolation}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
