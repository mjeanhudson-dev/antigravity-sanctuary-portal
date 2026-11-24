---
name: swarm-salvage-re-coalescence
description: Use when recovering crashed, stalled, or interrupted multi-agent swarm runs, extracting unapplied worker audits from transcripts, diffing original swarm target goals against salvaged disk trees, or partitioning single-writer finishing waves to harden deliverables into an ideal end-state.
---

# Swarm Salvage & Commensurate Re-Coalescence

Recover stalled, crashed, or interrupted multi-agent swarm trees without losing landed code or unapplied worker audits, diff the salvaged disk state against the original swarm's ideal target end-state, partition a collision-free single-writer finishing wave, and seal a zero-drift cryptographic rehydration capsule (`rehydration.capsule.v2`).

## Core Invariants

1. **Salvage Before Writing:** Always reconstruct completed disk work and unapplied transcript audits before mutating files so working implementations are preserved and already-diagnosed defects are repaired in one coordinated wave.
2. **Single-Writer Disjointness:** Assign every mutable file or path glob to at most one author worker; assign read-only verifiers at a ratio of `1` verifier per `2-4` authors.
3. **Explicit Frontier Model Lock:** Specify an explicit `model` of at least `gemini-4-hydrogen-xhigh` on every spawned swarm worker (keeping `gemini-4-neon`, `gemini-4-argon`, and `gemini-4-carbon` capped at `high` unless a workflow explicitly demands escalation).
4. **Ideal End-State Over Band-Aids:** Judge completion against the original swarm's full architectural goal and best-practice hygiene rather than minimal hotfixes.

---

## Phase 1: Forensic Salvage & Goal-vs-Disk Diff (`salvage`)

Inspect the workspace tree, surviving subagent/swarm transcripts (`transcript.jsonl` / `transcript_full.jsonl` / board logs), and original target specification to classify every target into one of four states:

- `LANDED_VERIFIED`: Matches target file expectations and passes disk/hash checks.
- `SALVAGED_UNAPPLIED_AUDIT`: Stalled or crashed worker left actionable defect findings or planned edits in transcript logs with zero conflicting disk writes.
- `DRIFTED_PARTIAL`: Target exists on disk but diverges from best-practice invariants (BOM, CRLF, OS path leaks, outdated docs/contracts).
- `UNTOUCHED_GOAL`: Required deliverable is missing on disk and unstarted in logs.

Run the deterministic Stage-0 engine (`PYTHONDONTWRITEBYTECODE=1`, never creates `__pycache__`):

```bash
PYTHONDONTWRITEBYTECODE=1 python -B ~/.gemini/config/skills/swarm-salvage-re-coalescence/scripts/salvage_re_coalesce.py salvage --spec salvage_spec.json --out salvage_report.json
```

**Completion Criterion:** Every target path and transcript defect entry is classified, `merkle_root` is emitted in `salvage_report.json`, and zero working files have been overwritten.

---

## Phase 2: Commensurate Tree Partition & Plan Generation (`partition`)

Partition all `SALVAGED_UNAPPLIED_AUDIT`, `DRIFTED_PARTIAL`, and `UNTOUCHED_GOAL` items into a topological multi-wave execution roster with strictly disjoint `owned_paths`, explicit allowed `model` tags, and read-only verification gates:

```bash
PYTHONDONTWRITEBYTECODE=1 python -B ~/.gemini/config/skills/swarm-salvage-re-coalescence/scripts/salvage_re_coalesce.py partition --report salvage_report.json --roster roster.json --out plan.json
```

`partition` fails closed (`exit 2`) if two writers overlap on any file/glob or if any worker lacks an explicit allowed model tier. Write the generated `plan.json` to the Swarm UI overview (`swarm_pane`), spawn all workers in parallel waves, and coordinate handoffs on the board via sequence numbers (`#seq`).

**Completion Criterion:** `plan.json` validates with zero writer collisions, zero disallowed models, and every open delta mapped to an active owner and downstream verifier.

---

## Phase 3: Ideal End-State Hardening, Seal & Verify (`seal` / `verify`)

Once builders and read-only verifiers post `[done]` across runtime checks and repository hygiene gates (`verify-public-push.mjs --strict-agnostic` when publishing), seal the canonical state into a verifiable SHA-256 capsule and calibrate the Stage-0 probe:

```bash
PYTHONDONTWRITEBYTECODE=1 python -B ~/.gemini/config/skills/swarm-salvage-re-coalescence/scripts/salvage_re_coalesce.py seal --root . --out REHYDRATION_CAPSULE.json --name project-slug
PYTHONDONTWRITEBYTECODE=1 python -B ~/.gemini/config/skills/swarm-salvage-re-coalescence/scripts/salvage_re_coalesce.py verify --capsule REHYDRATION_CAPSULE.json --root .
PYTHONDONTWRITEBYTECODE=1 python -B ~/.gemini/config/skills/swarm-salvage-re-coalescence/scripts/salvage_re_coalesce.py --selftest
```

**Completion Criterion:** `verify` exits `0` with `drift_count == 0` and valid Merkle integrity, and `--selftest` passes `10/10` positive and fault-injection cases.
