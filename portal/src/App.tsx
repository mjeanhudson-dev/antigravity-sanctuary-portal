import { useState, useMemo } from 'react';
import { VitalsHeader } from './components/VitalsHeader';
import { NexusHelmSteeringDeck } from './components/NexusHelmSteeringDeck';
import { VentureIncubatorPanel } from './components/VentureIncubatorPanel';
import { BountyLedger } from './components/BountyLedger';
import { BountyDetailDrawer } from './components/BountyDetailDrawer';
import { DomainOverlayPanel } from './components/DomainOverlayPanel';
import { ProjectNodesPanel } from './components/ProjectNodesPanel';
import { INITIAL_BOUNTIES, DOMAIN_TAGS } from './data/hubData';
import type { Bounty } from './data/hubData';

export function App() {
  const [bounties, setBounties] = useState<Bounty[]>(INITIAL_BOUNTIES);
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtering pipeline
  const filteredBounties = useMemo(() => {
    return bounties.filter((bounty) => {
      // 1. Status Filter
      if (statusFilter !== 'ALL' && bounty.status !== statusFilter) {
        return false;
      }
      // 2. Domain Tag Filter
      if (activeTag && !bounty.domainTags.includes(activeTag)) {
        return false;
      }
      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = bounty.title.toLowerCase().includes(query);
        const matchesId = bounty.id.toLowerCase().includes(query);
        const matchesSummary = bounty.summary.toLowerCase().includes(query);
        const matchesClaimant = bounty.claimant.toLowerCase().includes(query);
        const matchesTag = bounty.domainTags.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesId && !matchesSummary && !matchesClaimant && !matchesTag) {
          return false;
        }
      }
      return true;
    });
  }, [bounties, statusFilter, activeTag, searchQuery]);

  const completedCount = useMemo(() => {
    return bounties.filter((b) => b.status === 'COMPLETED').length;
  }, [bounties]);

  // Handle in-place live status update
  const handleStatusChange = (bountyId: string, newStatus: Bounty['status']) => {
    setBounties((prev) =>
      prev.map((b) => (b.id === bountyId ? { ...b, status: newStatus } : b))
    );
    setSelectedBounty((prev) => (prev && prev.id === bountyId ? { ...prev, status: newStatus } : prev));
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col">
      {/* Top Persistent Vitals Header */}
      <VitalsHeader
        bountyCount={bounties.length}
        completedCount={completedCount}
      />

      {/* Main Operational Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Interactive NexusHelm 5-Speed Autonomy Gearbox & Rule-of-3 Steering Deck */}
        <NexusHelmSteeringDeck />

        {/* Complete 6-Track Venture Incubator Telemetry & 4 Public GitHub Repo Showcase */}
        <VentureIncubatorPanel />

        {/* 2-Column Bounty Ledger & Domain / Repository Node Registry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Central Bounty Ledger (8 of 12 cols = 66%) */}
          <section className="lg:col-span-8 space-y-6">
            <BountyLedger
              bounties={filteredBounties}
              selectedBounty={selectedBounty}
              onSelectBounty={(b) => setSelectedBounty(b)}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeTag={activeTag}
              onClearTag={() => setActiveTag(null)}
            />
          </section>

          {/* Right Column: Domain Registry & Public GitHub Nodes (4 of 12 cols = 33%) */}
          <aside className="lg:col-span-4 space-y-6">
            <ProjectNodesPanel />

            <DomainOverlayPanel
              tags={DOMAIN_TAGS}
              selectedTag={activeTag}
              onSelectTag={setActiveTag}
            />
          </aside>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="border-t border-obsidian-850 bg-obsidian-900/60 py-4 px-6 text-center text-xs font-mono text-slate-400">
        <p>
          Antigravity Sanctuary Portal &bull; NexusHelm 5-Speed Steering Crucible &bull; 6 Venture Tracks &bull; 4 Public GitHub Repositories
        </p>
      </footer>

      {/* Slide-over Inspection & Action Drawer */}
      <BountyDetailDrawer
        bounty={selectedBounty}
        onClose={() => setSelectedBounty(null)}
        onStatusChange={handleStatusChange}
        onSelectTag={(tag) => setActiveTag(tag)}
      />
    </div>
  );
}

export default App;
