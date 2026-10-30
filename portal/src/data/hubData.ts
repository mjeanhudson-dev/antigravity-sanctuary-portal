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
}

export interface VentureTrack {
  id: string;
  title: string;
  tagline: string;
  status: string;
  revenueWedge: string;
  moat: string;
  keyComponents: string[];
}

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
    status: 'IN_PROGRESS',
    claimant: 'Subagent Gemini 3.8 Flash',
    dates: '2026-10-19',
    domainTags: ['#omnichorus-stream-engine'],
    dependencies: 'None',
    artifacts: 'dwfq_engine.ts',
    milestone: 'HANDOFF-OC-001',
    summary: 'Velocity-normalized chat ingestion preventing quiet stream channels from being drowned out by high-velocity platforms.',
  },
  {
    id: 'BOUNTY-OC-002',
    project: 'OmniChorus',
    title: 'Multi-Currency Gift Normalizer & Universal FX Ledger',
    status: 'CLAIMED',
    claimant: 'Subagent Claude Sonnet',
    dates: '2026-10-20',
    domainTags: ['#omnichorus-currency-fx'],
    dependencies: 'BOUNTY-OC-001',
    artifacts: 'currency_normalizer.ts',
    milestone: 'HANDOFF-OC-002',
    summary: 'Cross-platform financial normalization uniting SuperChats, Bits, TikTok Coins, and Kick Gifts into a single real-time ledger.',
  },
  {
    id: 'BOUNTY-OC-003',
    project: 'OmniChorus',
    title: '1-Click Cryptographically Timestamped PDF/HTML Sponsor ROI Report',
    status: 'OPEN',
    claimant: 'Unassigned',
    dates: '2026-10-20',
    domainTags: ['#sponsor-proof-performance'],
    dependencies: 'BOUNTY-OC-002',
    artifacts: 'sponsor_reporter.ts',
    milestone: 'PENDING',
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
];

export const DOMAIN_TAGS: DomainTag[] = [
  { tag: '#hardware-hid-dualsense', label: 'DualSense HID', description: 'Sony DualSense v1 & v2 USB HID 64-byte packet protocols', count: 3 },
  { tag: '#xinput-hook-proxy', label: 'XInput Proxy', description: '32-bit Win32 hook DLL & dynamic export forwarding', count: 2 },
  { tag: '#motion-imu-fusion', label: 'IMU Fusion', description: 'Gyro + Accel complementary filters and sagittal projection', count: 4 },
  { tag: '#casiez-1euro-filter', label: '1€ Adaptive Filter', description: 'Casiez 1€ filter with branch-cut delta unwrapping', count: 1 },
  { tag: '#smoothstep-blending', label: 'C² Smootherstep', description: 'Ken Perlin C² polynomial auto-blend continuous transitions', count: 1 },
  { tag: '#haptics-adaptive-triggers', label: 'Adaptive Triggers', description: 'Motor haptic effects (modes 0x05, 0x21, 0x26) & rumble routing', count: 2 },
  { tag: '#capacitive-touchpad-gestures', label: 'Touchpad Gestures', description: 'Multi-touch capacitive coordinate flick glance parsing', count: 1 },
  { tag: '#game-modding-shift2', label: 'Game Mechanics', description: 'Stock XML dampening bypass & intro cinematic skipping', count: 2 },
  { tag: '#pinpoint-test-harness', label: 'PINPOINT Testing', description: 'Deterministic hardware test harness (114 passing checks)', count: 1 },
  { tag: '#omnichorus-stream-engine', label: 'OmniChorus Core', description: 'Multi-stream fair-queuing chat and community attention router', count: 1 },
  { tag: '#omnichorus-currency-fx', label: 'Gift FX Ledger', description: 'Cross-platform monetization currency normalization', count: 1 },
  { tag: '#sponsor-proof-performance', label: 'Sponsor Proof', description: 'Cryptographically signed live sponsor attribution deck', count: 1 },
  { tag: '#forge-automation', label: 'Git Forge Sync', description: 'Local Gitea automation and multi-agent repository sync', count: 1 },
];

export const PROJECT_NODES: ProjectNode[] = [
  {
    name: 'vibrant-darwin',
    path: 'C:\\Users\\Zachariah\\Documents\\antigravity\\vibrant-darwin',
    domain: 'DualSense Gyro Steering & XInput Proxy',
    techStack: 'C++17, Win32 SetupAPI, XInput 1.3 Hook',
    status: 'ONLINE',
    completedBounties: 13,
    totalBounties: 13,
  },
  {
    name: 'OmniChorus (PulseDeck)',
    path: 'C:\\Users\\Zachariah\\Documents\\antigravity\\VENTURE_INCUBATOR.md',
    domain: 'Enterprise & Creator Multi-Stream Router',
    techStack: 'TypeScript, WebSockets, DWFQ, Web Audio VAD',
    status: 'ONLINE',
    completedBounties: 0,
    totalBounties: 3,
  },
  {
    name: 'local-forge',
    path: 'C:\\Users\\Zachariah\\Documents\\antigravity\\local-forge',
    domain: 'Private Multi-Agent Git Forge & Automation',
    techStack: 'Go (Gitea), PowerShell 7, REST API',
    status: 'SYNCED',
    completedBounties: 1,
    totalBounties: 1,
  },
  {
    name: 'aether-agent',
    path: 'C:\\Users\\Zachariah\\aether agent',
    domain: 'Sovereign Agent Core & Venture Headquarters',
    techStack: 'Multi-Agent Network, Win32 HID',
    status: 'STANDBY',
    completedBounties: 0,
    totalBounties: 0,
  },
];

export const VENTURE_TRACK: VentureTrack = {
  id: 'TRACK-1',
  title: 'OmniChorus / PulseDeck',
  tagline: 'Enterprise & Creator Omni-Stream Chat Aggregator & Fair-Share Attention Router',
  status: 'In Validation & Architecture Phase',
  revenueWedge: '$99–$499/mo Creator Pro / Agency | $2,500+/mo Enterprise Town Halls',
  moat: 'Sub-Linear DWFQ (β=0.30) attention balancing + Cryptographic Sponsor Proof-of-Performance reports',
  keyComponents: [
    'Sub-Linear Deficit Weighted Fair-Queuing (DWFQ)',
    'Universal Multi-Currency & Gift Normalizer (40+ Fiat FX)',
    'Mod-Curated Teleprompter Cockpit & Heavy Modifiers',
    'VAD-Ducked Neural TTS Shoutouts (Zero Presenter Collision)',
    '1-Click Cryptographically Timestamped Sponsor ROI PDF',
  ],
};
