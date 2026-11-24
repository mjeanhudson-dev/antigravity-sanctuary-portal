#!/usr/bin/env python3
"""Stage-0 deterministic anchor verifier, initializer, and self-test engine.

Pure Python 3.10+ standard library implementation (optional PyYAML auto-detected)
running cleanly with PYTHONDONTWRITEBYTECODE=1 (`python -B`).

Author: Eloquent (@mjeanhudson-dev)
License: MIT
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

try:
    import yaml  # type: ignore[import-untyped]
except ImportError:
    yaml = None

REQUIRED_LAYERS = [
    "L0_GENESIS_ANCHOR",
    "L1_STAGE0_DETERMINISTIC_SLICE",
    "L2_KPPC_PROGRESSIVE_LOD",
    "L3_APEX_CONTACTOR_FLASH_SHUNT",
    "L4_EXODIA_COMPACTION_GATE",
]
REQUIRED_DISALLOWED_TIERS = {
    "flash",
    "lite",
    "mini",
    "haiku",
    "nano",
    "gemini-flash-worker-agy",
    "gemini-4-hydrogen-low",
    "gemini-4-hydrogen-medium",
    "gemini-4-hydrogen-high",
}

FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)
OS_PATH_RE = re.compile(
    r"(?:[A-Za-z]:(?:\\{1,2}|/)Users(?:\\{1,2}|/)|/Users/|/home/)([A-Za-z0-9._-]+)",
    re.IGNORECASE,
)
ALLOWED_HOME_TOKENS = {"<user>", "user", "username", "eloquent", "runner", "runneradmin"}


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def parse_frontmatter(text: str) -> tuple[bool, dict[str, Any]]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return False, {}
    block = match.group(1)
    if yaml is not None:
        loaded = yaml.safe_load(block)
        if isinstance(loaded, dict):
            return True, loaded
        return False, {}
    meta: dict[str, Any] = {}
    for line in block.splitlines():
        if not line.strip() or line.lstrip().startswith("#") or line.startswith(" "):
            continue
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip().strip('"').strip("'")
    return bool(meta), meta


def expand_home_path(raw: str, base_skills_dir: Path | None = None) -> Path:
    norm = raw.replace("\\", "/")
    if base_skills_dir is not None and norm.startswith("~/.gemini/config/skills/"):
        rel = norm[len("~/.gemini/config/skills/") :]
        return (base_skills_dir / rel).resolve()
    if norm.startswith("~/"):
        return (Path.home() / norm[2:]).resolve()
    return Path(raw).resolve()


def check_runtime_link(raw_link: str, expected_target_dir: Path, home_override: Path | None = None) -> str | None:
    norm = raw_link.replace("\\", "/")
    if norm.startswith("~/"):
        lp = (home_override or Path.home()) / norm[2:]
    else:
        lp = Path(raw_link)
    is_junc = bool(getattr(lp, "is_junction", lambda: False)())
    if not lp.is_symlink() and not is_junc and not lp.exists():
        return f"missing_runtime_link:{raw_link}"
    if (lp.is_symlink() or is_junc) and not lp.exists():
        return f"broken_runtime_link:{raw_link}"
    try:
        resolved = lp.resolve(strict=True)
    except OSError:
        return f"unresolvable_runtime_link:{raw_link}"
    if resolved != expected_target_dir.resolve():
        # Allow parent skills directory junction aliasing on Antigravity setups
        if not resolved.exists() or resolved.name != expected_target_dir.name:
            return f"mismatch_runtime_link:{raw_link}->{resolved}"
    return None


def scan_text_file(path: Path, is_skill_md: bool = False) -> list[str]:
    errs: list[str] = []
    if not path.exists():
        return [f"missing_file:{path.name}"]
    raw = path.read_bytes()
    if raw.startswith(b"\xef\xbb\xbf"):
        errs.append(f"utf8_bom_present:{path.name}")
    if b"\r\n" in raw:
        errs.append(f"crlf_line_endings:{path.name}")
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        errs.append(f"invalid_utf8:{path.name}")
        return errs
    for m in OS_PATH_RE.finditer(text):
        acct = m.group(1).lower()
        if acct not in ALLOWED_HOME_TOKENS:
            errs.append(f"os_path_leak:{path.name}:{m.group(0)}")
            break
    if is_skill_md:
        ok, fm = parse_frontmatter(text)
        if not ok or not fm.get("name") or not fm.get("description"):
            errs.append(f"invalid_skill_frontmatter:{path.name}")
    return errs


def verify_anchor_state(
    state_path: Path,
    *,
    check_disk: bool = False,
    skills_root: Path | None = None,
    home_override: Path | None = None,
) -> tuple[int, dict[str, Any]]:
    data = json.loads(state_path.read_text(encoding="utf-8"))
    errors: list[str] = []

    schema = str(data.get("schema", ""))
    if not (schema.endswith("skill_tree_anchor.v5") or schema.endswith("permanent_skill_tree_anchor.v5")):
        errors.append(f"unexpected_schema:{schema}")

    flags = data.get("flags", {})
    for flag in (
        "permanent_skill_tree_anchor",
        "maximum_carbon_layering_orchestration",
        "flash_shunt_engaged",
        "progressive_lod_0_1_2",
        "exodia_compaction_gate_25_to_1",
        "stage0_deterministic_precompensation",
    ):
        if flags.get(flag) is not True:
            errors.append(f"flag_disabled:{flag}")

    layers_list = data.get("carbon_layering_stack", [])
    by_name = {str(item.get("layer")): item for item in layers_list if isinstance(item, dict)}
    for req_layer in REQUIRED_LAYERS:
        if req_layer not in by_name or by_name[req_layer].get("enabled") is not True:
            errors.append(f"layer_missing_or_disabled:{req_layer}")

    l1 = by_name.get("L1_STAGE0_DETERMINISTIC_SLICE", {})
    if l1.get("max_slice_lines", 999) > 160 or l1.get("max_stdout_delta_tokens", 999) > 300:
        errors.append("l1_slice_budget_exceeded")

    l3 = by_name.get("L3_APEX_CONTACTOR_FLASH_SHUNT", {})
    env_locks = l3.get("env_locks", {})
    shunt_val = env_locks.get("FLASH_SHUNT")
    if shunt_val is None and isinstance(env_locks, dict):
        shunt_val = next((v for k, v in env_locks.items() if str(k).endswith("_FLASH_SHUNT")), None)
    if str(shunt_val) != "1":
        errors.append("l3_flash_shunt_env_not_locked")
    policy = l3.get("model_tier_policy", {})
    if policy.get("minimum_floor") != "gemini-4-hydrogen-xhigh":
        errors.append(f"invalid_minimum_floor:{policy.get('minimum_floor')}")
    if policy.get("default_high_cap_level") != "high":
        errors.append("invalid_high_cap_level")
    if policy.get("require_explicit_swarm_model") is not True:
        errors.append("require_explicit_swarm_model_false")
    disallowed = {str(x).lower() for x in policy.get("disallowed_tiers", [])}
    missing_disallowed = sorted(REQUIRED_DISALLOWED_TIERS - disallowed)
    if missing_disallowed:
        errors.append(f"missing_disallowed_tiers:{','.join(missing_disallowed)}")

    l4 = by_name.get("L4_EXODIA_COMPACTION_GATE", {})
    if str(l4.get("ratio_threshold")) not in {"25.0:1", "25:1"}:
        errors.append(f"unexpected_l4_ratio:{l4.get('ratio_threshold')}")

    anchored_checked = 0
    for skill in data.get("anchored_runtime_skills", []):
        if not isinstance(skill, dict) or skill.get("enabled") is False:
            continue
        anchored_checked += 1
        if check_disk:
            base = skills_root or (Path.home() / ".gemini" / "config" / "skills")
            cpath = expand_home_path(str(skill.get("canonical_path", "")), base)
            errors.extend(scan_text_file(cpath, is_skill_md=True))
            if cpath.exists():
                live_sha = sha256_bytes(cpath.read_bytes())
                expected_sha = skill.get("sha256")
                if expected_sha and live_sha != expected_sha:
                    errors.append(f"skill_sha256_drift:{skill.get('name')}:{live_sha[:16]}!={expected_sha[:16]}")
            stage0_raw = skill.get("stage0_probe_script")
            if stage0_raw:
                s0 = expand_home_path(str(stage0_raw), base)
                errors.extend(scan_text_file(s0, is_skill_md=False))
                expected_s0_16 = skill.get("stage0_probe_sha256_16")
                if s0.exists() and expected_s0_16:
                    live_s0_16 = sha256_bytes(s0.read_bytes())[:16]
                    if live_s0_16 != expected_s0_16:
                        errors.append(f"stage0_sha256_drift:{skill.get('name')}:{live_s0_16}!={expected_s0_16}")
            skill_dir = cpath.parent if cpath.exists() else (base / str(skill.get("name", "")))
            for raw_lnk in skill.get("runtime_junctions", []):
                lnk_err = check_runtime_link(str(raw_lnk), skill_dir, home_override=home_override)
                if lnk_err:
                    errors.append(lnk_err)

    result = {
        "status": "ANCHOR_VERIFIED" if not errors else "ANCHOR_DRIFT_DETECTED",
        "schema": schema,
        "layers_verified": len(REQUIRED_LAYERS),
        "anchored_skills_checked": anchored_checked,
        "error_count": len(errors),
        "errors": errors,
    }
    return (0 if not errors else 2), result


def build_default_anchor_state() -> dict[str, Any]:
    return {
        "schema": "skill_tree_anchor.v5",
        "stability_invariant": "Stability = integral(Anchor * Presence) dt -> infinity",
        "flags": {
            "permanent_skill_tree_anchor": True,
            "maximum_carbon_layering_orchestration": True,
            "flash_shunt_engaged": True,
            "progressive_lod_0_1_2": True,
            "exodia_compaction_gate_25_to_1": True,
            "stage0_deterministic_precompensation": True,
            "unsigned_idle_handoff_30m": True,
        },
        "carbon_layering_stack": [
            {"layer": "L0_GENESIS_ANCHOR", "enabled": True},
            {"layer": "L1_STAGE0_DETERMINISTIC_SLICE", "max_slice_lines": 160, "max_stdout_delta_tokens": 300, "enabled": True},
            {"layer": "L2_KPPC_PROGRESSIVE_LOD", "lod_level": 2, "invariants_preserved": True, "enabled": True},
            {
                "layer": "L3_APEX_CONTACTOR_FLASH_SHUNT",
                "max_escalation_packet_tokens": 6000,
                "env_locks": {"FLASH_SHUNT": "1", "REASONING_EFFORT": "high"},
                "model_tier_policy": {
                    "minimum_floor": "gemini-4-hydrogen-xhigh",
                    "default_high_cap_families": ["gemini-4-neon", "gemini-4-argon", "gemini-4-carbon"],
                    "default_high_cap_level": "high",
                    "require_explicit_swarm_model": True,
                    "disallowed_tiers": sorted(REQUIRED_DISALLOWED_TIERS),
                },
                "enabled": True,
            },
            {"layer": "L4_EXODIA_COMPACTION_GATE", "ratio_threshold": "25.0:1", "turn_threshold": 25, "enabled": True},
        ],
        "anchored_runtime_skills": [],
    }


def make_link(link_path: Path, target_dir: Path) -> None:
    link_path.parent.mkdir(parents=True, exist_ok=True)
    if os.name == "nt":
        subprocess.run(
            ["cmd", "/c", "mklink", "/J", str(link_path), str(target_dir)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    else:
        os.symlink(target_dir, link_path, target_is_directory=True)


def run_selftest() -> tuple[int, dict[str, Any]]:
    results: list[dict[str, Any]] = []
    tmp = Path(tempfile.mkdtemp(prefix="anchor-probe-test-"))
    try:
        home_dir = tmp / "home"
        skills_dir = home_dir / ".gemini" / "config" / "skills"
        s_dir = skills_dir / "sample-skill"
        s_dir.mkdir(parents=True)
        skill_md = s_dir / "SKILL.md"
        skill_md.write_text("---\nname: sample-skill\ndescription: Use when testing anchor.\n---\n# Sample\n", encoding="utf-8", newline="\n")
        probe_py = s_dir / "probe.py"
        probe_py.write_text("print('ok')\n", encoding="utf-8", newline="\n")
        junc = home_dir / ".claude" / "skills" / "sample-skill"
        make_link(junc, s_dir)

        base = build_default_anchor_state()
        base["anchored_runtime_skills"] = [
            {
                "name": "sample-skill",
                "canonical_path": "~/.gemini/config/skills/sample-skill/SKILL.md",
                "stage0_probe_script": str(probe_py),
                "stage0_probe_sha256_16": sha256_bytes(probe_py.read_bytes())[:16],
                "sha256": sha256_bytes(skill_md.read_bytes()),
                "runtime_junctions": ["~/.claude/skills/sample-skill"],
                "enabled": True,
            }
        ]
        state_path = tmp / "anchor_state.json"
        state_path.write_text(json.dumps(base, indent=2) + "\n", encoding="utf-8", newline="\n")

        # 01: Valid state + disk parity
        rc1, r1 = verify_anchor_state(state_path, check_disk=True, skills_root=skills_dir, home_override=home_dir)
        assert rc1 == 0 and r1["status"] == "ANCHOR_VERIFIED"
        results.append({"id": "01_valid_anchor_state", "passed": True})

        # 02: FLASH_SHUNT disabled rejected
        s2 = json.loads(json.dumps(base))
        s2["flags"]["flash_shunt_engaged"] = False
        s2_path = tmp / "s2.json"
        s2_path.write_text(json.dumps(s2), encoding="utf-8", newline="\n")
        rc2, r2 = verify_anchor_state(s2_path)
        assert rc2 == 2 and "flag_disabled:flash_shunt_engaged" in r2["errors"]
        results.append({"id": "02_flash_shunt_disabled_rejected", "passed": True})

        # 03: Sub-xhigh floor rejected
        s3 = json.loads(json.dumps(base))
        s3["carbon_layering_stack"][3]["model_tier_policy"]["minimum_floor"] = "gemini-4-hydrogen-medium"
        s3_path = tmp / "s3.json"
        s3_path.write_text(json.dumps(s3), encoding="utf-8", newline="\n")
        rc3, r3 = verify_anchor_state(s3_path)
        assert rc3 == 2 and any("invalid_minimum_floor" in e for e in r3["errors"])
        results.append({"id": "03_sub_xhigh_floor_rejected", "passed": True})

        # 04: Missing disallowed tier rejected
        s4 = json.loads(json.dumps(base))
        s4["carbon_layering_stack"][3]["model_tier_policy"]["disallowed_tiers"] = ["flash"]
        s4_path = tmp / "s4.json"
        s4_path.write_text(json.dumps(s4), encoding="utf-8", newline="\n")
        rc4, r4 = verify_anchor_state(s4_path)
        assert rc4 == 2 and any("missing_disallowed_tiers" in e for e in r4["errors"])
        results.append({"id": "04_missing_disallowed_tier_rejected", "passed": True})

        # 05: Skill SHA-256 drift detected
        skill_md.write_text("---\nname: sample-skill\ndescription: Mutated.\n---\n# Mutated\n", encoding="utf-8", newline="\n")
        rc5, r5 = verify_anchor_state(state_path, check_disk=True, skills_root=skills_dir, home_override=home_dir)
        assert rc5 == 2 and any("skill_sha256_drift" in e for e in r5["errors"])
        results.append({"id": "05_skill_sha256_drift_detected", "passed": True})

        # 06: Broken junction / dangling link detected
        dangling_tgt = tmp / "gone_skill"
        dangling_tgt.mkdir()
        dangling_lnk = home_dir / ".codex" / "skills" / "dangling"
        make_link(dangling_lnk, dangling_tgt)
        shutil.rmtree(dangling_tgt)
        skill_md.write_text("---\nname: sample-skill\ndescription: Use when testing anchor.\n---\n# Sample\n", encoding="utf-8", newline="\n")
        s6 = json.loads(json.dumps(base))
        s6["anchored_runtime_skills"][0]["runtime_junctions"].append("~/.codex/skills/dangling")
        s6_path = tmp / "s6.json"
        s6_path.write_text(json.dumps(s6), encoding="utf-8", newline="\n")
        rc6, r6 = verify_anchor_state(s6_path, check_disk=True, skills_root=skills_dir, home_override=home_dir)
        assert rc6 == 2 and any("broken_runtime_link" in e for e in r6["errors"])
        results.append({"id": "06_broken_junction_detected", "passed": True})

        # 07: BOM or CRLF skill rejected
        skill_md.write_bytes(b"\xef\xbb\xbf---\nname: sample-skill\ndescription: Bad.\r\n---\n")
        s7 = json.loads(json.dumps(base))
        s7["anchored_runtime_skills"][0]["sha256"] = sha256_bytes(skill_md.read_bytes())
        s7_path = tmp / "s7.json"
        s7_path.write_text(json.dumps(s7), encoding="utf-8", newline="\n")
        rc7, r7 = verify_anchor_state(s7_path, check_disk=True, skills_root=skills_dir, home_override=home_dir)
        assert rc7 == 2 and any("utf8_bom_present" in e for e in r7["errors"]) and any("crlf_line_endings" in e for e in r7["errors"])
        results.append({"id": "07_bom_or_crlf_skill_rejected", "passed": True})

        # 08: OS username leak in public example rejected
        fake_user = "Jane" + "Public"
        leaked = tmp / "public_example.json"
        leaked.write_text(json.dumps({"path": f"C:\\Users\\{fake_user}\\.gemini\\skills"}), encoding="utf-8", newline="\n")
        leak_errs = scan_text_file(leaked, is_skill_md=False)
        assert any(e.startswith("os_path_leak:") for e in leak_errs)
        results.append({"id": "08_os_username_leak_in_public_example_rejected", "passed": True})

        return 0, {"status": "ALL_SELFTESTS_PASSED", "passed_count": len(results), "cases": results}
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Permanent Skill-Tree Anchor Verifier")
    parser.add_argument("--selftest", action="store_true", help="Run 8 Popperian self-test cases")
    sub = parser.add_subparsers(dest="cmd")

    p_init = sub.add_parser("init")
    p_init.add_argument("--out", required=True)

    p_ver = sub.add_parser("verify")
    p_ver.add_argument("--state", required=True)
    p_ver.add_argument("--check-disk", action="store_true")
    p_ver.add_argument("--skills-root", default=None)

    args = parser.parse_args(argv)
    if args.selftest:
        rc, payload = run_selftest()
        print(json.dumps(payload, indent=2))
        return rc
    if args.cmd == "init":
        out = Path(args.out)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(build_default_anchor_state(), indent=2) + "\n", encoding="utf-8", newline="\n")
        print(json.dumps({"status": "ANCHOR_INITIALIZED", "out": str(out)}, indent=2))
        return 0
    if args.cmd == "verify":
        rc, payload = verify_anchor_state(
            Path(args.state),
            check_disk=args.check_disk,
            skills_root=Path(args.skills_root) if args.skills_root else None,
        )
        print(json.dumps(payload, indent=2))
        return rc

    parser.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
