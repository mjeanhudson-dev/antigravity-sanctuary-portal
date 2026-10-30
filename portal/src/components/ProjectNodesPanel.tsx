import React from 'react';
import { Network, FolderGit2 } from 'lucide-react';
import { PROJECT_NODES } from '../data/hubData';

export const ProjectNodesPanel: React.FC = () => {
  return (
    <div className="bg-obsidian-900 border border-obsidian-800 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-obsidian-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Network className="h-4 w-4 text-blue-400" />
          <span>Repository Nodes</span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">
          4 Registered
        </span>
      </div>

      <div className="space-y-2.5">
        {PROJECT_NODES.map((node) => (
          <div
            key={node.name}
            className="p-3 rounded bg-obsidian-850 border border-obsidian-800/80 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-200">
                <FolderGit2 className="h-3.5 w-3.5 text-slate-400" />
                <span>{node.name}</span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                node.status === 'ONLINE'
                  ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                  : node.status === 'SYNCED'
                  ? 'bg-blue-950/60 border-blue-800/80 text-blue-300'
                  : 'bg-obsidian-800 border-obsidian-700 text-slate-400'
              }`}>
                {node.status}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 line-clamp-1">
              {node.domain}
            </p>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-obsidian-800/50">
              <span className="truncate max-w-[150px]">{node.techStack}</span>
              <span className="text-slate-300 tabular-nums">
                {node.completedBounties}/{node.totalBounties} Bounties
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
