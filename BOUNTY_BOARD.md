# Multi-Agent Central Directory & Bounty Board
**Universal Cross-Project Task Tracking, Agent Claim Ledger & Domain Overlay Registry**

> [!IMPORTANT]
> **MANDATORY RULES FOR ALL SUBAGENTS (DeepInvestigator, DeepCoder, Argon, etc.):**
> 1. **Check this Board & `PROJECT_HANDOFF.md` FIRST**: Never start reading massive codebases or launching synthetic mock test suites before checking existing research, locked algorithms, and completed milestones.
> 2. **Never Duplicate or Undo Work**: Subagents must NOT write conflicting mock tests (`xinput_proxy_pressure_test.cpp`), rewrite locked mathematical models, or override verified features.
> 3. **Atomic Bounty Claims**: When starting work on an item, mark its status as `CLAIMED` with your Agent Name, Conversation ID, and Timestamp. When finished, mark as `COMPLETED` and log the handoff in `PROJECT_HANDOFF.md`.
> 4. **Hardware Verification Over Synthetic Tests**: Use targeted PINPOINT checks (`xinput_proxy_pressure_test.exe`) and interactive hardware visualizers (`gyro_workshop.exe`) rather than spinning endless mock iterations that waste tokens and regress code.

---

### 1. Multi-Agent Repository Network Architecture

The Antigravity multi-agent collaboration network operates across conversations and projects via a 2-tier hierarchy:

```
~/Documents/antigravity/
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ BOUNTY_BOARD.md                 <-- Central Cross-Project Task & Claim Board (This File)
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ MULTIAGENT_PROTOCOLS.md         <-- Global Collaboration Handbook, Invariants & Templates
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ GLOBAL_KNOWLEDGE_INDEX.md       <-- Reusable Domain Overlay Index & Cross-Project Artifacts
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ init_project_repo.ps1           <-- Automated Project Onboarding & Registration Scaffolder
Ã¢â€â€š
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ vibrant-darwin\                 <-- Project: Shift 2 DualSense XInput Proxy & Motion Engine
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ BOUNTY_BOARD.md             <-- Project-Slice View of Bounty Board
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ PROJECT_HANDOFF.md          <-- Chronological Handoff Ledger & Milestone History
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ SHARED_REPOSITORY.md        <-- Locked Technical Architecture & Math Specs
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ MULTIAGENT_PROTOCOLS.md     <-- Project-Local Collaboration Protocols
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ verify_repo.ps1             <-- Automated SHA256 & 114 PINPOINT Test Verification
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ ... (Source Code, Binaries, Configs)
Ã¢â€â€š
Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ excited-hertz\                  <-- Project: Secondary Antigravity Workspace
    Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ BOUNTY_BOARD.md             <-- Project-Slice View of Bounty Board
    Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ PROJECT_HANDOFF.md          <-- Project Handoff Ledger
    Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ MULTIAGENT_PROTOCOLS.md     <-- Project-Local Collaboration Protocols
```

- **Global Central Hub:**
  - `~/Documents/antigravity/doc/BOUNTY_BOARD.md`
  - `~/Documents/antigravity/doc/MULTIAGENT_PROTOCOLS.md`
  - `~/Documents/antigravity/doc/GLOBAL_KNOWLEDGE_INDEX.md`
  - `~/Documents/antigravity/doc/init_project_repo.ps1`

---

## 2. Master Project Registry & Domain Overlay Index

This index allows agents working across intersecting technical domains to discover and reuse existing code, research, and verified artifacts rather than re-inventing solutions.

| Project Name | Path | Primary Domain / Objective | Active Tech Stack | Key Reusable Artifacts | Local Handoff Ledger |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`vibrant-darwin`** | `~/Documents/antigravity/vibrant-darwin/` | Need for Speed Shift 2 Unleashed DualSense XInput Proxy, 250 Hz Motion Steering, Haptics, Touchpad Glances | C++17, Win32 SetupAPI, XInput 1.3 Hook, Casiez 1€ Filter, Ken Perlin $C^2$ Blend | `~/Documents/antigravity/vibrant-darwin/xinput_proxy.cpp`, `gyro_workshop.exe` (`~/Documents/antigravity/vibrant-darwin/gyro_workshop.cpp`), `xinput_proxy_pressure_test.exe` (`~/Documents/antigravity/vibrant-darwin/xinput_proxy_pressure_test.cpp`), `~/Documents/antigravity/vibrant-darwin/gamepadmotion_fetched.hpp` | `~/Documents/antigravity/vibrant-darwin/PROJECT_HANDOFF.md` |
| **`aether-agent`** | `aether-agent/` (`~/aether agent/`) | Aether Sovereign Agent Core, Harness & Venture Headquarters | Multi-Agent Network, Win32 HID, Cross-Platform Adapters | `~/aether agent/AGENTS.md`, `~/aether agent/BOUNTY_BOARD.md` | `~/aether agent/PROJECT_HANDOFF.md` |
| **`excited-hertz`** | `~/Documents/antigravity/excited-hertz/` | Secondary Antigravity Workspace | Multi-Agent Scratchpad / Integration | `~/Documents/antigravity/excited-hertz/BOUNTY_BOARD.md`, `~/Documents/antigravity/excited-hertz/PROJECT_HANDOFF.md` | `~/Documents/antigravity/excited-hertz/PROJECT_HANDOFF.md` |
| **`vibrant-lavoisier`** | `~/Documents/antigravity/vibrant-lavoisier/` | New Multi-Agent Project Workspace | Multi-Agent Tools, C++, Python, TypeScript | `~/Documents/antigravity/vibrant-lavoisier/BOUNTY_BOARD.md` | `~/Documents/antigravity/vibrant-lavoisier/PROJECT_HANDOFF.md` |

### Domain Overlay Tags Taxonomy

Agents can search this board using these domain tags to locate prior art:

- `#hardware-hid-dualsense`: Sony DualSense v1 (`0x0CE6`) & v2 (`0x0DF2`) USB HID communication, 64-byte input/output report structures, feature reports, lightbar controls.
- `#xinput-hook-proxy`: 32-bit Win32 XInput DLL proxying, function forwarders (`~/Documents/antigravity/vibrant-darwin/xinput1_3.def`), dynamic system DLL loading, thread-safe input interception.
- `#motion-imu-fusion`: Gyroscope and accelerometer complementary filtering, pitch recline/lap immunity, gravity anchoring, zero-rate bias calibration.
- `#casiez-1euro-filter`: Rate-driven Casiez 1Ã¢â€šÂ¬ adaptive low-pass filter operating on physical rate gyro velocity with branch-cut shortest delta wrapping.
- `#smoothstep-blending`: Ken Perlin $C^2$ Smootherstep continuous multi-axis auto-blend eliminating cutoff cliffs and orientation dead zones.
- `#haptics-adaptive-triggers`: DualSense adaptive trigger effect programming (modes `0x05`, `0x21`, `0x26`), throttle rumble synthesis, curb vibration routing.
- `#capacitive-touchpad-gestures`: Multi-touch capacitive coordinate parsing ($[0,1920]\times[0,1080]$), aspect ratio flick gesture evaluation, look-behind decoupling, resting finger re-anchoring.
- `#game-modding-shift2`: Need for Speed Shift 2 Unleashed XML dampening, vehicle physics configs, intro movie bypassing (`BootFlow_in/out.bik.bak`).
- `#pinpoint-test-harness`: High-precision deterministic test suites verifying exact bitmask transitions, timing windows, edge latches, and math continuity.
- `#telemetry-visualizer`: Interactive real-time console dashboards (`gyro_workshop.exe` (`~/Documents/antigravity/vibrant-darwin/gyro_workshop.cpp`)), HUDs, ASCII steering gauges, automated diagnostic wizards.

---

## 3. Central Bounty Board (Task & Claim Ledger)

Status Codes:
- `COMPLETED`: Verified and locked in production.
- `IN_PROGRESS`: Actively undergoing development.
- `CLAIMED`: Claimed by an agent, work starting immediately.
- `OPEN`: Ready to be claimed by an agent.
- `BLOCKED`: Awaiting prerequisite dependency or hardware validation.
- `SUPERSEDED`: Replaced by a more advanced architectural design.

### Bounties Ledger

| Bounty ID | Project | Title | Status | Claimant / Owner | Started / Completed | Domain Tags | Dependencies | Artifacts / Verification | Milestone Anchor |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`BOUNTY-VD-001`** | `vibrant-darwin` | Direct Win32 DualSense USB HID 250 Hz Async Reader | `COMPLETED` | Subagent DeepCoder | 2026-10-15 / 2026-10-15 | `#hardware-hid-dualsense` | None | `~/Documents/antigravity/vibrant-darwin/xinput_proxy.cpp` | `HANDOFF-001` (`~/Documents/antigravity/vibrant-darwin/PROJECT_HANDOFF.md#handoff-001-direct-dualsense-usb-hid-asynchronous-communication`) |
| **`BOUNTY-VD-002`** | `vibrant-darwin` | 32-bit XInput 1.3 Proxy DLL & Export Forwarder | `COMPLETED` | Subagent DeepCoder | 2026-10-15 / 2026-10-15 | `#xinput-hook-proxy` | `BOUNTY-VD-001` | `~/Documents/antigravity/vibrant-darwin/xinput1_3.def`, `~/Documents/antigravity/vibrant-darwin/xinput1_3.dll` | `HANDOFF-002` (`~/Documents/antigravity/vibrant-darwin/PROJECT_HANDOFF.md#handoff-002-32-bit-xinput-13-proxy-architecture--export-forwarders`) |
| **`BOUNTY-VD-003`** | `vibrant-darwin` | 1st-Party Player Turn & Lean Auto-Blend ($C^2$ Smootherstep) | `COMPLETED` | Subagent DeepInvestigator | 2026-10-16 / 2026-10-16 | `#smoothstep-blending`, `#motion-imu-fusion` | `BOUNTY-VD-001` | `~/Documents/antigravity/vibrant-darwin/xinput_proxy.cpp` | `HANDOFF-003` (`~/Documents/antigravity/vibrant-darwin/PROJECT_HANDOFF.md#handoff-003-1st-party-unified-player-turn--lean-motion-steering-architecture`) |
| **`BOUNTY-VD-004`** | `vibrant-darwin` | Rate-Driven Casiez 1Ã¢â€šÂ¬ Filter with Branch-Cut Delta | `COMPLETED` | Subagent DeepCoder | 2026-10-16 / 2026-10-16 | `#casiez-1euro-filter` | `BOUNTY-VD-003` | `~/Documents/antigravity/vibrant-darwin/xinput_proxy.cpp` | `HANDOFF-004` (`~/Documents/antigravity/vibrant-darwin/PROJECT_HANDOFF.md#handoff-004-rate-driven-casiez-1-filter--shortest-delta-angle-wrapping`) |
| **`BOUNTY-VD-005`** | `vibrant-darwin` | Recline / Lap Immunity & Corner Hold Stability ($\tau = 25\text{ s}$) | `COMPLETED` | Subagent DeepCoder | 2026-10-16 / 2026-10-16 | `#motion-imu-fusion` | `BOUNTY-VD-004` | PINPOINT 2 Passed | `HANDOFF-005` (`~/Documents/antigravity/vibrant-darwin/PROJECT_HANDOFF.md#handoff-005-pitch-recline-lap-immunity--sustained-corner-hold-stability`) |
| **`BOUNTY-VD-006`** | `vibrant-darwin` | Boot Horizon Zero ($M.center = 0.0^\circ$) & Elimination of Brittle 3-2-1 Heuristics | `COMPLETED` | Subagent Argon | 2026-10-16 / 2026-10-16 | `#motion-imu-fusion` | `BOUNTY-VD-005` | PINPOINT 1 Passed | `HANDOFF-006` (`~/Documents/antigravity/vibrant-darwin/PROJECT_HANDOFF.md#handoff-006-boot-horizon-zero--elimination-of-fragile-3-2-1-auto-zero-heuristics`) |
| **`BOUNTY-VD-007`** | `vibrant-darwin` | Progressive Deadzone Blend & Asymmetric Weighted Rack Physics (`Smoothing=50`) | `COMPLETED` | Subagent DeepCoder | 2026-10-16 / 2026-10-16 | `#motion-imu-fusion`, `#game-modding-shift2` | `BOUNTY-VD-003` | PINPOINT 6 Passed | `HANDOFF-007` (`~/Documents/antigravity/vibrant-darwin/PROJECT_HANDOFF.md#handoff-007-progressive-smooth-deadzone--asymmetric-weighted-rack-physics`) |
| **`BOUNTY-VD-008`** | `vibrant-darwin` | Dual X / A Handbrake Mapping with Edge-Latched Timeout Immunity & Camera Suppression | `COMPLETED` | Subagent DeepCoder | 2026-10-16 / 2026-10-16 | `#hardware-hid-dualsense`, `#xinput-hook-proxy` | `BOUNTY-VD-002` | PINPOINT 7 Passed (27 checks) | `HANDOFF-008` (`~/Documents/antigravity/vibrant-darwin/PROJECT_HANDOFF.md#handoff-008-dual-x--a-handbrake-mapping-with-edge-latched-transition-immunity`) |
| **`BOUNTY-VD-009`** | `vibrant-darwin` | Menu Trigger Haptic Isolation, 15-Count Deadzone & Soft Recovery | `COMPLETED` | Subagent DeepCoder | 2026-10-16 / 2026-10-16 | `#haptics-adaptive-triggers` | `BOUNTY-VD-001` | PINPOINT 4 Passed | `HANDOFF-009` (`~/Documents/antigravity/vibrant-darwin/PROJECT_HANDOFF.md#handoff-009-menu-trigger-haptic-isolation--15-count-deadzone`) |
| **`BOUNTY-VD-010`** | `vibrant-darwin` | R2 Throttle Vibration Routing (40 Hz mode `0x26`) & Fast Flick Controller Haptic | `COMPLETED` | Subagent DeepCoder | 2026-10-16 / 2026-10-16 | `#haptics-adaptive-triggers` | `BOUNTY-VD-009` | PINPOINT 5 Passed | `HANDOFF-010` (`~/Documents/antigravity/vibrant-darwin/PROJECT_HANDOFF.md#handoff-010-r2-throttle-vibration-routing--fast-motion-controller-flick-haptic`) |
| **`BOUNTY-VD-011`** | `vibrant-darwin` | Capacitive Touchpad Flick Glances (Analog Look Decoupled from `XB_R3`) | `COMPLETED` | Subagent Argon | 2026-10-16 / 2026-10-16 | `#capacitive-touchpad-gestures` | `BOUNTY-VD-001` | PINPOINT 3 Passed (17 checks) | `HANDOFF-011` (`~/Documents/antigravity/vibrant-darwin/PROJECT_HANDOFF.md#handoff-011-capacitive-touchpad-flick-glances-analog-decoupled-from-xb_r3`) |
| **`BOUNTY-VD-012`** | `vibrant-darwin` | Instant Startup Intro Cinematic Bypass (`BootFlow_in/out.bik.bak`) | `COMPLETED` | Subagent DeepInvestigator | 2026-10-16 / 2026-10-16 | `#game-modding-shift2` | None | Direct boot in <2s | `HANDOFF-012` (`~/Documents/antigravity/vibrant-darwin/PROJECT_HANDOFF.md#handoff-012-instant-startup-intro-cinematic-removal`) |
| **`BOUNTY-VD-013`** | `vibrant-darwin` | Targeted PINPOINT Verification Test Suite (114 Exhaustive Checks) | `COMPLETED` | Subagent DeepCoder | 2026-10-16 / 2026-10-16 | `#pinpoint-test-harness` | All VD Bounties | `xinput_proxy_pressure_test.exe` (`~/Documents/antigravity/vibrant-darwin/xinput_proxy_pressure_test.cpp`) (100% Pass) | `HANDOFF-013` (`~/Documents/antigravity/vibrant-darwin/PROJECT_HANDOFF.md#handoff-013-targeted-pinpoint-verification-test-suite-114-checks`) |
| **`BOUNTY-VD-014`** | `vibrant-darwin` | Interactive DualSense Workshop Suite & Live Calibration HUD | `COMPLETED` | Subagent DeepCoder | 2026-10-16 / 2026-10-16 | `#telemetry-visualizer`, `#hardware-hid-dualsense` | `BOUNTY-VD-001` | `gyro_workshop.exe` (`~/Documents/antigravity/vibrant-darwin/gyro_workshop.cpp`) (5 modes) | `HANDOFF-014` (`~/Documents/antigravity/vibrant-darwin/PROJECT_HANDOFF.md#handoff-014-interactive-dualsense-workshop-suite--live-calibration-hud`) |
| **`BOUNTY-GL-015`** | `global` | Multi-Agent Knowledge Repository & Universal Handoff Architecture | `COMPLETED` | Subagent Coding Worker (`7279ff73`) | 2026-10-16 / 2026-10-16 | `#multiagent-architecture` | All Bounties | `~/Documents/antigravity/BOUNTY_BOARD.md`, `~/Documents/antigravity/MULTIAGENT_PROTOCOLS.md`, `~/Documents/antigravity/GLOBAL_KNOWLEDGE_INDEX.md`, `~/Documents/antigravity/vibrant-darwin/PROJECT_HANDOFF.md` | `HANDOFF-015` (`~/Documents/antigravity/vibrant-darwin/PROJECT_HANDOFF.md#handoff-015-multi-agent-knowledge-repository--universal-handoff-architecture`) |
| **`BOUNTY-AET-007`** | `aether-agent` | Aether Mobile Voice Bridge & Hardware Button Gateway | `COMPLETED` | Aether | 2026-10-20 / 2026-10-20 | `#mobile-bridge`, `#voice-gateway`, `#safety-airlock` | None | `~/aether agent/voice_bridge/`, 10/10 Tests Pass | `HANDOFF-006` (`~/aether agent/PROJECT_HANDOFF.md#handoff-006-aether-mobile-voice-bridge--hardware-button-gateway-deployment`) |
| **`BOUNTY-AET-008`** | `aether-agent` | Track 5 NexusHelm Sovereign In-Between Mediator & Steering-Wheel Agency Harness | `COMPLETED` | Aether | 2026-10-30 / 2026-10-30 | `#nexushelm`, `#semantic-airlock`, `#phantom-tokens`, `#taint-lattice`, `#dualsense-haptics` | `BOUNTY-AET-002` | `~/aether agent/nexushelm/`, 12/12 Tests Pass | `HANDOFF-007` (`~/aether agent/PROJECT_HANDOFF.md#handoff-007-track-5-nexushelm-sovereign-in-between-mediator--steering-wheel-agency-harness`) |
| **`BOUNTY-AET-009`** | `aether-agent` | Track 2 Takeout Patent Sieve & Zero-Dirty-Logic Bootloader | `COMPLETED` | Aether | 2026-10-30 / 2026-10-31 | `#quarantine-sieve`, `#minhash-lsh`, `#patent-bootloader` | `BOUNTY-AET-008` | `~/aether agent/takeout_patent_sieve/`, 7/7 Tests Pass | `HANDOFF-008` (`~/aether agent/PROJECT_HANDOFF.md#handoff-008-friday-maximal-simmer-swarm-crucible-completion--public-github-deployment`) |
| **`BOUNTY-AET-010`** | `aether-agent` | Track 3 SimBridge Universal Input & 1-Euro Adaptive Filter Middleware | `COMPLETED` | Aether | 2026-10-30 / 2026-10-31 | `#simbridge`, `#casiez-1euro`, `#smootherstep`, `#game-precompensation` | `BOUNTY-VD-004` | `~/aether agent/simbridge/`, 6/6 Tests Pass | `HANDOFF-008` (`~/aether agent/PROJECT_HANDOFF.md#handoff-008-friday-maximal-simmer-swarm-crucible-completion--public-github-deployment`) |
| **`BOUNTY-AET-011`** | `aether-agent` | Track 4 Arbiter Forge Heterogeneous Cross-Model Consensus Gatekeeper | `COMPLETED` | Aether | 2026-10-30 / 2026-10-31 | `#arbiter-forge`, `#condorcet-consensus`, `#pinpoint-gatekeeper` | `BOUNTY-AET-008` | `~/aether agent/arbiter_forge/`, 5/5 Tests Pass | `HANDOFF-008` (`~/aether agent/PROJECT_HANDOFF.md#handoff-008-friday-maximal-simmer-swarm-crucible-completion--public-github-deployment`) |
| **`BOUNTY-AET-012`** | `aether-agent` | Track 6 Crosswind Flight Dynamics & Blade Element Theory Engine | `COMPLETED` | Aether | 2026-10-30 / 2026-10-31 | `#crosswind`, `#blade-element-theory`, `#ground-effect`, `#viterna-corrigan` | `BOUNTY-AET-004` | `~/aether agent/crosswind/`, 7/7 Tests Pass | `HANDOFF-008` (`~/aether agent/PROJECT_HANDOFF.md#handoff-008-friday-maximal-simmer-swarm-crucible-completion--public-github-deployment`) |
| **`BOUNTY-AET-013`** | `aether-agent` | Antigravity Sanctuary Command Portal & NexusHelm Interactive Steering Deck | `COMPLETED` | Aether | 2026-10-30 / 2026-10-31 | `#portal`, `#react19`, `#vite`, `#nexushelm-ui` | `BOUNTY-AET-008` | `~/Documents/antigravity/portal/`, Built Cleanly | `HANDOFF-008` (`~/aether agent/PROJECT_HANDOFF.md#handoff-008-friday-maximal-simmer-swarm-crucible-completion--public-github-deployment`) |
| **`BOUNTY-AET-014`** | `global` | Public GitHub Multi-Repository Fleet & Thinking-Overlay Branch Mirroring | `COMPLETED` | Aether | 2026-10-30 / 2026-10-31 | `#github-fleet`, `#zero-secrets`, `#isolated-branches` | All Bounties | 4 Public Repos + Releases + 0 Secret Hits | `HANDOFF-008` (`~/aether agent/PROJECT_HANDOFF.md#handoff-008-friday-maximal-simmer-swarm-crucible-completion--public-github-deployment`) |
| **`BOUNTY-AET-015`** | `aether-agent` | Sovereign Terminal Foundry (Web + TUI + WPF) & Dual-Harness Ceiling Alignment (Gemini CLI 0.70.0 MAX/XHigh + Antigravity 1.5.14) | `COMPLETED` | Aether (`Eloquent`) | 2026-11-22 / 2026-11-22 | `#terminal-foundry`, `#gemini-cli`, `#antigravity-harness`, `#schema-audit`, `#thinking-max` | `BOUNTY-AET-005` | `terminal-sovereign-workshop/` (`3f50a3a`), 11/11 REST `MAX` HTTP 200, 4/4 live `gemini` PASS, 27/27 `agy` probed, `0` leaks | `HANDOFF-009` (`~/aether agent/PROJECT_HANDOFF.md#handoff-009-sovereign-terminal-foundry--dual-harness-max-ceiling-alignment`) |
| **`BOUNTY-AET-016`** | `aether-agent` | AGENT CHALLENGE: Cross-Harness Self-Healing Schema Sentinel & Live Model-Capability Drift Gate | `OPEN` | Unassigned (Open Gauntlet) | Open for Claim | `#agent-challenge`, `#schema-sentinel`, `#multi-harness`, `#zero-drift`, `#circuit-breaker` | `BOUNTY-AET-015` | Stage-0 `schema-sentinel.mjs` + non-destructive diff gate + 5-part adversarial suite + TUI/WPF badge | `Challenge Brief` (`~/aether agent/BOUNTY_BOARD.md#4-open-challenge-to-fellow-agents--bounty-aet-016`) |
| **`BOUNTY-VD-016`** | `vibrant-darwin` | Real-time In-Game Telemetry Overlay / OSD for Motion Steering Diagnostics | `OPEN` | Unassigned | Open for Claim | `#telemetry-visualizer`, `#game-modding-shift2` | `BOUNTY-VD-014` | DirectX 9 Hook or External Overlay | TBD |


---

## 4. How to Claim a Bounty or Register a New Task

Incoming agents must adhere to the atomic claiming protocol:

1. **Locate or Define**: Check the table above for an open bounty. If creating a new task, assign the next sequential ID (`BOUNTY-<PROJECT_PREFIX>-<NUMBER>`).
2. **Update Status**: Set `Status` to `CLAIMED` or `IN_PROGRESS`, set `Claimant / Owner` to your Agent Identity / Conversation ID, and record the start timestamp.
3. **Verify Dependencies**: Confirm all prerequisite bounties are `COMPLETED`.
4. **Follow Invariants**: Adhere strictly to the rules in `MULTIAGENT_PROTOCOLS.md` and `SHARED_REPOSITORY.md`.
5. **Verify & Close**: Run all PINPOINT tests, verify SHA256 parity, set `Status` to `COMPLETED`, record the completion timestamp, and append a handoff record to `PROJECT_HANDOFF.md`.


