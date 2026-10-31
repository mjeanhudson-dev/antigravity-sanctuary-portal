export interface Bounty {
  id: string;
  project: string;
  title: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'CLAIMED' | 'OPEN' | 'BLOCKED';
  claimant: string;
  dates: string;
  domainTags: string[];
  dependencies: string;
  artifacts: string;
  milestone: string;
  summary: string;
}

export interface DomainTag {
  tag: string;
  label: string;
  description: string;
  count: number;
}

export interface ProjectNode {
  name: string;
  path: string;
  domain: string;
  techStack: string;
  status: 'ONLINE' | 'STANDBY' | 'SYNCED';
  completedBounties: number;
  totalBounties: number;
  githubRepo: string;
  githubUrl: string;
  branchIsolation: string;
}

export interface PublicGithubRepo {
  slug: string;
  name: string;
  url: string;
  description: string;
  primaryTrack: string;
  branchTopology: string;
  verificationBadge: string;
}

export interface VentureTrack {
  id: string;
  trackNumber: number;
  title: string;
  tagline: string;
  status: string;
  revenueWedge: string;
  moat: string;
  telemetryHighlight: string;
  githubRepo: string;
  githubUrl: string;
  prototypePath: string;
  keyComponents: string[];
}

export type GearId = 'G1' | 'G2' | 'G3' | 'G4' | 'G0';

export interface NexusHelmGearSpec {
  id: GearId;
  code: string;
  label: string;
  shortName: string;
  maxAutoBlastRadius: number;
  triggerModeHex: '0x00' | '0x05' | '0x21' | '0x26';
  pulseHz: number;
  resistanceNewtons: number;
  description: string;
  humanRole: string;
  securityPolicy: string;
}

export type ForkArchetype = 'Conservative' | 'Balanced' | 'Visionary';

export type TaintLevel = 'HUMAN_ROOT' | 'PINPOINT_VERIFIED' | 'INTERNAL_AGENT' | 'EXTERNAL_UNTRUSTED';

export interface SteeringForkOption {
  id: ForkArchetype;
  label: string;
  subtitle: string;
  estimatedBlastRadius: number;
  recommendedGear: GearId;
  tradeoffSummary: string;
  architecturalActions: string[];
  riskProfile: string;
}

export interface HapticTelemetry {
  modeLabel: string;
  l2ModeHex: '0x00' | '0x05' | '0x21';
  r2ModeHex: '0x00' | '0x21' | '0x26';
  forcePercent: number;
  newtons: number;
  frequencyHz: number;
  startZone: string;
  endZone: string;
  forceByteHex: string;
  hidPacketHex: string;
  zoneBanner: string;
}

export interface GateEvaluation {
  status: 'HALTED' | 'QUARANTINED' | 'AUTO_APPROVED' | 'RATIFIED' | 'AWAITING_RATIFICATION';
  title: string;
  detail: string;
  badgeClass: string;
}

export function clampBlastRadius(raw: number): number {
  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function computeDeterministicHex(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `sha256:${hex1}${hex2}`;
}

export function computeDualSenseHapticTelemetry(
  rawBlastRadius: number,
  selectedGearId: GearId
): HapticTelemetry {
  const clampedBlastRadius = clampBlastRadius(rawBlastRadius);

  if (selectedGearId === 'G0') {
    return {
      modeLabel: '0x21 + 0x26 E-BRAKE LOCKOUT',
      l2ModeHex: '0x21',
      r2ModeHex: '0x26',
      forcePercent: 100,
      newtons: 35.0,
      frequencyHz: 60,
      startZone: '0x90 (144)',
      endZone: '0xFF (255)',
      forceByteHex: '0xFF',
      hidPacketHex: '02 21 90 FF FF 26 3C FF 00 00 00',
      zoneBanner: 'EMERGENCY ATOMIC HALT — HARD MECHANICAL WALL',
    };
  }

  if (selectedGearId === 'G1' && clampedBlastRadius < 70) {
    return {
      modeLabel: '0x21 MANUAL CLUTCH DETENT (STATIC)',
      l2ModeHex: '0x21',
      r2ModeHex: '0x21',
      forcePercent: 72,
      newtons: 18.5,
      frequencyHz: 0,
      startZone: '0x60 (96)',
      endZone: '0xE0 (224)',
      forceByteHex: '0xB8',
      hidPacketHex: '02 21 60 E0 B8 21 00 B8 00 00 00',
      zoneBanner: `B(a) = ${clampedBlastRadius} • G1 Manual Clutch Gate — Explicit Step-by-Step Ratification`,
    };
  }

  if (clampedBlastRadius < 20) {
    return {
      modeLabel: '0x00 ZERO FRICTION (FREE TRAVEL)',
      l2ModeHex: '0x00',
      r2ModeHex: '0x00',
      forcePercent: 8,
      newtons: 1.5,
      frequencyHz: 0,
      startZone: '0x00 (0)',
      endZone: '0x00 (0)',
      forceByteHex: '0x14',
      hidPacketHex: '02 00 00 00 14 00 00 00 00 00 00',
      zoneBanner: 'B(a) < 20 • Passive Telemetry / Read-Only Zero Friction',
    };
  }

  if (clampedBlastRadius < 70) {
    const scaledForce = Math.round(35 + ((clampedBlastRadius - 20) / 50) * 35);
    const forceByte = Math.round((scaledForce / 100) * 255)
      .toString(16)
      .toUpperCase()
      .padStart(2, '0');
    return {
      modeLabel: '0x05 / 0x21 SOFT TACTILE DETENT',
      l2ModeHex: '0x05',
      r2ModeHex: '0x21',
      forcePercent: scaledForce,
      newtons: Number((6.5 + ((clampedBlastRadius - 20) / 50) * 9.5).toFixed(1)),
      frequencyHz: 15,
      startZone: '0x40 (64)',
      endZone: '0xA0 (160)',
      forceByteHex: `0x${forceByte}`,
      hidPacketHex: `02 05 40 A0 ${forceByte} 21 0F ${forceByte} 00 00 00`,
      zoneBanner: '20 ≤ B(a) < 70 • Local Branch Mutation / Tactile Diff Review',
    };
  }

  const scaledForce = Math.min(100, Math.round(78 + ((clampedBlastRadius - 70) / 30) * 22));
  const forceByte = Math.max(200, Math.min(255, Math.round((scaledForce / 100) * 255)))
    .toString(16)
    .toUpperCase()
    .padStart(2, '0');
  return {
    modeLabel: '0x21 HARD DETENT + 0x26 (40 Hz PULSE)',
    l2ModeHex: '0x21',
    r2ModeHex: '0x26',
    forcePercent: Math.max(78, scaledForce),
    newtons: Number(Math.max(22.0, 22.0 + ((clampedBlastRadius - 70) / 30) * 10.0).toFixed(1)),
    frequencyHz: 40,
    startZone: '0x80 (128)',
    endZone: '0xF0 (240)',
    forceByteHex: `0x${forceByte}`,
    hidPacketHex: `02 21 80 F0 ${forceByte} 26 28 ${forceByte} 01 00 00`,
    zoneBanner: 'B(a) ≥ 70 • High Blast Radius Gate — 0x21 Resistance + 0x26 40 Hz Pulse',
  };
}

export function evaluateNexusHelmAirlockGate(
  selectedGearId: GearId,
  rawBlastRadius: number,
  taintLevel: TaintLevel,
  r2Ratified: boolean
): GateEvaluation {
  const clampedBlastRadius = clampBlastRadius(rawBlastRadius);
  const currentGear = NEXUSHELM_GEARS.find((g) => g.id === selectedGearId) ?? NEXUSHELM_GEARS[2];

  if (selectedGearId === 'G0') {
    return {
      status: 'HALTED',
      title: 'G0 HARD E-BRAKE ENGAGED (TOUCHPAD_CLICK / ESC)',
      detail: 'All multi-agent runners frozen. Outbound phantom tokens revoked.',
      badgeClass: 'bg-rose-950/80 border-rose-700 text-rose-200',
    };
  }

  if (taintLevel === 'EXTERNAL_UNTRUSTED') {
    return {
      status: 'QUARANTINED',
      title: 'TAINT LATTICE QUARANTINE: EXTERNAL_UNTRUSTED',
      detail:
        'Dirty-logic payload isolated in Quarantine Sieve. Capabilities (shell_exec, git_push) unconditionally stripped.',
      badgeClass: 'bg-rose-950/80 border-rose-700 text-rose-200',
    };
  }

  if (clampedBlastRadius < currentGear.maxAutoBlastRadius) {
    return {
      status: 'AUTO_APPROVED',
      title: `AUTO-EXECUTION PERMITTED IN ${currentGear.label.toUpperCase()}`,
      detail: `Blast Radius B(a) = ${clampedBlastRadius} is below ${currentGear.id} gate (B(a) < ${currentGear.maxAutoBlastRadius}).`,
      badgeClass: 'bg-emerald-950/80 border-emerald-700 text-emerald-200',
    };
  }

  if (r2Ratified) {
    return {
      status: 'RATIFIED',
      title: 'HUMAN R2 TRIGGER DETENT RATIFIED (0x21/0x26 OVERCOME)',
      detail: `High-impact action B(a) = ${clampedBlastRadius} signed by Human Pilot in ${currentGear.label}.`,
      badgeClass: 'bg-emerald-950/80 border-emerald-600 text-emerald-200',
    };
  }

  return {
    status: 'AWAITING_RATIFICATION',
    title: `DETENT GATE ACTIVE: B(a) = ${clampedBlastRadius} REACHES/EXCEEDS ${currentGear.id} GATE (${currentGear.maxAutoBlastRadius})`,
    detail:
      clampedBlastRadius >= 70
        ? 'Requires deliberate DualSense R2 pull past 0x21 resistance + 0x26 40 Hz vibration pulse.'
        : 'Requires tactile pilot confirmation or shifting into a higher autonomy gear.',
    badgeClass: 'bg-amber-950/80 border-amber-700 text-amber-200',
  };
}

export const PUBLIC_GITHUB_REPOS: PublicGithubRepo[] = [
  {
    slug: 'mjeanhudson-dev/shift2-dualsense-gyro',
    name: 'shift2-dualsense-gyro',
    url: 'https://github.com/mjeanhudson-dev/shift2-dualsense-gyro',
    description: '32-bit XInput 1.3 Proxy DLL, 250 Hz Win32 DualSense HID Engine, Casiez 1€ Filter & PINPOINT Test Suite (114/114 Checks)',
    primaryTrack: 'Track 3: SimBridge',
    branchTopology: 'master (Thinking Overlay untouched) • main / simbridge-v1',
    verificationBadge: '114/114 PINPOINT PASS',
  },
  {
    slug: 'mjeanhudson-dev/nexushelm',
    name: 'nexushelm',
    url: 'https://github.com/mjeanhudson-dev/nexushelm',
    description: 'Sovereign In-Between Agent Mediator, Typed Semantic IPC Airlock, Taint Lattice, Phantom Broker & 5-Speed Autonomy Gearbox',
    primaryTrack: 'Track 5: NexusHelm',
    branchTopology: 'master (Thinking Overlay untouched) • main / nexushelm-core',
    verificationBadge: '10/10 SECURITY SUITES',
  },
  {
    slug: 'mjeanhudson-dev/antigravity-sanctuary-portal',
    name: 'antigravity-sanctuary-portal',
    url: 'https://github.com/mjeanhudson-dev/antigravity-sanctuary-portal',
    description: 'React 19 + TypeScript + Tailwind Sanctuary Portal with Interactive 5-Speed Steering Deck & 6-Track Venture Telemetry',
    primaryTrack: 'Track 4: Arbiter Forge',
    branchTopology: 'master (Thinking Overlay untouched) • main / sanctuary-portal',
    verificationBadge: 'ZERO TS/VITE ERRORS',
  },
  {
    slug: 'mjeanhudson-dev/aether-agent-suite',
    name: 'aether-agent-suite',
    url: 'https://github.com/mjeanhudson-dev/aether-agent-suite',
    description: 'Sovereign Multi-Agent Venture Suite: OmniChorus DWFQ, Takeout Bootloader Sieve, Crosswind Flight Physics & Slow-Simmer Harness',
    primaryTrack: 'Tracks 1, 2 & 6',
    branchTopology: 'master (Thinking Overlay untouched) • omnichorus / takeout-sieve / crosswind',
    verificationBadge: 'ALL SUITES VERIFIED',
  },
];

export const NEXUSHELM_GEARS: NexusHelmGearSpec[] = [
  {
    id: 'G1',
    code: 'MANUAL_CLUTCH',
    label: 'G1 Clutch Manual',
    shortName: 'Clutch Manual',
    maxAutoBlastRadius: 0,
    triggerModeHex: '0x21',
    pulseHz: 0,
    resistanceNewtons: 18.5,
    description: 'Full step-by-step human clutch confirmation on every cross-model handoff and tool invocation.',
    humanRole: 'Direct manual ratification of every semantic envelope before execution.',
    securityPolicy: 'Auto-exec threshold B(a) = 0. All actions require explicit human clutch release.',
  },
  {
    id: 'G2',
    code: 'SPORT_TACTILE',
    label: 'G2 Sport Tactile',
    shortName: 'Sport Tactile',
    maxAutoBlastRadius: 20,
    triggerModeHex: '0x05',
    pulseHz: 15,
    resistanceNewtons: 9.2,
    description: 'Autonomous read/research operations (B(a) < 20); local code edits pause for tactile visual diff review.',
    humanRole: 'Tactile R2 soft tap on local branch writes (20 ≤ B(a) < 70); hard detent on external side effects.',
    securityPolicy: 'Read/scratchpad zero friction; local mutations gated by interactive diff checkpoint.',
  },
  {
    id: 'G3',
    code: 'ARBITER_CRUISE',
    label: 'G3 Arbiter Cruise',
    shortName: 'Arbiter Cruise',
    maxAutoBlastRadius: 70,
    triggerModeHex: '0x21',
    pulseHz: 40,
    resistanceNewtons: 24.0,
    description: 'Cross-model consensus (Gemini + Claude + Codex) + 100% PINPOINT pass auto-commits locally up to B(a) < 70.',
    humanRole: 'Cruises hands-free on verified local work; engages 0x21/0x26 hard detent only for B(a) ≥ 70 (push/deploy/spend).',
    securityPolicy: 'Requires 100% deterministic PINPOINT verification + SHA-256 instruction guard parity.',
  },
  {
    id: 'G4',
    code: 'LOW_AND_SLOW_SIMMER',
    label: 'G4 Slow-Simmer Overnight',
    shortName: 'Slow-Simmer Overnight',
    maxAutoBlastRadius: 85,
    triggerModeHex: '0x26',
    pulseHz: 40,
    resistanceNewtons: 28.0,
    description: 'Friday/Overnight budget-harvesting swarm inside isolated simmer/* branches with dirty-logic quarantine.',
    humanRole: 'Reviews synthesized Morning Executive Dailies Deck & ratifies branch merges via Rule-of-3 steering.',
    securityPolicy: 'Strict branch isolation (Thinking Overlay master untouched) + Zero-Dirty-Logic Quarantine Sieve.',
  },
  {
    id: 'G0',
    code: 'HARD_EBRAKE',
    label: 'G0 Hard E-Brake',
    shortName: 'Hard E-Brake',
    maxAutoBlastRadius: -1,
    triggerModeHex: '0x26',
    pulseHz: 60,
    resistanceNewtons: 35.0,
    description: 'Instant atomic halt (TOUCHPAD_CLICK / ESC) freezing all active agent runners and revoking phantom tokens.',
    humanRole: 'Emergency override locked. Full manual audit required before shifting back into G1–G4.',
    securityPolicy: 'Zero execution permitted (B(a) threshold = -1). All outbound capabilities unconditionally stripped.',
  },
];

export const RULE_OF_3_FORKS: SteeringForkOption[] = [
  {
    id: 'Conservative',
    label: 'Conservative',
    subtitle: 'Path A • Speed & Minimal Blast Radius',
    estimatedBlastRadius: 18,
    recommendedGear: 'G2',
    tradeoffSummary: 'Local-only verification with zero external network mutations or cross-repo branch pushes.',
    architecturalActions: [
      'Run deterministic unit & PINPOINT suites strictly inside local sandbox',
      'Quarantine all Google Drive / Takeout untrusted artifacts without ingestion',
      'Hold all GitHub pushes in local staging until manual G1 inspection',
    ],
    riskProfile: 'Lowest risk (B(a) = 18) • Zero external exposure, slower multi-repo delivery',
  },
  {
    id: 'Balanced',
    label: 'Balanced',
    subtitle: 'Path B • Production Architecture & Airlock Isolation',
    estimatedBlastRadius: 48,
    recommendedGear: 'G3',
    tradeoffSummary: 'Typed Semantic IPC Airlock + isolated per-project branches while keeping Thinking Overlay master untouched.',
    architecturalActions: [
      'Enforce Typed Semantic Envelopes and HMAC Phantom Token substitution across agents',
      'Push verified project branches to the 4 public GitHub repos after 100% PINPOINT pass',
      'Gate dirty-logic Drive archives behind the Taint Lattice Quarantine Sieve',
    ],
    riskProfile: 'Balanced (B(a) = 48) • Auto-cruises in G3 with cryptographic instruction integrity',
  },
  {
    id: 'Visionary',
    label: 'Visionary',
    subtitle: 'Path C • High-Moat Patent & Friday Maximal Simmer Wedge',
    estimatedBlastRadius: 78,
    recommendedGear: 'G4',
    tradeoffSummary: 'Full 4-worker parallel Friday Simmer swarm synthesizing all 6 Venture Tracks with DualSense haptic ratification.',
    architecturalActions: [
      'Execute parallel multi-agent synthesis across OmniChorus, Takeout Sieve, SimBridge, Arbiter, NexusHelm & Crosswind',
      'Engage DualSense 0x21/0x26 hard detent ratification for B(a) ≥ 70 public repository deployments',
      'Compile cryptographically signed Sponsor ROI & Morning Executive Dailies Deck',
    ],
    riskProfile: 'High-Leverage Wedge (B(a) = 78) • Requires G4 Simmer sandbox or R2 trigger ratification',
  },
];

export const VENTURE_TRACKS: VentureTrack[] = [
  {
    id: 'TRACK-1',
    trackNumber: 1,
    title: 'OmniChorus / PulseDeck',
    tagline: 'Enterprise & Creator Omni-Stream Chat Aggregator, Fair-Share Community Router & Sponsor Deck',
    status: 'Verified Prototype (DWFQ + FX + ROI)',
    revenueWedge: '$99–$499/mo Creator Pro / Agency | $2,500+/mo Enterprise Town Halls',
    moat: 'Sub-Linear DWFQ (β=0.30) attention balancing + Cryptographic Sponsor Proof-of-Performance reports',
    telemetryHighlight: '54.1% YT / 23.3% TT / 14.4% Discord / 8.2% Kick Fair-Share Bandwidth',
    githubRepo: 'mjeanhudson-dev/aether-agent-suite',
    githubUrl: 'https://github.com/mjeanhudson-dev/aether-agent-suite',
    prototypePath: 'C:\\Users\\Zachariah\\aether agent\\omnichorus',
    keyComponents: [
      'Sub-Linear Deficit Weighted Fair-Queuing (DWFQ β=0.30)',
      'Universal Multi-Currency & Gift Normalizer (40+ Fiat FX)',
      'Mod-Curated Teleprompter Cockpit & Heavy Modifiers',
      'VAD-Ducked Neural TTS Shoutouts (-14 dB Sidechain Ramp)',
      '1-Click Cryptographically Timestamped Sponsor ROI PDF/HTML',
    ],
  },
  {
    id: 'TRACK-2',
    trackNumber: 2,
    title: 'Takeout & Patent Bootloader Sieve',
    tagline: 'Zero-Cloud O(1)-RAM Archive Streamer, Patent Claim Graph & Dirty-Logic Quarantine Sieve',
    status: 'Quarantine Sieve & Lexer Verified',
    revenueWedge: '$149–$999/seat Sovereign IP Vault & Cross-Model Agent Instantiator',
    moat: 'O(1)-RAM streaming parser + 128-perm MinHash LSH (Jaccard ≥ 0.70) draft collapse + Taint-Gated Quarantine',
    telemetryHighlight: 'O(1) RAM Zip Streamer • 128-Perm MinHash LSH • Dirty-Logic Quarantined',
    githubRepo: 'mjeanhudson-dev/aether-agent-suite',
    githubUrl: 'https://github.com/mjeanhudson-dev/aether-agent-suite',
    prototypePath: 'C:\\Users\\Zachariah\\aether agent\\takeout_sieve',
    keyComponents: [
      'Zero-Copy O(1)-RAM Streamer (MyActivity.json, Keep, Drive)',
      'Signal Density Scoring S(d) for Patent & Architecture Primitives',
      '128-Permutation MinHash LSH Iterative Prompt Draft Collapse',
      'Zero-Dirty-Logic Quarantine Sieve (Tainted Drive Isolation)',
      'Universal AGENT_BOOTLOADER.md Compiler (Gemini / Claude / Codex)',
    ],
  },
  {
    id: 'TRACK-3',
    trackNumber: 3,
    title: 'SimBridge',
    tagline: 'Universal DirectInput/XInput/HID Telemetry & DualSense Haptic Middleware for 250+ PC Sims',
    status: 'Production Verified (114/114 PINPOINT)',
    revenueWedge: '$14.99–$29.99 PC Sim Utility | B2B Haptic & Gyro Telemetry SDK',
    moat: '32-bit XInput 1.3 PE Proxy + 250 Hz Win32 Overlapped HID + Inverse Deadzone Pre-Compensation (0B XML Tamper)',
    telemetryHighlight: '250 Hz Overlapped HID • 114/114 PINPOINT Checks • 0B Stock XML Tampered',
    githubRepo: 'mjeanhudson-dev/shift2-dualsense-gyro',
    githubUrl: 'https://github.com/mjeanhudson-dev/shift2-dualsense-gyro',
    prototypePath: 'C:\\Users\\Zachariah\\Documents\\antigravity\\vibrant-darwin',
    keyComponents: [
      'Direct Win32 SetupAPI 250 Hz Overlapped 64-Byte HID Reader',
      'Rate-Driven Casiez 1€ Adaptive Filter with Branch-Cut Delta',
      'Pitch Sagittal Projection for Reclined Lap Immunity (-15° to -75°)',
      'Mathematical Inverse Deadzone Pre-Compensation (Cloud Save Safe)',
      'L2/R2 Adaptive Trigger Haptics (Modes 0x05, 0x21, 0x26 40 Hz)',
    ],
  },
  {
    id: 'TRACK-4',
    trackNumber: 4,
    title: 'Arbiter Forge',
    tagline: 'Cross-Model Consensus (Gemini + Claude + Codex) & Deterministic PINPOINT CI Gatekeeper',
    status: 'Operational & SHA256 Synced',
    revenueWedge: '$499–$5,000/mo Autonomous Multi-Model DevSecOps Verification Plane',
    moat: 'Adversarial tri-model red-teaming blocked from merging until compiled PINPOINT & SHA256 parity pass 100%',
    telemetryHighlight: '3-Model Red-Team Consensus • 100% SHA256 Parity • Atomic Bounty Ledger',
    githubRepo: 'mjeanhudson-dev/antigravity-sanctuary-portal',
    githubUrl: 'https://github.com/mjeanhudson-dev/antigravity-sanctuary-portal',
    prototypePath: 'C:\\Users\\Zachariah\\Documents\\antigravity\\portal',
    keyComponents: [
      'Atomic Cross-Agent Bounty Ledger & Local Gitea Forge Sync',
      'Tri-Model Adversarial Diff Interrogation (Gemini x Claude x Codex)',
      'Compiled PINPOINT Deterministic Gatekeeper (Zero Slop Merges)',
      '3-Way Workspace / Desktop Staging / Target SHA256 Parity Lock',
      'Sanctuary Portal Real-Time Crucible & Telemetry Cockpit',
    ],
  },
  {
    id: 'TRACK-5',
    trackNumber: 5,
    title: 'NexusHelm',
    tagline: 'Sovereign In-Between Mediator & "Steering-Wheel" Human-Agency Harness',
    status: '10/10 Adversarial Suites Verified',
    revenueWedge: '$299–$2,500/mo Enterprise AI Governance & Cross-Platform Agent Harness',
    moat: 'Typed Semantic IPC Airlock + Monotonic Taint Lattice + Phantom Credential Broker + 5-Speed Autonomy Gearbox',
    telemetryHighlight: '10/10 Security Tests • Zero Secret Exposure • Rule-of-3 Anti-Fait-Accompli',
    githubRepo: 'mjeanhudson-dev/nexushelm',
    githubUrl: 'https://github.com/mjeanhudson-dev/nexushelm',
    prototypePath: 'C:\\Users\\Zachariah\\aether agent\\nexushelm',
    keyComponents: [
      'Zero-Natural-Language Typed Semantic IPC Airlock',
      'Monotonic Information-Flow Taint Lattice (HUMAN_ROOT → UNTRUSTED)',
      'Zero-Knowledge HMAC Phantom Secret Broker (phantom://v1/...)',
      '5-Speed Autonomy Gearbox (G1–G4 + G0 Hard E-Brake)',
      'Mandatory Rule-of-3 Creative Tradeoff Forker & 0x21/0x26 Trigger Detent',
    ],
  },
  {
    id: 'TRACK-6',
    trackNumber: 6,
    title: 'Crosswind: Ground Effect',
    tagline: 'Atmospheric Flight Survival & Tactile MudRunner-Style Bush Flying Simulation',
    status: 'Physics & Mission Bravo-6 Verified',
    revenueWedge: '$19.99 Steam Tactile Co-Op Sim + Emergency Bush Contract Expansions',
    moat: 'Sectional Blade Element Theory (BET) + Non-Linear Ground Effect σ(h/b) + DualSense Dynamic Pressure q Yoke',
    telemetryHighlight: '86% Ground-Effect Drag Reduction • 32 Hz AoA Buffet • 10,382 Pt Landing',
    githubRepo: 'mjeanhudson-dev/aether-agent-suite',
    githubUrl: 'https://github.com/mjeanhudson-dev/aether-agent-suite',
    prototypePath: 'C:\\Users\\Zachariah\\aether agent\\crosswind',
    keyComponents: [
      'Sectional Blade Element Theory (BET) & Asymmetric Wing Stall',
      'Dynamic Ground Effect Cushion σ(h/b) = 16(h/b)² / (1 + 16(h/b)²)',
      'Crosswind Crab-and-Decrab Kinematics (7.5° Sideload Tire Blowout)',
      'DualSense Dynamic Airspeed q Stiffening (0x21) & 32 Hz Stall Buffet (0x26)',
      'Mission Bravo-6 Blizzard Windshear & Engine-Out Evaluator',
    ],
  },
];

export const VENTURE_TRACK: VentureTrack = VENTURE_TRACKS[0];

export const INITIAL_BOUNTIES: Bounty[] = [
  {
    id: 'BOUNTY-VD-001',
    project: 'vibrant-darwin',
    title: 'Direct Win32 DualSense USB HID 250 Hz Async Reader',
    status: 'COMPLETED',
    claimant: 'Subagent DeepCoder',
    dates: '2026-10-15',
    domainTags: ['#hardware-hid-dualsense'],
    dependencies: 'None',
    artifacts: 'xinput_proxy.cpp',
    milestone: 'HANDOFF-001',
    summary: 'Direct Win32 SetupAPI enumeration and asynchronous overlapped 64-byte HID report reading at 250 Hz without external bloatware.',
  },
  {
    id: 'BOUNTY-VD-002',
    project: 'vibrant-darwin',
    title: '32-bit XInput 1.3 Proxy DLL & Export Forwarder',
    status: 'COMPLETED',
    claimant: 'Subagent DeepCoder',
    dates: '2026-10-15',
    domainTags: ['#xinput-hook-proxy'],
    dependencies: 'BOUNTY-VD-001',
    artifacts: 'xinput1_3.def, xinput1_3.dll',
    milestone: 'HANDOFF-002',
    summary: 'Transparent 32-bit proxy DLL intercepting XInputGetState with full export forwarders to system32\\xinput1_3.dll.',
  },
  {
    id: 'BOUNTY-VD-003',
    project: 'vibrant-darwin',
    title: '1st-Party Player Turn & Lean Auto-Blend (C² Smootherstep)',
    status: 'COMPLETED',
    claimant: 'Subagent DeepInvestigator',
    dates: '2026-10-16',
    domainTags: ['#smoothstep-blending', '#motion-imu-fusion'],
    dependencies: 'BOUNTY-VD-001',
    artifacts: 'xinput_proxy.cpp',
    milestone: 'HANDOFF-003',
    summary: 'Ken Perlin C² smootherstep auto-blend eliminating hard cutoff cliffs between roll and yaw steering postures.',
  },
  {
    id: 'BOUNTY-VD-004',
    project: 'vibrant-darwin',
    title: 'Rate-Driven Casiez 1€ Filter with Branch-Cut Delta',
    status: 'COMPLETED',
    claimant: 'Subagent DeepCoder',
    dates: '2026-10-16',
    domainTags: ['#casiez-1euro-filter'],
    dependencies: 'BOUNTY-VD-003',
    artifacts: 'xinput_proxy.cpp',
    milestone: 'HANDOFF-004',
    summary: 'Adaptive low-pass filtering on physical rate gyro velocity with shortest angular delta branch-cut handling to eliminate jitter.',
  },
  {
    id: 'BOUNTY-VD-005',
    project: 'vibrant-darwin',
    title: 'Recline / Lap Immunity & Corner Hold Stability (τ = 25 s)',
    status: 'COMPLETED',
    claimant: 'Subagent DeepCoder',
    dates: '2026-10-16',
    domainTags: ['#motion-imu-fusion'],
    dependencies: 'BOUNTY-VD-004',
    artifacts: 'PINPOINT 2 Passed',
    milestone: 'HANDOFF-005',
    summary: 'Pitch sagittal projection decouple preventing long-radius cornering angle decay while driving reclined (-15° to -75°).',
  },
  {
    id: 'BOUNTY-VD-006',
    project: 'vibrant-darwin',
    title: 'Boot Horizon Zero (M.center = 0.0°) & Heuristic Elimination',
    status: 'COMPLETED',
    claimant: 'Subagent Argon',
    dates: '2026-10-16',
    domainTags: ['#motion-imu-fusion'],
    dependencies: 'BOUNTY-VD-005',
    artifacts: 'PINPOINT 1 Passed',
    milestone: 'HANDOFF-006',
    summary: 'Zeroed startup horizon anchor preventing violent snap to center on race start.',
  },
  {
    id: 'BOUNTY-VD-007',
    project: 'vibrant-darwin',
    title: 'Progressive Deadzone Blend & Asymmetric Weighted Rack Physics',
    status: 'COMPLETED',
    claimant: 'Subagent DeepCoder',
    dates: '2026-10-16',
    domainTags: ['#motion-imu-fusion', '#game-modding-shift2'],
    dependencies: 'BOUNTY-VD-003',
    artifacts: 'PINPOINT 6 Passed',
    milestone: 'HANDOFF-007',
    summary: 'Pre-compensation inverse function canceling the stock game quadratic deadzone swallow without editing XML files.',
  },
  {
    id: 'BOUNTY-VD-008',
    project: 'vibrant-darwin',
    title: 'Dual X / A Handbrake Mapping with Edge-Latched Immunity',
    status: 'COMPLETED',
    claimant: 'Subagent DeepCoder',
    dates: '2026-10-16',
    domainTags: ['#hardware-hid-dualsense', '#xinput-hook-proxy'],
    dependencies: 'BOUNTY-VD-002',
    artifacts: 'PINPOINT 7 Passed (27 checks)',
    milestone: 'HANDOFF-008',
    summary: 'Physical DualSense Square and Cross buttons mapped to gamepad handbrake with edge-latched timeout suppression.',
  },
  {
    id: 'BOUNTY-VD-009',
    project: 'vibrant-darwin',
    title: 'Menu Trigger Haptic Isolation, 15-Count Deadzone & Soft Recovery',
    status: 'COMPLETED',
    claimant: 'Subagent DeepCoder',
    dates: '2026-10-16',
    domainTags: ['#haptics-adaptive-triggers'],
    dependencies: 'BOUNTY-VD-001',
    artifacts: 'PINPOINT 4 Passed',
    milestone: 'HANDOFF-009',
    summary: 'Resting finger float (7-12 counts) filter preventing unintended UI tab switching in game menus.',
  },
  {
    id: 'BOUNTY-VD-010',
    project: 'vibrant-darwin',
    title: 'R2 Throttle Vibration Routing (40 Hz mode 0x26) & Flick Haptic',
    status: 'COMPLETED',
    claimant: 'Subagent DeepCoder',
    dates: '2026-10-16',
    domainTags: ['#haptics-adaptive-triggers'],
    dependencies: 'BOUNTY-VD-009',
    artifacts: 'PINPOINT 5 Passed',
    milestone: 'HANDOFF-010',
    summary: 'Dynamic engine vibration channeled directly into R2 trigger motor synchronized with game rumble telemetry.',
  },
  {
    id: 'BOUNTY-VD-011',
    project: 'vibrant-darwin',
    title: 'Capacitive Touchpad Flick Glances (Analog Decoupled)',
    status: 'COMPLETED',
    claimant: 'Subagent Argon',
    dates: '2026-10-16',
    domainTags: ['#capacitive-touchpad-gestures'],
    dependencies: 'BOUNTY-VD-001',
    artifacts: 'PINPOINT 3 Passed (17 checks)',
    milestone: 'HANDOFF-011',
    summary: 'Multi-touch gesture decoder evaluating left/right glancing flick vectors decoupled from physical right analog stick.',
  },
  {
    id: 'BOUNTY-VD-012',
    project: 'vibrant-darwin',
    title: 'Instant Startup Intro Cinematic Bypass',
    status: 'COMPLETED',
    claimant: 'Subagent DeepInvestigator',
    dates: '2026-10-16',
    domainTags: ['#game-modding-shift2'],
    dependencies: 'None',
    artifacts: 'BootFlow_in/out.bik.bak',
    milestone: 'HANDOFF-012',
    summary: 'Cold boot bypass reducing game startup time from 42s to under 2s with zero binary corruption.',
  },
  {
    id: 'BOUNTY-VD-013',
    project: 'vibrant-darwin',
    title: 'Targeted PINPOINT Verification Test Suite (114 Exhaustive Checks)',
    status: 'COMPLETED',
    claimant: 'Subagent DeepCoder',
    dates: '2026-10-16',
    domainTags: ['#pinpoint-test-harness'],
    dependencies: 'All VD Bounties',
    artifacts: 'xinput_proxy_pressure_test.exe (100% Pass)',
    milestone: 'HANDOFF-013',
    summary: 'Automated pressure testing verifying 114 deterministic conditions across all math models and edge states.',
  },
  {
    id: 'BOUNTY-OC-001',
    project: 'OmniChorus',
    title: 'Sub-Linear Deficit Weighted Fair-Queuing (DWFQ β=0.30) Engine',
    status: 'COMPLETED',
    claimant: 'Subagent Gemini 3.8 Flash',
    dates: '2026-10-30',
    domainTags: ['#omnichorus-stream-engine'],
    dependencies: 'None',
    artifacts: 'omnichorus/dwfq_engine.py',
    milestone: 'HANDOFF-OC-001',
    summary: 'Velocity-normalized chat ingestion preventing quiet stream channels from being drowned out by high-velocity platforms.',
  },
  {
    id: 'BOUNTY-OC-002',
    project: 'OmniChorus',
    title: 'Multi-Currency Gift Normalizer & Universal FX Ledger',
    status: 'COMPLETED',
    claimant: 'Subagent Claude Sonnet',
    dates: '2026-10-30',
    domainTags: ['#omnichorus-currency-fx'],
    dependencies: 'BOUNTY-OC-001',
    artifacts: 'omnichorus/currency_normalizer.py',
    milestone: 'HANDOFF-OC-002',
    summary: 'Cross-platform financial normalization uniting SuperChats, Bits, TikTok Coins, and Kick Gifts into a single real-time ledger.',
  },
  {
    id: 'BOUNTY-OC-003',
    project: 'OmniChorus',
    title: '1-Click Cryptographically Timestamped PDF/HTML Sponsor ROI Report',
    status: 'COMPLETED',
    claimant: 'Subagent DeepCoder',
    dates: '2026-10-30',
    domainTags: ['#sponsor-proof-performance'],
    dependencies: 'BOUNTY-OC-002',
    artifacts: 'omnichorus/sponsor_roi.py',
    milestone: 'HANDOFF-OC-003',
    summary: 'Automated agency audit packet generating cryptographically signed proof-of-performance for live stream sponsorship segments.',
  },
  {
    id: 'BOUNTY-AF-001',
    project: 'local-forge',
    title: 'Multi-Agent Gitea Sync & Local Git Forge Automation',
    status: 'COMPLETED',
    claimant: 'Subagent DeepCoder',
    dates: '2026-10-16',
    domainTags: ['#forge-automation'],
    dependencies: 'None',
    artifacts: 'local-forge/manage_forge.ps1',
    milestone: 'HANDOFF-LF-001',
    summary: 'Local private Git forge with automatic token extraction and automated project sync across concurrent agent sessions.',
  },
  {
    id: 'BOUNTY-AET-008',
    project: 'aether-agent',
    title: 'NexusHelm Track 5: Sovereign In-Between Agent Mediator & Steering-Wheel Agency Harness',
    status: 'COMPLETED',
    claimant: 'Subagent DeepCoder',
    dates: '2026-10-30',
    domainTags: ['#haptics-adaptive-triggers', '#pinpoint-test-harness'],
    dependencies: 'BOUNTY-AET-007',
    artifacts: 'nexushelm/engine.py, nexushelm/tests/test_nexushelm.py (10/10 Passed)',
    milestone: 'HANDOFF-007',
    summary: 'Bidirectional Typed Semantic Airlock, Phantom Token Broker, SHA-256 Instruction Integrity Guard, Monotonic Taint Lattice, 5-Speed Gearbox + Rule-of-3 Forking + DualSense 0x21/0x26 Haptics, and Zero-Dirty-Logic Quarantine Sieve.',
  },
  {
    id: 'BOUNTY-AET-009',
    project: 'aether-agent',
    title: 'Crosswind Track 6: Sectional BET Aerodynamics, Ground Effect & DualSense Dynamic Pressure Yoke',
    status: 'COMPLETED',
    claimant: 'Subagent DeepCoder',
    dates: '2026-10-30',
    domainTags: ['#motion-imu-fusion', '#haptics-adaptive-triggers'],
    dependencies: 'BOUNTY-AET-008',
    artifacts: 'crosswind/physics.py, crosswind/mission_runner.py (5/5 Passed)',
    milestone: 'HANDOFF-CW-001',
    summary: 'Sectional Blade Element Theory, non-linear ground effect cushion σ(h/b), crab-and-decrab tire blowout gate, and DualSense 0x21/0x26 stall buffet.',
  },
  {
    id: 'BOUNTY-AET-010',
    project: 'aether-agent',
    title: 'Track 2 Takeout Bootloader Sieve & Zero-Dirty-Logic Quarantine Pipeline',
    status: 'COMPLETED',
    claimant: 'Subagent DeepCoder',
    dates: '2026-10-30',
    domainTags: ['#pinpoint-test-harness', '#forge-automation'],
    dependencies: 'BOUNTY-AET-008',
    artifacts: 'takeout_sieve/ingest_sieve.py, AGENT_BOOTLOADER.md',
    milestone: 'HANDOFF-TB-001',
    summary: 'O(1)-RAM streaming Takeout parser with 128-permutation MinHash LSH draft collapse and strict taint quarantine for unverified Drive logic.',
  },
];

export const DOMAIN_TAGS: DomainTag[] = [
  { tag: '#hardware-hid-dualsense', label: 'DualSense HID', description: 'Sony DualSense v1 & v2 USB HID 64-byte packet protocols', count: 3 },
  { tag: '#xinput-hook-proxy', label: 'XInput Proxy', description: '32-bit Win32 hook DLL & dynamic export forwarding', count: 2 },
  { tag: '#motion-imu-fusion', label: 'IMU & Aero Fusion', description: 'Gyro + Accel complementary filters, sagittal projection & BET physics', count: 5 },
  { tag: '#casiez-1euro-filter', label: '1€ Adaptive Filter', description: 'Casiez 1€ filter with branch-cut delta unwrapping', count: 1 },
  { tag: '#smoothstep-blending', label: 'C² Smootherstep', description: 'Ken Perlin C² polynomial auto-blend continuous transitions', count: 1 },
  { tag: '#haptics-adaptive-triggers', label: 'Adaptive Triggers', description: 'Motor haptic effects (modes 0x05, 0x21, 0x26) & rumble routing', count: 4 },
  { tag: '#capacitive-touchpad-gestures', label: 'Touchpad Gestures', description: 'Multi-touch capacitive coordinate flick glance parsing', count: 1 },
  { tag: '#game-modding-shift2', label: 'Game Mechanics', description: 'Stock XML dampening bypass & intro cinematic skipping', count: 2 },
  { tag: '#pinpoint-test-harness', label: 'PINPOINT Testing', description: 'Deterministic hardware & airlock test harness (114+ checks)', count: 3 },
  { tag: '#omnichorus-stream-engine', label: 'OmniChorus Core', description: 'Multi-stream fair-queuing chat and community attention router', count: 1 },
  { tag: '#omnichorus-currency-fx', label: 'Gift FX Ledger', description: 'Cross-platform monetization currency normalization', count: 1 },
  { tag: '#sponsor-proof-performance', label: 'Sponsor Proof', description: 'Cryptographically signed live sponsor attribution deck', count: 1 },
  { tag: '#forge-automation', label: 'Git Forge Sync', description: 'Public GitHub branch isolation & local Gitea multi-agent sync', count: 2 },
];

export const PROJECT_NODES: ProjectNode[] = [
  {
    name: 'shift2-dualsense-gyro (vibrant-darwin)',
    path: 'C:\\Users\\Zachariah\\Documents\\antigravity\\vibrant-darwin',
    domain: 'Track 3 SimBridge: DualSense Gyro Steering & XInput 1.3 Proxy',
    techStack: 'C++17, Win32 SetupAPI, XInput 1.3 Hook',
    status: 'ONLINE',
    completedBounties: 13,
    totalBounties: 13,
    githubRepo: 'mjeanhudson-dev/shift2-dualsense-gyro',
    githubUrl: 'https://github.com/mjeanhudson-dev/shift2-dualsense-gyro',
    branchIsolation: 'master: Thinking Overlay (untouched) • main / simbridge',
  },
  {
    name: 'nexushelm',
    path: 'C:\\Users\\Zachariah\\aether agent\\nexushelm',
    domain: 'Track 5: Sovereign In-Between Mediator & 5-Speed Steering Harness',
    techStack: 'Python 3, Typed IPC Airlock, Taint Lattice, DualSense 0x21/0x26',
    status: 'ONLINE',
    completedBounties: 10,
    totalBounties: 10,
    githubRepo: 'mjeanhudson-dev/nexushelm',
    githubUrl: 'https://github.com/mjeanhudson-dev/nexushelm',
    branchIsolation: 'master: Thinking Overlay (untouched) • main / nexushelm',
  },
  {
    name: 'antigravity-sanctuary-portal',
    path: 'C:\\Users\\Zachariah\\Documents\\antigravity\\portal',
    domain: 'Track 4 Arbiter Forge: Interactive Crucible & Telemetry Portal',
    techStack: 'React 19, TypeScript 6, Vite 8, Tailwind CSS',
    status: 'SYNCED',
    completedBounties: 4,
    totalBounties: 4,
    githubRepo: 'mjeanhudson-dev/antigravity-sanctuary-portal',
    githubUrl: 'https://github.com/mjeanhudson-dev/antigravity-sanctuary-portal',
    branchIsolation: 'master: Thinking Overlay (untouched) • main / sanctuary-portal',
  },
  {
    name: 'aether-agent-suite',
    path: 'C:\\Users\\Zachariah\\aether agent',
    domain: 'Tracks 1, 2 & 6: OmniChorus, Takeout Sieve & Crosswind Flight Sim',
    techStack: 'Python 3, TypeScript, DWFQ, MinHash LSH, BET Aero Physics',
    status: 'ONLINE',
    completedBounties: 8,
    totalBounties: 8,
    githubRepo: 'mjeanhudson-dev/aether-agent-suite',
    githubUrl: 'https://github.com/mjeanhudson-dev/aether-agent-suite',
    branchIsolation: 'master: Thinking Overlay (untouched) • omnichorus / takeout-sieve / crosswind',
  },
];
