import React, { useState, useMemo } from 'react';
import {
  Gauge,
  ShieldAlert,
  ShieldCheck,
  GitFork,
  Sliders,
  Zap,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Gamepad2,
  Terminal,
  Sparkles,
} from 'lucide-react';
import {
  NEXUSHELM_GEARS,
  RULE_OF_3_FORKS,
  clampBlastRadius,
  computeDeterministicHex,
  computeDualSenseHapticTelemetry,
  evaluateNexusHelmAirlockGate,
} from '../data/hubData';
import type {
  GearId,
  ForkArchetype,
  TaintLevel,
} from '../data/hubData';

interface AuditEntry {
  id: string;
  timestamp: string;
  gear: GearId;
  fork: string;
  blastRadius: number;
  taint: TaintLevel;
  verdict: string;
  digest: string;
}

const TAINT_LEVELS: {
  id: TaintLevel;
  rank: number;
  label: string;
  badgeClass: string;
  note: string;
}[] = [
  {
    id: 'HUMAN_ROOT',
    rank: 4,
    label: 'HUMAN_ROOT (Rank 4)',
    badgeClass: 'bg-emerald-950/70 border-emerald-700/80 text-emerald-300',
    note: 'Cryptographically signed human steering vector',
  },
  {
    id: 'PINPOINT_VERIFIED',
    rank: 3,
    label: 'PINPOINT_VERIFIED (Rank 3)',
    badgeClass: 'bg-blue-950/70 border-blue-700/80 text-blue-300',
    note: '100% deterministic compiled test suite verified',
  },
  {
    id: 'INTERNAL_AGENT',
    rank: 2,
    label: 'INTERNAL_AGENT (Rank 2)',
    badgeClass: 'bg-amber-950/70 border-amber-700/80 text-amber-300',
    note: 'Typed semantic IPC envelope; unverified local synthesis',
  },
  {
    id: 'EXTERNAL_UNTRUSTED',
    rank: 1,
    label: 'EXTERNAL_UNTRUSTED (Rank 1)',
    badgeClass: 'bg-rose-950/70 border-rose-700/80 text-rose-300',
    note: 'Dirty-logic Drive / web payload — unconditionally quarantined',
  },
];

export const NexusHelmSteeringDeck: React.FC = () => {
  const [selectedGearId, setSelectedGearId] = useState<GearId>('G3');
  const [blastRadius, setBlastRadius] = useState<number>(48);
  const [taintLevel, setTaintLevel] = useState<TaintLevel>('PINPOINT_VERIFIED');
  const [selectedFork, setSelectedFork] = useState<ForkArchetype | 'CUSTOM'>('Balanced');
  const [customDirective, setCustomDirective] = useState<string>(
    'Isolate each venture track into dedicated branches; preserve master Thinking Overlay untouched; enforce 100% PINPOINT pass.'
  );
  const [appliedCustomDirective, setAppliedCustomDirective] = useState<string | null>(null);
  const [customInputError, setCustomInputError] = useState<string | null>(null);
  const [r2Ratified, setR2Ratified] = useState<boolean>(false);
  const [receiptSeq, setReceiptSeq] = useState<number>(2);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([
    {
      id: 'RAT-001',
      timestamp: '21:00:00 UTC',
      gear: 'G3',
      fork: 'Balanced (Path B)',
      blastRadius: 48,
      taint: 'PINPOINT_VERIFIED',
      verdict: 'AUTO-CRUISE RATIFIED (B(a)=48 < 70)',
      digest: 'sha256:8f4a2e19c70b51d2',
    },
  ]);

  const currentGear = useMemo(
    () => NEXUSHELM_GEARS.find((g) => g.id === selectedGearId) ?? NEXUSHELM_GEARS[2],
    [selectedGearId]
  );

  const clampedBlastRadius = clampBlastRadius(blastRadius);

  const hapticTelemetry = useMemo(
    () => computeDualSenseHapticTelemetry(clampedBlastRadius, selectedGearId),
    [clampedBlastRadius, selectedGearId]
  );

  const gateEvaluation = useMemo(
    () => evaluateNexusHelmAirlockGate(selectedGearId, clampedBlastRadius, taintLevel, r2Ratified),
    [selectedGearId, clampedBlastRadius, taintLevel, r2Ratified]
  );

  const handleSelectGear = (gearId: GearId) => {
    setSelectedGearId(gearId);
    setCustomInputError(null);
    setR2Ratified(false);
  };

  const handleBlastRadiusChange = (val: number) => {
    setBlastRadius(clampBlastRadius(val));
    setR2Ratified(false);
  };

  const handleSelectFork = (fork: ForkArchetype) => {
    const spec = RULE_OF_3_FORKS.find((f) => f.id === fork);
    setSelectedFork(fork);
    setAppliedCustomDirective(null);
    setCustomInputError(null);
    setR2Ratified(false);
    if (spec) {
      setBlastRadius(spec.estimatedBlastRadius);
    }
  };

  const handleApplyCustomOverride = () => {
    if (selectedGearId === 'G0') {
      setCustomInputError('G0 Hard E-Brake is engaged. Shift into G1–G4 before ratifying a custom override.');
      return;
    }
    if (taintLevel === 'EXTERNAL_UNTRUSTED') {
      setCustomInputError('Payload is quarantined (EXTERNAL_UNTRUSTED). Clear taint before ratifying.');
      return;
    }
    const trimmed = customDirective.trim();
    if (!trimmed) {
      setCustomInputError('Pilot override vector cannot be empty. Enter a clear directive.');
      return;
    }
    setCustomInputError(null);
    setSelectedFork('CUSTOM');
    setAppliedCustomDirective(trimmed);
    setTaintLevel('HUMAN_ROOT');
    setR2Ratified(true);

    const receiptId = `RAT-${String(receiptSeq).padStart(3, '0')}`;
    setReceiptSeq((prev) => prev + 1);
    const digest = computeDeterministicHex(`${selectedGearId}|CUSTOM|${trimmed}|${clampedBlastRadius}`);
    const newEntry: AuditEntry = {
      id: receiptId,
      timestamp: new Date().toISOString().slice(11, 19) + ' UTC',
      gear: selectedGearId,
      fork: `Custom Override: "${trimmed.slice(0, 48)}${trimmed.length > 48 ? '...' : ''}"`,
      blastRadius: clampedBlastRadius,
      taint: 'HUMAN_ROOT',
      verdict: 'CUSTOM PILOT VECTOR RATIFIED',
      digest,
    };
    setAuditLog((prev) => [newEntry, ...prev.slice(0, 4)]);
  };

  const handlePullR2Ratify = () => {
    if (selectedGearId === 'G0' || taintLevel === 'EXTERNAL_UNTRUSTED') {
      return;
    }
    setR2Ratified(true);
    const receiptId = `RAT-${String(receiptSeq).padStart(3, '0')}`;
    setReceiptSeq((prev) => prev + 1);
    const forkLabel =
      selectedFork === 'CUSTOM'
        ? `Custom (${appliedCustomDirective?.slice(0, 32) ?? 'Pilot Vector'})`
        : `${selectedFork} Fork`;
    const digest = computeDeterministicHex(
      `${selectedGearId}|${forkLabel}|${clampedBlastRadius}|${taintLevel}`
    );
    const newEntry: AuditEntry = {
      id: receiptId,
      timestamp: new Date().toISOString().slice(11, 19) + ' UTC',
      gear: selectedGearId,
      fork: forkLabel,
      blastRadius: clampedBlastRadius,
      taint: taintLevel,
      verdict: `0x21/0x26 R2 DETENT RATIFIED (B(a)=${clampedBlastRadius})`,
      digest,
    };
    setAuditLog((prev) => [newEntry, ...prev.slice(0, 4)]);
  };

  return (
    <div className="bg-obsidian-900 border border-obsidian-800 rounded-lg p-5 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-obsidian-800">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-slate-100">
              NexusHelm 5-Speed Autonomy Gearbox &amp; Rule-of-3 Steering Deck
            </h2>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/80 text-emerald-300">
              Track 5 Crucible
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sovereign In-Between Agent Mediator &bull; Typed Semantic IPC Airlock &bull; DualSense{' '}
            <code className="text-emerald-300">0x21</code> / <code className="text-amber-300">0x26</code>{' '}
            Haptic Ratification
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-obsidian-950 border border-obsidian-800 text-slate-300">
            Phantom Broker: <span className="text-emerald-400">phantom://v1/simmer/9a4f</span>
          </span>
          <span className="px-2.5 py-1 rounded bg-obsidian-950 border border-obsidian-800 text-slate-300">
            Master Branch: <span className="text-emerald-400">Thinking Overlay (Untouched)</span>
          </span>
        </div>
      </div>

      {/* SECTION 1: Interactive 5-Speed Gearbox Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-emerald-400" />
            <span>1. Interactive 5-Speed Autonomy Gearbox Selector</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Active Gear: <strong className="text-slate-100">{currentGear.label}</strong> ({currentGear.code})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {NEXUSHELM_GEARS.map((gear) => {
            const isSelected = gear.id === selectedGearId;
            const isEBrake = gear.id === 'G0';

            let cardStyle = 'bg-obsidian-950 hover:bg-obsidian-850 border-obsidian-800 text-slate-300';
            if (isSelected && isEBrake) {
              cardStyle = 'bg-rose-950/60 border-rose-500 text-rose-100 shadow-sm';
            } else if (isSelected) {
              cardStyle = 'bg-emerald-950/40 border-emerald-500 text-slate-100 shadow-sm';
            } else if (isEBrake) {
              cardStyle = 'bg-obsidian-950 hover:bg-rose-950/30 border-rose-900/60 text-rose-300';
            }

            return (
              <button
                key={gear.id}
                type="button"
                onClick={() => handleSelectGear(gear.id)}
                className={`text-left p-3 rounded border transition-all flex flex-col justify-between gap-2 ${cardStyle}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-xs font-bold tracking-tight">
                      {gear.label}
                    </span>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                        isEBrake
                          ? 'bg-rose-950 border-rose-800 text-rose-300'
                          : 'bg-obsidian-850 border-obsidian-700 text-slate-300'
                      }`}
                    >
                      {gear.triggerModeHex}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {gear.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-obsidian-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Auto Gate:</span>
                  <span className="font-semibold tabular-nums text-emerald-300">
                    {gear.maxAutoBlastRadius < 0
                      ? 'LOCKED (0%)'
                      : gear.maxAutoBlastRadius === 0
                      ? 'MANUAL CLUTCH'
                      : `B(a) < ${gear.maxAutoBlastRadius}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Gear Details Box */}
        <div className="p-3.5 rounded bg-obsidian-950 border border-obsidian-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="font-mono text-[11px] text-slate-400 block">Gear Mode &amp; Policy</span>
            <p className="text-slate-200 font-medium mt-0.5">{currentGear.securityPolicy}</p>
          </div>
          <div>
            <span className="font-mono text-[11px] text-slate-400 block">Human Pilot Agency Role</span>
            <p className="text-slate-300 mt-0.5">{currentGear.humanRole}</p>
          </div>
          <div>
            <span className="font-mono text-[11px] text-slate-400 block">Live Airlock Verdict</span>
            <div className={`mt-1 px-2.5 py-1 rounded border font-mono text-[11px] ${gateEvaluation.badgeClass}`}>
              {gateEvaluation.title}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Live Blast-Radius B(a) Simulator & DualSense 0x21/0x26 Trigger Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Blast Radius B(a) Control & Taint Lattice (7 cols) */}
        <div className="lg:col-span-7 p-4 rounded bg-obsidian-950 border border-obsidian-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>2. Live Blast-Radius Threshold Simulator B(a) ∈ [0, 100]</span>
            </div>
            <span className="font-mono text-sm font-bold px-2.5 py-0.5 rounded bg-obsidian-850 border border-obsidian-700 text-emerald-300 tabular-nums">
              B(a) = {clampedBlastRadius} / 100
            </span>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={100}
              value={clampedBlastRadius}
              onChange={(e) => handleBlastRadiusChange(Number(e.target.value))}
              aria-label="Blast Radius B(a)"
              className="w-full accent-emerald-400 cursor-pointer"
            />

            {/* Segmented Threshold Scale */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
              <div
                className={`p-2 rounded border ${
                  clampedBlastRadius < 20
                    ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                    : 'bg-obsidian-900 border-obsidian-800 text-slate-400'
                }`}
              >
                <div className="font-bold">0 ≤ B(a) &lt; 20</div>
                <div>Zero Friction • Passive Read</div>
              </div>
              <div
                className={`p-2 rounded border ${
                  clampedBlastRadius >= 20 && clampedBlastRadius < 70
                    ? 'bg-amber-950/60 border-amber-600 text-amber-200'
                    : 'bg-obsidian-900 border-obsidian-800 text-slate-400'
                }`}
              >
                <div className="font-bold">20 ≤ B(a) &lt; 70</div>
                <div>Soft Friction • Local Branch Diff</div>
              </div>
              <div
                className={`p-2 rounded border ${
                  clampedBlastRadius >= 70
                    ? 'bg-rose-950/60 border-rose-600 text-rose-200'
                    : 'bg-obsidian-900 border-obsidian-800 text-slate-400'
                }`}
              >
                <div className="font-bold">70 ≤ B(a) ≤ 100</div>
                <div>Hard Detent • 0x21 + 0x26 40Hz</div>
              </div>
            </div>
          </div>

          {/* Quick Boundary Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-mono text-slate-400 mr-1">Test Presets:</span>
            {[
              { label: 'Read Telemetry (8)', val: 8 },
              { label: 'Boundary (20)', val: 20 },
              { label: 'Local Diff (48)', val: 48 },
              { label: 'Detent Gate (70)', val: 70 },
              { label: 'Public GitHub Push (78)', val: 78 },
              { label: 'Max Deploy (100)', val: 100 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleBlastRadiusChange(preset.val)}
                className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
                  clampedBlastRadius === preset.val
                    ? 'bg-slate-100 text-obsidian-950 border-white font-semibold'
                    : 'bg-obsidian-900 hover:bg-obsidian-800 border-obsidian-800 text-slate-300'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Monotonic Taint Lattice Selector */}
          <div className="pt-2 border-t border-obsidian-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Monotonic Information-Flow Taint Lattice:</span>
              <span className="text-slate-300">T_out = min(T_in, T_source)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {TAINT_LEVELS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTaintLevel(t.id);
                    setR2Ratified(false);
                  }}
                  className={`p-2 rounded border text-left font-mono text-[10px] transition-all ${
                    taintLevel === t.id
                      ? t.badgeClass
                      : 'bg-obsidian-900 hover:bg-obsidian-850 border-obsidian-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold truncate">{t.id}</div>
                  <div className="text-[9px] opacity-80 line-clamp-1 mt-0.5">{t.note}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DualSense 0x21/0x26 Trigger Resistance Visualizer (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded bg-obsidian-950 border border-obsidian-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Gamepad2 className="h-4 w-4 text-emerald-400" />
                <span>DualSense 0x21 / 0x26 Trigger Telemetry</span>
              </div>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-obsidian-850 border border-obsidian-700 text-amber-300">
                {hapticTelemetry.frequencyHz > 0 ? `${hapticTelemetry.frequencyHz} Hz Pulse` : 'Static'}
              </span>
            </div>

            <div className="p-2.5 rounded bg-obsidian-900 border border-obsidian-800 text-xs font-mono space-y-1">
              <div className="text-emerald-300 font-semibold">{hapticTelemetry.modeLabel}</div>
              <div className="text-[11px] text-slate-400">{hapticTelemetry.zoneBanner}</div>
            </div>

            {/* L2 and R2 Resistance Bars */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">
                    L2 Clutch / Brake Resistance (Mode <code className="text-emerald-300">{hapticTelemetry.l2ModeHex}</code>)
                  </span>
                  <span className="text-slate-200 tabular-nums">
                    {hapticTelemetry.newtons} N ({hapticTelemetry.forcePercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-obsidian-900 rounded overflow-hidden border border-obsidian-800">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-200"
                    style={{ width: `${hapticTelemetry.forcePercent}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">
                    R2 Ratification Detent (Mode <code className="text-amber-300">{hapticTelemetry.r2ModeHex}</code> @ {hapticTelemetry.frequencyHz}Hz)
                  </span>
                  <span className="text-amber-300 tabular-nums">
                    Start {hapticTelemetry.startZone} • Force {hapticTelemetry.forceByteHex}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-obsidian-900 rounded overflow-hidden border border-obsidian-800">
                  <div
                    className={`h-full transition-all duration-200 ${
                      clampedBlastRadius >= 70 || selectedGearId === 'G0'
                        ? 'bg-rose-500'
                        : clampedBlastRadius >= 20
                        ? 'bg-amber-400'
                        : 'bg-blue-400'
                    }`}
                    style={{ width: `${hapticTelemetry.forcePercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Raw 64-byte USB HID Output Report 0x02 slice */}
            <div className="p-2.5 rounded bg-obsidian-900 border border-obsidian-800 font-mono text-[11px] space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <Terminal className="h-3 w-3 text-emerald-400" />
                  <span>HID Out Report [0x02] Actuator Bytes:</span>
                </span>
                <span className="text-[10px] text-slate-500">250 Hz USB</span>
              </div>
              <div className="text-emerald-300 tracking-wider truncate">
                {hapticTelemetry.hidPacketHex}
              </div>
            </div>
          </div>

          {/* Interactive R2 Trigger Pull Ratification Action */}
          <div className="pt-2 border-t border-obsidian-800 flex items-center justify-between gap-2">
            <div className="text-[11px] font-mono text-slate-400">
              {gateEvaluation.status === 'AUTO_APPROVED' ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Unlock className="h-3.5 w-3.5" /> Auto-Cruising within Gear Gate
                </span>
              ) : gateEvaluation.status === 'RATIFIED' ? (
                <span className="text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Detent Overcome &amp; Signed
                </span>
              ) : (
                <span className="text-amber-300 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" /> Physical R2 Pull Required
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={selectedGearId === 'G0' || taintLevel === 'EXTERNAL_UNTRUSTED'}
              onClick={handlePullR2Ratify}
              className={`px-3 py-1.5 rounded font-mono text-xs font-medium border transition-colors ${
                selectedGearId === 'G0' || taintLevel === 'EXTERNAL_UNTRUSTED'
                  ? 'bg-obsidian-900 border-obsidian-800 text-slate-600 cursor-not-allowed'
                  : r2Ratified
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/80 text-amber-200'
              }`}
            >
              {r2Ratified ? 'R2 Detent Ratified ✓' : 'Pull R2 Past 0x21/0x26 Detent'}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: Mandatory Rule-of-3 Creative Tradeoff Forks + Custom Pilot Override */}
      <div className="space-y-3 pt-2 border-t border-obsidian-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <GitFork className="h-3.5 w-3.5 text-emerald-400" />
            <span>3. Mandatory Rule-of-3 Creative Tradeoff Forks (Anti-Fait-Accompli Invariant)</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Selected Direction:{' '}
            <strong className="text-emerald-300">
              {selectedFork === 'CUSTOM' ? 'Custom Pilot Override' : `${selectedFork} Fork`}
            </strong>
          </span>
        </div>

        {/* 3 Fork Cards: Conservative, Balanced, Visionary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {RULE_OF_3_FORKS.map((fork) => {
            const isActive = selectedFork === fork.id;
            return (
              <div
                key={fork.id}
                onClick={() => handleSelectFork(fork.id)}
                className={`p-4 rounded border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isActive
                    ? 'bg-obsidian-850 border-emerald-500/80 shadow-sm'
                    : 'bg-obsidian-950 hover:bg-obsidian-850 border-obsidian-800'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold text-slate-100">
                      {fork.label}
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-obsidian-900 border border-obsidian-700 text-emerald-300 tabular-nums">
                      B(a) = {fork.estimatedBlastRadius} • {fork.recommendedGear}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-amber-300">{fork.subtitle}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{fork.tradeoffSummary}</p>

                  <ul className="space-y-1 pt-1 text-[11px] text-slate-400">
                    {fork.architecturalActions.map((act) => (
                      <li key={act} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-obsidian-800 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400 truncate">{fork.riskProfile}</span>
                  <span className={isActive ? 'text-emerald-300 font-semibold' : 'text-slate-500'}>
                    {isActive ? 'ACTIVE FORK' : 'Select →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Pilot Override Input Box */}
        <div className="p-4 rounded bg-obsidian-950 border border-obsidian-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <label
              htmlFor="custom-pilot-override-input"
              className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Custom Pilot Override Vector (Blend Paths or Inject Sovereign Constraint)</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              Signs with <code className="text-emerald-300">HUMAN_ROOT</code> authority
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="custom-pilot-override-input"
              type="text"
              value={customDirective}
              onChange={(e) => {
                setCustomDirective(e.target.value);
                if (customInputError) setCustomInputError(null);
              }}
              placeholder="Enter custom pilot steering override or hybrid path directive..."
              className="flex-1 bg-obsidian-900 border border-obsidian-700 rounded px-3 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleApplyCustomOverride}
              className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-obsidian-950 font-mono text-xs font-semibold transition-colors shrink-0"
            >
              Ratify Custom Pilot Override
            </button>
          </div>

          {customInputError && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-rose-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{customInputError}</span>
            </div>
          )}

          {appliedCustomDirective && (
            <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-800/70 text-xs font-mono text-emerald-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-emerald-400 font-semibold">Active Pilot Override: </span>
                <span>{appliedCustomDirective}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 shrink-0">
                HUMAN_ROOT SIGNED
              </span>
            </div>
          )}
        </div>

        {/* Live Cryptographic Ratification Audit Trail */}
        <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              {gateEvaluation.status === 'HALTED' || gateEvaluation.status === 'QUARANTINED' ? (
                <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span>NexusHelm Signed Steering Receipts (Latest Ratifications)</span>
            </span>
            <span>Instruction Guard: SHA-256 Enforced</span>
          </div>
          <div className="space-y-1">
            {auditLog.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 rounded bg-obsidian-900 border border-obsidian-800/80 text-[11px] font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-semibold">{entry.id}</span>
                  <span className="text-slate-400">{entry.timestamp}</span>
                  <span className="px-1.5 py-0.5 rounded bg-obsidian-800 text-slate-200">
                    {entry.gear}
                  </span>
                  <span className="text-slate-300 truncate max-w-[260px]">{entry.fork}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-300">{entry.verdict}</span>
                  <span className="text-slate-500">{entry.digest}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
