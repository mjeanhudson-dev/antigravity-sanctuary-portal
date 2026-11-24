---
name: permanent-skill-tree-anchor
description: Anchor, verify, and persist the 5-Layer Carbon Orchestration Stack, progressive LOD 0-1-2 invariants, Flash/Lite shunt model-tier floor (xhigh+ Hydrogen / high cap), 30-minute unsigned idle handoff, and cross-runtime anchored skill integrity across sessions.
metadata:
  icon: anchor
  logo: logo.svg
---

# Permanent Skill-Tree Anchor

Pin foundational architectural invariants, progressive Level-of-Detail (LOD 0-1-2) context boundaries, strict model-tier routing rules, and SHA-256 cryptographic skill verification across sessions and harnesses (`Antigravity`, `Claude Code`, `Codex`, `Gemini CLI`).

## 5-Layer Carbon Orchestration Stack

| Layer | Role | Hard Invariants |
| :--- | :--- | :--- |
| **L0 — Genesis Anchor** | Persist invariant contract & telemetry baseline (`t = 0`, Stability = integral of Anchor * Presence over dt) | Fail closed on missing anchor metadata or invalid schema |
| **L1 — Stage-0 Deterministic Slice** | Offload repetitive scans, AST slicing, hash checks, and tests to deterministic local scripts | `<= 160` lines per AST slice; `< 300`-token stdout deltas |
| **L2 — Progressive LOD 0-1-2** | Retain LOD 0 (objective & invariants) and LOD 1 (symbol contracts/headers); treat LOD 2 bodies as transient | Preserve invariants across compaction & re-coalescence |
| **L3 — Apex Contactor Flash Shunt** | Route Stage 0 directly to frontier models with hard Flash/Lite/Mini/Haiku/Nano bypass | `FLASH_SHUNT = 1`, `minimum_floor = gemini-4-hydrogen-xhigh`, default `high` cap on `neon`/`argon`/`carbon`, `< 6,000`-token packets |
| **L4 — 25:1 Compaction & 30m Watchdog** | Enforce 25:1 cache-read compaction gate + automatic handoff if thread stops unsigned for 30 minutes | `ratio_threshold = 25.0:1`, `turn_threshold = 25`, `unsigned_idle_handoff_30m = true` |

## Anchored Runtime Skills

- **`audit-the-audit`**: Zero-anchor blind headless parity verification with SHA-256 Commit-Reveal barrier, 6-surface probe, and 12-case `--selftest`.
- **`swarm-salvage-re-coalescence`**: Forensic swarm transcript salvage, Goal-vs-Disk diffing, single-writer wave partitioning, and 10-case `--selftest`.

## Stage-0 Verification Workflow

1. **Initialize a baseline anchor manifest (`init`):**
   ```bash
   PYTHONDONTWRITEBYTECODE=1 python -B ~/.gemini/config/skills/permanent-skill-tree-anchor/scripts/anchor_probe.py init --out anchor_state.json
   ```
2. **Verify anchor invariants and cross-runtime disk parity (`verify`):**
   ```bash
   PYTHONDONTWRITEBYTECODE=1 python -B ~/.gemini/config/skills/permanent-skill-tree-anchor/scripts/anchor_probe.py verify --state anchor_state.json --check-disk
   ```
3. **Run the 8-case Popperian self-test suite (`--selftest`):**
   ```bash
   PYTHONDONTWRITEBYTECODE=1 python -B ~/.gemini/config/skills/permanent-skill-tree-anchor/scripts/anchor_probe.py --selftest
   ```

**Completion Criterion:** `verify --check-disk` exits `0` (`ANCHOR_VERIFIED`), confirming `FLASH_SHUNT` engagement, `minimum_floor == gemini-4-hydrogen-xhigh`, zero UTF-8 BOM or CRLF line endings across anchored skills, valid cross-runtime junctions, and exact SHA-256 parity.
