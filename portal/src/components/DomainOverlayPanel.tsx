import React from 'react';
import { Tag, Hash } from 'lucide-react';
import type { DomainTag } from '../data/hubData';

interface DomainOverlayPanelProps {
  tags: DomainTag[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const DomainOverlayPanel: React.FC<DomainOverlayPanelProps> = ({
  tags,
  selectedTag,
  onSelectTag,
}) => {
  return (
    <div className="bg-obsidian-900 border border-obsidian-800 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-obsidian-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Tag className="h-4 w-4 text-emerald-400" />
          <span>Domain Overlay Registry</span>
        </div>
        {selectedTag && (
          <button
            type="button"
            onClick={() => onSelectTag(null)}
            className="text-xs font-mono text-emerald-400 hover:underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Cross-project reusable hardware, filter math, and protocol taxonomy to prevent redundant research.
      </p>

      <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
        {tags.map((item) => {
          const isSelected = selectedTag === item.tag;
          return (
            <button
              key={item.tag}
              type="button"
              onClick={() => onSelectTag(isSelected ? null : item.tag)}
              className={`w-full text-left p-2.5 rounded border text-xs transition-colors flex items-start justify-between gap-2 ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-600/70 text-emerald-200'
                  : 'bg-obsidian-850 hover:bg-obsidian-800 border-obsidian-800/80 text-slate-300'
              }`}
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1 font-mono font-medium truncate">
                  <Hash className="h-3 w-3 text-slate-500 shrink-0" />
                  <span className="truncate">{item.tag.replace('#', '')}</span>
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1">
                  {item.description}
                </div>
              </div>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-obsidian-800 text-slate-400 shrink-0 tabular-nums">
                {item.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
