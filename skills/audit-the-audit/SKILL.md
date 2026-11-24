---
name: audit-the-audit
description: Use when the user says "audit the audit" or asks for blind, independent, or headless parity verification, or after high-stakes rollbacks, teardowns, deployments, credential remediations, migrations, or self-audits where confirmation bias or residual drift must be ruled out.
---

# Audit the Audit (Blind Headless Parity Verification)

Independently verify a completed operation or prior self-audit by dispatching a fresh, **blind**, **read-only** headless parity auditor that knows **only the Target End-State Contract** and **zero leading parameters**.

## When to Use

- Explicit requests to "audit the audit" or run blind/independent/headless parity verification.
- After high-stakes rollbacks, teardowns, deployments, secret/credential remediations, multi-repo syncs, or config hardening where a self-audit already claims "clean" or "1:1".
- **Skip** for trivial single-file edits, routine unit tests, or work that has not completed its initial verification pass.

## Step 1 — Pre-Register Commitment & Information Barrier

Construct the auditor's specification using a **Commit-Reveal Information Barrier**:

| Include (Target End-State) | Withhold (Zero-Anchor Rule) |
| --- | --- |
| Concrete target paths, repos, branches, endpoints, cloud projects, env scopes, and observable invariants ("absent", "matches live remote default branch", "passes `--selftest` and live wire probe") | Expected SHA-256 hashes, commit SHAs, byte sizes, or line counts |
| All 6 coverage lattice surfaces (`disk_wire`, `links_collisions`, `ram_daemons`, `scm_residue`, `env_acls`, `docs_telemetry`) | Prior edit history, rollback diffs, command transcripts, or steps taken to reach this state |
| Strict safety rules (read-only only; zero secret printing; `PYTHONDONTWRITEBYTECODE=1` / `python -B`; bounded timeouts) | Your prior audit verdict, "already verified" claims, or hypotheses about what might have drifted |

Before dispatching, seal your private expected claims behind a salted SHA-256 commitment and fail closed on any prompt leakage using `scripts/blind_parity_probe.py`:

```powershell
$env:PYTHONDONTWRITEBYTECODE = "1"
python -B ~/.gemini/config/skills/audit-the-audit/scripts/blind_parity_probe.py commit --claims <private-claims.json> --prompt <draft-prompt.txt> --out <private-reveal.json>
```

Keep `<private-reveal.json>` solely on the caller side; pass only the barrier-checked blind prompt to the subagent.

## Step 2 — Dispatch a Fresh, Blind, Read-Only Auditor

Spawn a **brand-new** subagent with zero inherited conversation history. Never `fork` the parent session, never reuse a subagent from the audited work, and never downgrade to Flash/Lite tiers.

| Runtime | Dispatch Mechanism |
| --- | --- |
| Antigravity / Antigravity CLI | `invoke_subagent` with `TypeName="self"`, `Model="inherit"` (use `TypeName="research"` only if static file reads suffice and no shell/process/remote/cloud checks are needed) |
| Gemini CLI | `invoke_agent` with `agent_name="generalist"` |
| Claude Code / Codex | Fresh subagent / `Agent` call with zero prior thread context |

Use this prompt template, filling only `{TARGET_END_STATE_CONTRACT}`:

```text
You are an independent, blind, READ-ONLY headless parity auditor.
You MUST NOT modify, edit, write, delete, stage, commit, kill, or mutate any file, git ref, process, environment variable, scheduled task, or external/cloud resource.

Read-only hygiene invariants:
- Python syntax checks: set PYTHONDONTWRITEBYTECODE=1 and run `python -B` using in-memory `ast.parse` / `SourceFileLoader.source_to_code` (never write `__pycache__/*.pyc` via disk `py_compile`).
- Git remote checks: set GIT_TERMINAL_PROMPT=0 and GCM_INTERACTIVE=never with bounded timeouts (<= 8s); use read-only `git ls-remote`, `git for-each-ref`, `git status --short --untracked-files=all`, `git stash list` (never `git fetch` or `git gc`).
- External/cloud CLIs: disable interactive prompts (e.g., `CLOUDSDK_CORE_DISABLE_PROMPTS=1`) and use read-only list/show verbs with bounded wall-clock timeouts.
- Windows PowerShell: pipe inline Python via `@'...'@ | python -B -` here-strings (never bash `<<`).
- Secrets: NEVER print raw tokens, API keys, client secrets, private keys, or `.env` values; report presence, byte size, 16-char SHA-256 prefix, non-secret IDs, and ACLs only.

Sweep beyond on-disk files using the 6-Surface Coverage Lattice (marking every surface MEASURED, N_A, BLOCKED, or TIMED_OUT; optionally running `scripts/blind_parity_probe.py probe --spec <non-anchored-spec.json>`):
1. `disk_wire`: On-disk target files, integrity hashes, syntax, and live non-mutating runtime/wire probes.
2. `links_collisions`: Cross-runtime links/junctions, `realpath`/`samefile`, and plugin/builtin collision scans.
3. `ram_daemons`: Live RAM processes, background daemons, or stdio workers spawned before the audited change (PIDs + start timestamps).
4. `scm_residue`: SCM parity (local HEAD vs. live remote refs) plus `.git` residue (`refs/backups/*`, `ORIG_HEAD`, `COMMIT_EDITMSG`, stashes, locks, untracked artifacts).
5. `env_acls`: Environment variables across all scopes (Process, User, Machine) and file ACLs/permissions.
6. `docs_telemetry`: Docs, briefs, manifests, or telemetry cross-checked against live reality.

### Target End-State / Goal Contract
{TARGET_END_STATE_CONTRACT}

### Required Deliverable
Return a cold, adversarial **Blind Parity Audit Report** containing:
1. **Overall Parity Verdict:** exactly one of `1:1 CLEAN`, `1:1 WITH RESIDUAL DRIFT`, or `FAIL`.
2. **Per-Domain Verdict Table:** `Domain | Blind Verdict (PASS / DRIFT / FAIL) | Coverage State | Independently Measured Evidence` (exact SHA-256 prefixes, Merkle root if generated, commit SHAs, sizes, counts, exit codes, PIDs + start timestamps).
3. **Discrepancies / Residual Artifacts Found:** severity-ranked (`High` / `Medium` / `Low`) with exact paths, PIDs, line numbers, or resource IDs (or explicitly `None`).
```

## Step 3 — Cryptographic Reconcile & Report Unedited

1. Verify the blind auditor's receipt Merkle root and open your pre-registered commitment to compute the **Audit-vs-Reality Delta**:
   ```powershell
   $env:PYTHONDONTWRITEBYTECODE = "1"
   python -B ~/.gemini/config/skills/audit-the-audit/scripts/blind_parity_probe.py reconcile --reveal <private-reveal.json> --receipt <blind-receipt.json>
   ```
2. Surface the auditor's verdict and every flagged discrepancy **unedited** — never downgrade, omit, or rationalize away a finding.
3. If your prior audit claimed clean while the blind auditor returned `DRIFT` or `FAIL`, explicitly report the **Audit-vs-Reality Delta**.
4. Calibrate the engine after any probe edit using `python -B ~/.gemini/config/skills/audit-the-audit/scripts/blind_parity_probe.py --selftest` (must pass 12/12 positive and adversarial fault-injection cases).
5. Remain read-only after reporting unless remediation is authorized; if you remediate drift, dispatch a fresh blind pass over the remediated surface to verify `1:1 CLEAN`.

## Common Failure Modes

| Trap | Countermeasure |
| --- | --- |
| Leaking expected SHAs, hashes, or "confirm rollback succeeded" into the prompt | Run `commit` gate to fail closed on hex/numeric/phrase leakage |
| Hanging indefinitely on interactive `git ls-remote` or GCM prompts | Enforce `GIT_TERMINAL_PROMPT=0`, `GCM_INTERACTIVE=never`, and `<= 8s` timeouts |
| Silently skipping RAM, SCM, or ACL surfaces under stochastic tool planning | Require explicit 6-Surface Coverage Lattice states + Merkle receipt |
| Reusing a task subagent or forking parent conversation context | Always dispatch a fresh isolated subagent |
| Mutating state while inspecting (`py_compile` writing `.pyc`, `git fetch` updating refs) | Enforce `python -B` in-memory compile and timeout-bounded `git ls-remote` |
| Uncalibrated verifier that only passes and cannot detect synthetic drift | Run `--selftest` 12-case Popperian fault-injection calibration |
