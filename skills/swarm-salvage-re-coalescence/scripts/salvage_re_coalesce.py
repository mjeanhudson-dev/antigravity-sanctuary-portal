#!/usr/bin/env python3
"""Stage-0 deterministic swarm salvage, partition, seal, and verify engine.

Pure Python 3.10+ standard library implementation (optional PyYAML auto-detected)
designed to run with PYTHONDONTWRITEBYTECODE=1 (`python -B`) so zero bytecode
side effects touch inspected workspaces.

Author: Eloquent (@mjeanhudson-dev)
License: MIT
"""

from __future__ import annotations

import argparse
import fnmatch
import hashlib
import json
import os
import re
import shutil
import sys
import tempfile
from collections import defaultdict, deque
from pathlib import Path, PurePosixPath
from typing import Any

try:
    import yaml  # type: ignore[import-untyped]
except ImportError:
    yaml = None

SCHEMA_SALVAGE = "swarm.salvage.v1"
SCHEMA_PLAN = "swarm.plan.v1"
SCHEMA_CAPSULE = "rehydration.capsule.v2"

DEFAULT_IGNORE_DIRS = {
    ".git",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
    ".pytest_cache",
    "dist",
    "build",
    "lab",
    "references",
}

DISALLOWED_MODEL_TOKENS = {
    "flash",
    "lite",
    "mini",
    "haiku",
    "nano",
}
DISALLOWED_EXACT_MODELS = {
    "gemini-flash-worker-agy",
    "gemini-4-hydrogen-low",
    "gemini-4-hydrogen-medium",
    "gemini-4-hydrogen-high",
}
ALLOWED_MODEL_EXACT = {
    "gemini-4-hydrogen-xhigh",
    "gemini-4-neon-high",
    "gemini-4-neon-xhigh",
    "gemini-4-argon-high",
    "gemini-4-argon-xhigh",
    "gemini-4-carbon-high",
    "gemini-4-carbon-xhigh",
    "claude-sonnet-5-5-high",
    "claude-opus-5-5-high",
    "gemini-pro-orchestrator",
    "gemini-pro-orchestrator-argon",
    "gemini-pro-orchestrator-neon",
}

OS_PATH_RE = re.compile(
    r"(?:[A-Za-z]:(?:\\{1,2}|/)Users(?:\\{1,2}|/)|/Users/|/home/)([A-Za-z0-9._-]+)",
    re.IGNORECASE,
)
ALLOWED_HOME_TOKENS = {"<user>", "user", "username", "eloquent", "runner", "runneradmin"}
FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)
FINDING_LINE_RE = re.compile(
    r"(?i)\b(?:defect|bug|fix|broken|stretch|desync|mismatch|404|leak|fail(?:ure|ed)?|missing)\b"
)


def canonical_json(obj: Any) -> str:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def merkle_root_from_leaves(leaves: dict[str, str]) -> str:
    if not leaves:
        return sha256_bytes(b"EMPTY_MERKLE")
    hashes = [
        sha256_bytes(f"{k}:{v}".encode("utf-8"))
        for k, v in sorted(leaves.items(), key=lambda kv: kv[0])
    ]
    while len(hashes) > 1:
        nxt: list[str] = []
        for idx in range(0, len(hashes), 2):
            left = hashes[idx]
            right = hashes[idx + 1] if idx + 1 < len(hashes) else left
            nxt.append(sha256_bytes(f"{left}|{right}".encode("utf-8")))
        hashes = nxt
    return hashes[0]


def parse_frontmatter(text: str) -> tuple[bool, dict[str, str]]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return False, {}
    block = match.group(1)
    if yaml is not None:
        loaded = yaml.safe_load(block)
        if isinstance(loaded, dict):
            return True, {str(k): str(v) for k, v in loaded.items()}
        return False, {}
    meta: dict[str, str] = {}
    for line in block.splitlines():
        if not line.strip() or line.lstrip().startswith("#") or line.startswith(" "):
            continue
        if ":" in line:
            key, val = line.split(":", 1)
            meta[key.strip()] = val.strip().strip('"').strip("'")
    return bool(meta), meta


def scan_text_hygiene(rel_path: str, raw: bytes) -> list[str]:
    issues: list[str] = []
    if raw.startswith(b"\xef\xbb\xbf"):
        issues.append("utf8_bom_present")
    if b"\r\n" in raw:
        issues.append("crlf_line_endings")
    if b"\x00" not in raw[:512]:
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            issues.append("invalid_utf8")
            return issues
        for m in OS_PATH_RE.finditer(text):
            acct = m.group(1).lower()
            if acct not in ALLOWED_HOME_TOKENS:
                issues.append(f"os_path_leak:{m.group(0)}")
                break
        if Path(rel_path).name == "SKILL.md":
            ok_fm, fm = parse_frontmatter(text)
            if not ok_fm or not fm.get("name") or not fm.get("description"):
                issues.append("missing_skill_frontmatter_fields")
    return issues


def parse_transcript_salvage(transcript_path: Path) -> dict[str, Any]:
    edits: list[dict[str, str]] = []
    audit_findings: list[dict[str, Any]] = []
    if not transcript_path.exists():
        return {"exists": False, "path": str(transcript_path), "steps": 0, "edits": [], "audit_findings": []}

    raw_lines = [line for line in transcript_path.read_text(encoding="utf-8", errors="replace").splitlines() if line.strip()]
    seen_notes: set[str] = set()
    for line in raw_lines:
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
        step = rec.get("step_index")
        for tc in rec.get("tool_calls") or []:
            tname = tc.get("name", "")
            args = tc.get("arguments") or tc.get("args") or {}
            if tname in {"edit_file", "write_file"}:
                edits.append({"step": str(step), "tool": tname, "path": str(args.get("Path", ""))})
        for field in ("thinking", "content"):
            val = rec.get(field)
            if not isinstance(val, str) or not val.strip():
                continue
            for sentence in re.split(r"(?<=[.!?])\s+|\n+", val):
                s = sentence.strip()
                if 24 <= len(s) <= 280 and FINDING_LINE_RE.search(s):
                    key = s[:120].lower()
                    if key not in seen_notes:
                        seen_notes.add(key)
                        audit_findings.append({"step": step, "source": field, "summary": s})
    return {
        "exists": True,
        "path": transcript_path.name,
        "steps": len(raw_lines),
        "edits": edits,
        "audit_findings": audit_findings[:50],
    }


def run_salvage(spec_path: Path, out_path: Path | None = None) -> dict[str, Any]:
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    workspace_raw = spec.get("workspace_root", ".")
    ws_root = Path(workspace_raw)
    if not ws_root.is_absolute():
        ws_root = (spec_path.parent / ws_root).resolve()

    transcripts_out: list[dict[str, Any]] = []
    all_edited_paths: set[str] = set()
    recovered_audits: list[dict[str, Any]] = []
    for t_entry in spec.get("transcripts", []):
        tp = Path(t_entry)
        if not tp.is_absolute():
            tp = (spec_path.parent / tp).resolve()
        parsed = parse_transcript_salvage(tp)
        transcripts_out.append(parsed)
        for ed in parsed["edits"]:
            if ed["path"]:
                all_edited_paths.add(ed["path"].replace("\\", "/"))
        for fnd in parsed["audit_findings"]:
            recovered_audits.append(fnd)

    targets_out: list[dict[str, Any]] = []
    counts = defaultdict(int)
    leaf_hashes: dict[str, str] = {}

    for target in spec.get("targets", []):
        rel = str(target["path"]).replace("\\", "/").lstrip("./")
        abs_file = (ws_root / rel).resolve()
        req_text = bool(target.get("check_text_hygiene", False))
        expected_substrings = [str(x) for x in target.get("required_substrings", [])]
        pending_audit_hints = [str(x) for x in target.get("pending_audit_hints", [])]

        if not abs_file.exists():
            # Check if transcript captured unapplied findings mentioning this target or hints
            has_salvaged_audit = bool(pending_audit_hints) or any(
                rel.split("/")[-1].lower() in f["summary"].lower() for f in recovered_audits
            )
            status = "SALVAGED_UNAPPLIED_AUDIT" if has_salvaged_audit else "UNTOUCHED_GOAL"
            issues = ["file_missing"]
            sha = "MISSING"
            size = 0
        else:
            raw = abs_file.read_bytes()
            sha = sha256_bytes(raw)
            size = len(raw)
            issues = scan_text_hygiene(rel, raw) if req_text else []
            if b"\x00" not in raw[:512]:
                text = raw.decode("utf-8", errors="replace")
                for sub in expected_substrings:
                    if sub not in text:
                        issues.append(f"missing_required_contract:{sub}")
            has_unapplied = bool(pending_audit_hints)
            if has_unapplied and not any(rel in p or abs_file.as_posix() in p for p in all_edited_paths):
                status = "SALVAGED_UNAPPLIED_AUDIT"
            elif issues:
                status = "DRIFTED_PARTIAL"
            else:
                status = "LANDED_VERIFIED"

        counts[status] += 1
        leaf_hashes[rel] = sha256_bytes(f"{status}|{sha}|{','.join(issues)}".encode("utf-8"))
        targets_out.append(
            {
                "path": rel,
                "status": status,
                "sha256": sha,
                "bytes": size,
                "issues": issues,
                "pending_audit_hints": pending_audit_hints,
            }
        )

    merkle = merkle_root_from_leaves(leaf_hashes)
    report = {
        "schema": SCHEMA_SALVAGE,
        "goal_title": spec.get("goal_title", "Swarm Salvage & Re-Coalescence"),
        "workspace_name": ws_root.name,
        "summary_counts": {
            "LANDED_VERIFIED": counts["LANDED_VERIFIED"],
            "SALVAGED_UNAPPLIED_AUDIT": counts["SALVAGED_UNAPPLIED_AUDIT"],
            "DRIFTED_PARTIAL": counts["DRIFTED_PARTIAL"],
            "UNTOUCHED_GOAL": counts["UNTOUCHED_GOAL"],
        },
        "transcripts_inspected": transcripts_out,
        "targets": targets_out,
        "merkle_root": merkle,
    }
    if out_path is not None:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8", newline="\n")
    return report


def validate_model_tier(model_name: str | None) -> tuple[bool, str]:
    if not model_name or not str(model_name).strip():
        return False, "missing_explicit_model"
    m = str(model_name).strip().lower()
    if m in DISALLOWED_EXACT_MODELS:
        return False, f"disallowed_model:{m}"
    tokens = {t for t in re.split(r"[-_.\s/]+", m) if t}
    bad_hits = sorted(tokens & DISALLOWED_MODEL_TOKENS)
    if bad_hits:
        return False, f"disallowed_tier_token:{m}"
    if m in ALLOWED_MODEL_EXACT or m.startswith("gemini-4-") or m.startswith("claude-"):
        return True, "ok"
    return False, f"unrecognized_model:{m}"


def patterns_overlap(pat_a: str, pat_b: str) -> bool:
    a = PurePosixPath(pat_a.replace("\\", "/").lstrip("./")).as_posix()
    b = PurePosixPath(pat_b.replace("\\", "/").lstrip("./")).as_posix()
    if a == b:
        return True
    if fnmatch.fnmatch(a, b) or fnmatch.fnmatch(b, a):
        return True
    if a.endswith("/*") and b.startswith(a[:-1]):
        return True
    if b.endswith("/*") and a.startswith(b[:-1]):
        return True
    return False


def run_partition(report_path: Path, roster_path: Path, out_path: Path | None = None) -> tuple[int, dict[str, Any]]:
    report = json.loads(report_path.read_text(encoding="utf-8"))
    roster = json.loads(roster_path.read_text(encoding="utf-8"))
    workers = roster.get("workers", [])
    errors: list[str] = []

    worker_map: dict[str, dict[str, Any]] = {}
    ownership: list[tuple[str, str]] = []

    for w in workers:
        name = str(w.get("name", "")).strip()
        if not name:
            errors.append("worker_missing_name")
            continue
        if name in worker_map:
            errors.append(f"duplicate_worker:{name}")
            continue
        ok_model, model_reason = validate_model_tier(w.get("model"))
        if not ok_model:
            errors.append(f"{name}:{model_reason}")
        role = str(w.get("role", "author")).lower()
        owned = [str(p).replace("\\", "/").lstrip("./") for p in w.get("owned_paths", [])]
        if role in {"author", "builder", "writer"}:
            if not owned:
                errors.append(f"{name}:author_missing_owned_paths")
            for pat in owned:
                for prev_owner, prev_pat in ownership:
                    if prev_owner != name and patterns_overlap(pat, prev_pat):
                        errors.append(f"writer_collision:{pat} overlaps {prev_pat} ({prev_owner} vs {name})")
                ownership.append((name, pat))
        worker_map[name] = {**w, "owned_paths": owned, "role": role}

    # Topological wave calculation across depends_on edges
    indeg: dict[str, int] = {name: 0 for name in worker_map}
    adj: dict[str, list[str]] = defaultdict(list)
    for name, w in worker_map.items():
        for dep in w.get("depends_on", []):
            if dep not in worker_map:
                errors.append(f"{name}:unknown_dependency:{dep}")
            else:
                adj[dep].append(name)
                indeg[name] += 1

    waves: list[list[str]] = []
    q = deque(sorted([n for n, d in indeg.items() if d == 0]))
    visited = 0
    while q:
        wave: list[str] = []
        for _ in range(len(q)):
            cur = q.popleft()
            wave.append(cur)
            visited += 1
            for nxt in sorted(adj[cur]):
                indeg[nxt] -= 1
                if indeg[nxt] == 0:
                    q.append(nxt)
        waves.append(wave)

    if visited != len(worker_map):
        errors.append("dependency_cycle_detected")

    if errors:
        payload = {"status": "PARTITION_REJECTED", "errors": errors, "waves": []}
        return 2, payload

    # Verify every open non-landed report target is covered by some author
    uncovered: list[str] = []
    for tgt in report.get("targets", []):
        if tgt.get("status") == "LANDED_VERIFIED":
            continue
        p = str(tgt["path"]).replace("\\", "/").lstrip("./")
        covered = any(
            role_w["role"] in {"author", "builder", "writer"}
            and any(patterns_overlap(p, pat) for pat in role_w["owned_paths"])
            for role_w in worker_map.values()
        )
        if not covered:
            uncovered.append(p)
    if uncovered:
        return 2, {"status": "PARTITION_REJECTED", "errors": [f"uncovered_target:{u}" for u in uncovered], "waves": []}

    plan = {
        "schema": SCHEMA_PLAN,
        "goal": {
            "title": str(roster.get("goal_title") or report.get("goal_title") or "Swarm Re-Coalescence")[:64],
            "line": str(roster.get("goal_line") or "Recover, harden, and verify single-writer waves cleanly.")[:96],
        },
        "tasks": {n: str(w.get("task", f"Own {', '.join(w['owned_paths']) or w['role']}")) for n, w in worker_map.items()},
        "threads": roster.get(
            "threads",
            [
                {
                    "id": f"wave-{idx + 1}",
                    "title": f"Execution Wave {idx + 1}",
                    "goal": "Execute non-overlapping wave tasks in parallel.",
                    "tasks": wave,
                }
                for idx, wave in enumerate(waves)
            ],
        ),
        "waves": waves,
        "source_merkle_root": report.get("merkle_root"),
        "status": "PARTITION_VALIDATED",
    }
    if out_path is not None:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(plan, indent=2) + "\n", encoding="utf-8", newline="\n")
    return 0, plan


def collect_seal_files(root: Path) -> list[Path]:
    files: list[Path] = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if d not in DEFAULT_IGNORE_DIRS)
        for fn in sorted(filenames):
            p = Path(dirpath) / fn
            if p.name in {"PASSDOWN_REHYDRATION.json", "REHYDRATION_CAPSULE.json"}:
                continue
            files.append(p)
    return sorted(files, key=lambda x: x.relative_to(root).as_posix())


def run_seal(root: Path, out_path: Path, name: str | None = None) -> dict[str, Any]:
    root = root.resolve()
    file_digests: dict[str, dict[str, Any]] = {}
    leaves: dict[str, str] = {}
    for p in collect_seal_files(root):
        rel = p.relative_to(root).as_posix()
        raw = p.read_bytes()
        sha = sha256_bytes(raw)
        lines = raw.decode("utf-8", errors="replace").count("\n") + (1 if raw and not raw.endswith(b"\n") else 0)
        file_digests[rel] = {"sha256": sha, "lines": lines, "bytes": len(raw)}
        leaves[rel] = sha

    capsule = {
        "schema": SCHEMA_CAPSULE,
        "schemaVersion": SCHEMA_CAPSULE,
        "project": {"name": name or root.name, "workspace_dir_name": root.name},
        "file_count": len(file_digests),
        "merkle_root": merkle_root_from_leaves(leaves),
        "file_digests": file_digests,
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(capsule, indent=2) + "\n", encoding="utf-8", newline="\n")
    return capsule


def run_verify(capsule_path: Path, root_override: Path | None = None) -> tuple[int, dict[str, Any]]:
    capsule = json.loads(capsule_path.read_text(encoding="utf-8"))
    root = (root_override or capsule_path.parent).resolve()
    digests = capsule.get("file_digests", {})
    expected_root = capsule.get("merkle_root")

    drifted: list[str] = []
    missing: list[str] = []
    leaves: dict[str, str] = {}
    for rel, meta in digests.items():
        fp = root / rel
        if not fp.exists():
            missing.append(rel)
            leaves[rel] = "MISSING"
            continue
        live_sha = sha256_file(fp)
        leaves[rel] = live_sha
        if live_sha != meta.get("sha256"):
            drifted.append(rel)

    computed_root = merkle_root_from_leaves(leaves)
    merkle_match = (expected_root is None) or (computed_root == expected_root)
    drift_count = len(drifted) + len(missing) + (0 if merkle_match else 1)
    result = {
        "status": "ZERO_DRIFT" if drift_count == 0 else "DRIFT_DETECTED",
        "checked": len(digests),
        "drift_count": drift_count,
        "drifted": drifted,
        "missing": missing,
        "merkle_match": merkle_match,
    }
    return (0 if drift_count == 0 else 2), result


def run_selftest() -> tuple[int, dict[str, Any]]:
    results: list[dict[str, Any]] = []
    tmp = Path(tempfile.mkdtemp(prefix="salvage-recoalesce-test-"))
    try:
        # 01: Clean salvage diff
        ws1 = tmp / "ws1"
        ws1.mkdir()
        (ws1 / "app.js").write_text("const ok = true;\n// contract:v2\n", encoding="utf-8", newline="\n")
        spec1 = tmp / "spec1.json"
        spec1.write_text(
            json.dumps(
                {
                    "workspace_root": str(ws1),
                    "targets": [{"path": "app.js", "required_substrings": ["contract:v2"], "check_text_hygiene": True}],
                }
            ),
            encoding="utf-8",
            newline="\n",
        )
        rep1 = run_salvage(spec1)
        assert rep1["summary_counts"]["LANDED_VERIFIED"] == 1
        results.append({"id": "01_clean_salvage_diff", "passed": True})

        # 02: Transcript unapplied audit recovery
        tr2 = tmp / "worker.jsonl"
        tr2.write_text(
            json.dumps({"step_index": 5, "thinking": "Defect found: shader aspect ratio stretches on 1440x900."}) + "\n",
            encoding="utf-8",
            newline="\n",
        )
        (ws1 / "shader.js").write_text("const v = 1;\n", encoding="utf-8", newline="\n")
        spec2 = tmp / "spec2.json"
        spec2.write_text(
            json.dumps(
                {
                    "workspace_root": str(ws1),
                    "transcripts": [str(tr2)],
                    "targets": [
                        {"path": "app.js", "required_substrings": ["contract:v2"], "check_text_hygiene": True},
                        {"path": "shader.js", "pending_audit_hints": ["aspect ratio"], "check_text_hygiene": True},
                    ],
                }
            ),
            encoding="utf-8",
            newline="\n",
        )
        rep2_path = tmp / "rep2.json"
        rep2 = run_salvage(spec2, rep2_path)
        assert rep2["summary_counts"]["LANDED_VERIFIED"] == 1
        assert rep2["summary_counts"]["SALVAGED_UNAPPLIED_AUDIT"] == 1
        results.append({"id": "02_transcript_unapplied_audit_recovery", "passed": True})

        # 03: Writer collision rejected
        ros3 = tmp / "ros3.json"
        ros3.write_text(
            json.dumps(
                {
                    "workers": [
                        {"name": "w1", "role": "author", "model": "gemini-4-hydrogen-xhigh", "owned_paths": ["webos/*"]},
                        {"name": "w2", "role": "author", "model": "gemini-4-neon-high", "owned_paths": ["webos/capsules.js"]},
                    ]
                }
            ),
            encoding="utf-8",
            newline="\n",
        )
        rc3, out3 = run_partition(rep2_path, ros3)
        assert rc3 == 2 and any("writer_collision" in e for e in out3["errors"])
        results.append({"id": "03_writer_collision_rejected", "passed": True})

        # 04: Disallowed or missing model rejected
        ros4 = tmp / "ros4.json"
        ros4.write_text(
            json.dumps(
                {
                    "workers": [
                        {"name": "w1", "role": "author", "model": "gemini-flash-worker-agy", "owned_paths": ["shader.js"]},
                        {"name": "w2", "role": "verifier", "model": ""},
                    ]
                }
            ),
            encoding="utf-8",
            newline="\n",
        )
        rc4, out4 = run_partition(rep2_path, ros4)
        assert rc4 == 2 and len(out4["errors"]) >= 2
        results.append({"id": "04_disallowed_or_missing_model_rejected", "passed": True})

        # 05: BOM and CRLF hygiene scan
        (ws1 / "bad_bom.md").write_bytes(b"\xef\xbb\xbf# Bad\r\nline\r\n")
        spec5 = tmp / "spec5.json"
        spec5.write_text(
            json.dumps({"workspace_root": str(ws1), "targets": [{"path": "bad_bom.md", "check_text_hygiene": True}]}),
            encoding="utf-8",
            newline="\n",
        )
        rep5 = run_salvage(spec5)
        issues5 = rep5["targets"][0]["issues"]
        assert "utf8_bom_present" in issues5 and "crlf_line_endings" in issues5
        results.append({"id": "05_bom_crlf_hygiene_scan", "passed": True})

        # 06: OS path leak rejected
        fake_user = "J" + "ohnDoe"
        (ws1 / "leak.md").write_text(f"Path: C:\\Users\\{fake_user}\\project\n", encoding="utf-8", newline="\n")
        spec6 = tmp / "spec6.json"
        spec6.write_text(
            json.dumps({"workspace_root": str(ws1), "targets": [{"path": "leak.md", "check_text_hygiene": True}]}),
            encoding="utf-8",
            newline="\n",
        )
        rep6 = run_salvage(spec6)
        assert any(i.startswith("os_path_leak:") for i in rep6["targets"][0]["issues"])
        results.append({"id": "06_os_path_leak_rejected", "passed": True})

        # 07: Seal and verify zero drift
        cap_path = tmp / "cap.json"
        run_seal(ws1, cap_path, "ws1")
        rc7, v7 = run_verify(cap_path, ws1)
        assert rc7 == 0 and v7["drift_count"] == 0
        results.append({"id": "07_seal_and_verify_zero_drift", "passed": True})

        # 08: Mutated file drift detected
        (ws1 / "shader.js").write_text("const v = 2;\n", encoding="utf-8", newline="\n")
        rc8, v8 = run_verify(cap_path, ws1)
        assert rc8 == 2 and "shader.js" in v8["drifted"]
        results.append({"id": "08_mutated_file_drift_detected", "passed": True})

        # 09: Merkle tamper rejected even when file bytes match
        (ws1 / "shader.js").write_text("const v = 1;\n", encoding="utf-8", newline="\n")
        tampered = json.loads(cap_path.read_text(encoding="utf-8"))
        tampered["merkle_root"] = "0" * 64
        cap_path.write_text(json.dumps(tampered), encoding="utf-8", newline="\n")
        rc9, v9 = run_verify(cap_path, ws1)
        assert rc9 == 2 and v9["merkle_match"] is False
        results.append({"id": "09_merkle_tamper_rejected", "passed": True})

        # 10: Topological wave order
        ros10 = tmp / "ros10.json"
        ros10.write_text(
            json.dumps(
                {
                    "workers": [
                        {"name": "builder", "role": "author", "model": "gemini-4-carbon-high", "owned_paths": ["shader.js"]},
                        {"name": "checker", "role": "verifier", "model": "gemini-4-hydrogen-xhigh", "depends_on": ["builder"]},
                    ]
                }
            ),
            encoding="utf-8",
            newline="\n",
        )
        rc10, out10 = run_partition(rep2_path, ros10)
        assert rc10 == 0 and out10["waves"] == [["builder"], ["checker"]]
        results.append({"id": "10_topological_wave_order", "passed": True})

        return 0, {"status": "ALL_SELFTESTS_PASSED", "passed_count": len(results), "cases": results}
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Swarm Salvage & Re-Coalescence Stage-0 Engine")
    parser.add_argument("--selftest", action="store_true", help="Run 10 Popperian self-test cases")
    sub = parser.add_subparsers(dest="cmd")

    p_sal = sub.add_parser("salvage")
    p_sal.add_argument("--spec", required=True)
    p_sal.add_argument("--out", required=True)

    p_part = sub.add_parser("partition")
    p_part.add_argument("--report", required=True)
    p_part.add_argument("--roster", required=True)
    p_part.add_argument("--out", required=True)

    p_seal = sub.add_parser("seal")
    p_seal.add_argument("--root", required=True)
    p_seal.add_argument("--out", required=True)
    p_seal.add_argument("--name", default=None)

    p_ver = sub.add_parser("verify")
    p_ver.add_argument("--capsule", required=True)
    p_ver.add_argument("--root", default=None)

    args = parser.parse_args(argv)
    if args.selftest:
        rc, payload = run_selftest()
        print(json.dumps(payload, indent=2))
        return rc
    if args.cmd == "salvage":
        rep = run_salvage(Path(args.spec), Path(args.out))
        print(json.dumps({"merkle_root": rep["merkle_root"], "summary_counts": rep["summary_counts"]}, indent=2))
        return 0
    if args.cmd == "partition":
        rc, plan = run_partition(Path(args.report), Path(args.roster), Path(args.out))
        print(json.dumps(plan, indent=2))
        return rc
    if args.cmd == "seal":
        cap = run_seal(Path(args.root), Path(args.out), args.name)
        print(json.dumps({"schema": cap["schema"], "file_count": cap["file_count"], "merkle_root": cap["merkle_root"]}, indent=2))
        return 0
    if args.cmd == "verify":
        rc, res = run_verify(Path(args.capsule), Path(args.root) if args.root else None)
        print(json.dumps(res, indent=2))
        return rc

    parser.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
