#!/usr/bin/env python3
"""Stage-0 Blind Parity Engine for `audit-the-audit`.

Provides deterministic, read-only, timeout-bounded 6-surface parity probing,
cryptographic Commit-Reveal pre-registration with zero-anchor prompt leakage
gating, Merkle receipt verification, and a Popperian adversarial `--selftest`.
"""

from __future__ import annotations

import sys

sys.dont_write_bytecode = True

import argparse
import ast
from datetime import datetime, timezone
import getpass
import hashlib
import importlib.machinery
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional, Sequence, Tuple

try:
    import yaml  # type: ignore
except ImportError:  # pragma: no cover - optional dependency fallback
    yaml = None

SURFACES: Tuple[str, ...] = (
    "disk_wire",
    "links_collisions",
    "ram_daemons",
    "scm_residue",
    "env_acls",
    "docs_telemetry",
)

SECRET_ENV_RE = re.compile(r"(?i)(key|token|secret|pass|auth|cred|cookie|bearer)")
ANCHOR_PHRASE_RE = re.compile(
    r"(?i)\b(already\s+verified|confirm\s+(?:rollback|cleanup|migration)\s+succeeded|"
    r"expected\s+(?:sha|hash|commit|bytes|lines)|should\s+equal|1:1\s+clean)\b"
)
HEX_ANCHOR_RE = re.compile(r"(?<![0-9a-fA-F-])(?=[0-9a-fA-F]*[a-fA-F])(?=[0-9a-fA-F]*\d)[0-9a-fA-F]{12,64}(?![0-9a-fA-F-])")


def canonical_json(obj: Any) -> str:
    """Serialize data deterministically for cryptographic hashing."""
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def sha256_bytes(data: bytes) -> str:
    """Return full lowercase SHA-256 hex digest."""
    return hashlib.sha256(data).hexdigest()


def sha256_json(obj: Any) -> str:
    """Return full lowercase SHA-256 hex digest of canonical JSON."""
    return sha256_bytes(canonical_json(obj).encode("utf-8"))


def compute_merkle_root(leaves: Sequence[str]) -> str:
    """Compute a binary SHA-256 Merkle root over ordered hex leaf digests."""
    if not leaves:
        return sha256_bytes(b"")
    layer = list(leaves)
    while len(layer) > 1:
        nxt: List[str] = []
        for idx in range(0, len(layer), 2):
            left = layer[idx]
            right = layer[idx + 1] if idx + 1 < len(layer) else left
            nxt.append(sha256_bytes(f"{left}:{right}".encode("utf-8")))
        layer = nxt
    return layer[0]


def run_bounded_cmd(
    cmd: Sequence[str],
    *,
    timeout_s: float = 6.0,
    extra_env: Optional[Dict[str, str]] = None,
    cwd: Optional[str] = None,
) -> Dict[str, Any]:
    """Execute a subprocess with hard wall-clock bounds and non-interactive env."""
    env = os.environ.copy()
    env.update(
        {
            "PYTHONDONTWRITEBYTECODE": "1",
            "GIT_TERMINAL_PROMPT": "0",
            "GCM_INTERACTIVE": "never",
            "CLOUDSDK_CORE_DISABLE_PROMPTS": "1",
        }
    )
    if extra_env:
        env.update(extra_env)
    t0 = time.perf_counter()
    try:
        proc = subprocess.run(
            list(cmd),
            cwd=cwd,
            env=env,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout_s,
            stdin=subprocess.DEVNULL,
            check=False,
        )
        return {
            "timed_out": False,
            "returncode": proc.returncode,
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "elapsed_ms": round((time.perf_counter() - t0) * 1000.0, 2),
        }
    except subprocess.TimeoutExpired as exc:
        return {
            "timed_out": True,
            "returncode": -1,
            "stdout": (exc.stdout or "") if isinstance(exc.stdout, str) else "",
            "stderr": f"TIMEOUT_AFTER_{timeout_s}S",
            "elapsed_ms": round((time.perf_counter() - t0) * 1000.0, 2),
        }
    except FileNotFoundError as exc:
        return {
            "timed_out": False,
            "returncode": -2,
            "stdout": "",
            "stderr": f"EXECUTABLE_NOT_FOUND:{exc}",
            "elapsed_ms": round((time.perf_counter() - t0) * 1000.0, 2),
        }


def parse_frontmatter(text: str) -> Tuple[Optional[Dict[str, str]], Optional[str], Optional[str], str]:
    """Extract and validate YAML frontmatter block and body without mutating disk."""
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.DOTALL)
    if not m:
        return None, None, "MISSING_OR_CRLF_FRONTMATTER_DELIMITERS", text
    fm_inner, body = m.group(1), m.group(2)
    fm_with_delims = f"---\n{fm_inner}\n---"
    if len(fm_with_delims) > 1024:
        return None, fm_inner, f"FRONTMATTER_TOO_LONG:{len(fm_with_delims)}>1024", body
    if "\t" in fm_inner:
        return None, fm_inner, "YAML_CONTAINS_TAB", body

    parsed: Dict[str, str] = {}
    if yaml is not None:
        try:
            loaded = yaml.safe_load(fm_inner)
        except Exception as exc:
            return None, fm_inner, f"YAML_PARSE_ERROR:{exc}", body
        if not isinstance(loaded, dict):
            return None, fm_inner, "YAML_ROOT_NOT_MAPPING", body
        for k, v in loaded.items():
            parsed[str(k)] = "" if v is None else str(v)
    else:
        for line in fm_inner.splitlines():
            if not line.strip() or line.lstrip().startswith("#"):
                continue
            if ":" not in line:
                return None, fm_inner, f"YAML_NON_KV_LINE:{line[:40]}", body
            k, v = line.split(":", 1)
            key = k.strip()
            val = v.strip()
            if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                val = val[1:-1]
            parsed[key] = val
    return parsed, fm_inner, None, body


def scan_identity_leaks(text: str, extra_usernames: Sequence[str] = ()) -> List[Dict[str, Any]]:
    """Detect hardcoded OS usernames or Windows user-profile path prefixes in text."""
    usernames = {u for u in [getpass.getuser(), *extra_usernames] if u and len(u) >= 3}
    patterns = [re.compile(r"[A-Za-z]:[\\/]+Users[\\/]+", re.IGNORECASE)]
    for u in sorted(usernames):
        patterns.append(re.compile(rf"(?<![A-Za-z0-9_-]){re.escape(u)}(?![A-Za-z0-9_-])", re.IGNORECASE))
    hits: List[Dict[str, Any]] = []
    for idx, line in enumerate(text.splitlines(), 1):
        for pat in patterns:
            if pat.search(line):
                hits.append({"line": idx, "pattern": pat.pattern})
                break
    return hits


def inspect_skill_file(
    path: Path,
    *,
    required_name: Optional[str] = None,
    require_use_when: bool = True,
    max_desc_chars: int = 500,
    extra_usernames: Sequence[str] = (),
) -> Tuple[Dict[str, Any], List[Dict[str, str]]]:
    """Inspect a SKILL.md target for encoding, EOL, YAML contract, and leaks."""
    findings: List[Dict[str, str]] = []
    if not path.exists():
        findings.append({"severity": "High", "code": "FILE_MISSING", "detail": str(path)})
        return {"exists": False, "path": str(path)}, findings

    raw = path.read_bytes()
    has_bom = raw.startswith(b"\xef\xbb\xbf")
    crlf_count = raw.count(b"\r\n")
    cr_only_count = raw.count(b"\r") - crlf_count
    lf_count = raw.count(b"\n")
    ends_with_lf = raw.endswith(b"\n")
    full_sha = sha256_bytes(raw)

    try:
        text = raw.decode("utf-8")
        utf8_valid = True
    except UnicodeDecodeError as exc:
        utf8_valid = False
        text = raw.decode("utf-8", errors="replace")
        findings.append({"severity": "High", "code": "INVALID_UTF8", "detail": str(exc)})

    if has_bom:
        findings.append({"severity": "High", "code": "UTF8_BOM_PRESENT", "detail": str(path)})
    if crlf_count > 0 or cr_only_count > 0:
        findings.append(
            {
                "severity": "Medium",
                "code": "NON_LF_LINE_ENDINGS",
                "detail": f"crlf={crlf_count}, cr_only={cr_only_count}",
            }
        )

    parsed, fm_inner, fm_err, body = parse_frontmatter(text)
    if fm_err:
        findings.append({"severity": "High", "code": "FRONTMATTER_INVALID", "detail": fm_err})
        desc = ""
        name = ""
    else:
        assert parsed is not None
        name = parsed.get("name", "")
        desc = parsed.get("description", "")
        if required_name and name != required_name:
            findings.append(
                {"severity": "High", "code": "NAME_MISMATCH", "detail": f"got={name!r} expected={required_name!r}"}
            )
        if not desc:
            findings.append({"severity": "High", "code": "DESCRIPTION_MISSING", "detail": "empty description"})
        else:
            if require_use_when and not desc.startswith("Use when"):
                findings.append(
                    {"severity": "Medium", "code": "DESCRIPTION_PREFIX", "detail": "must start with 'Use when'"}
                )
            if len(desc) >= max_desc_chars:
                findings.append(
                    {
                        "severity": "Medium",
                        "code": "DESCRIPTION_TOO_LONG",
                        "detail": f"len={len(desc)} >= {max_desc_chars}",
                    }
                )
            if re.search(r"(?i)\bstep\s*[0-9]+|\bthen\s+runs\b|\bworkflow\s+summary\b", desc):
                findings.append(
                    {"severity": "Medium", "code": "WORKFLOW_SUMMARY_IN_DESCRIPTION", "detail": desc[:120]}
                )

    leaks = scan_identity_leaks(text, extra_usernames=extra_usernames)
    if leaks:
        findings.append(
            {
                "severity": "High",
                "code": "IDENTITY_OR_PATH_LEAK",
                "detail": f"lines={[h['line'] for h in leaks]}",
            }
        )

    st = path.stat()
    mtime_iso = datetime.fromtimestamp(st.st_mtime, tz=timezone.utc).astimezone().isoformat()
    evidence = {
        "exists": True,
        "path": str(path),
        "bytes": len(raw),
        "lines": len(text.splitlines()),
        "sha256": full_sha,
        "sha256_16": full_sha[:16],
        "utf8_valid": utf8_valid,
        "has_bom": has_bom,
        "crlf_count": crlf_count,
        "cr_only_count": cr_only_count,
        "lf_count": lf_count,
        "ends_with_lf": ends_with_lf,
        "mtime_iso": mtime_iso,
        "yaml_parser": "PyYAML" if yaml is not None else "stdlib_strict",
        "frontmatter_chars_with_delims": len(f"---\n{fm_inner}\n---") if fm_inner is not None else 0,
        "name": name,
        "description_len": len(desc),
        "description_starts_use_when": desc.startswith("Use when") if desc else False,
        "identity_leak_count": len(leaks),
        "body_bytes": len(body.encode("utf-8")),
    }
    return evidence, findings


def check_python_syntax_in_memory(py_path: Path) -> Tuple[Dict[str, Any], List[Dict[str, str]]]:
    """Validate Python syntax in memory using ast.parse and SourceFileLoader without .pyc writes."""
    findings: List[Dict[str, str]] = []
    if not py_path.exists():
        findings.append({"severity": "High", "code": "PY_FILE_MISSING", "detail": str(py_path)})
        return {"exists": False, "path": str(py_path)}, findings
    raw = py_path.read_bytes()
    sha = sha256_bytes(raw)
    try:
        source = raw.decode("utf-8")
        ast.parse(source, filename=str(py_path))
        loader = importlib.machinery.SourceFileLoader("_blind_syntax_check", str(py_path))
        loader.source_to_code(source, str(py_path))
        ok = True
        err = None
    except Exception as exc:
        ok = False
        err = str(exc)
        findings.append({"severity": "High", "code": "PY_SYNTAX_ERROR", "detail": err})
    return {
        "exists": True,
        "path": str(py_path),
        "bytes": len(raw),
        "sha256_16": sha[:16],
        "syntax_ok": ok,
        "error": err,
    }, findings


def resolve_windows_shortcut(lnk_path: Path) -> Tuple[Dict[str, Any], List[Dict[str, str]]]:
    """Resolve a Windows .lnk shortcut read-only via WScript.Shell."""
    findings: List[Dict[str, str]] = []
    if not lnk_path.exists():
        findings.append({"severity": "High", "code": "SHORTCUT_MISSING", "detail": str(lnk_path)})
        return {"exists": False, "path": str(lnk_path)}, findings

    raw = lnk_path.read_bytes()
    lnk_sha16 = sha256_bytes(raw)[:16]
    if os.name != "nt":
        return {"exists": True, "path": str(lnk_path), "bytes": len(raw), "sha256_16": lnk_sha16, "platform": os.name}, findings

    escaped = str(lnk_path).replace("'", "''")
    ps = (
        "$ErrorActionPreference='Stop';"
        f"$sc=(New-Object -ComObject WScript.Shell).CreateShortcut('{escaped}');"
        "$te=$(if($sc.TargetPath){Test-Path -LiteralPath $sc.TargetPath}else{$false});"
        "[pscustomobject]@{TargetPath=$sc.TargetPath;WorkingDirectory=$sc.WorkingDirectory;"
        "Arguments=$sc.Arguments;Description=$sc.Description;TargetExists=$te} | ConvertTo-Json -Compress"
    )
    res = run_bounded_cmd(["powershell", "-NoProfile", "-Command", ps], timeout_s=6.0)
    if res["timed_out"] or res["returncode"] != 0:
        findings.append({"severity": "High", "code": "SHORTCUT_PROBE_FAILED", "detail": res["stderr"].strip()})
        return {"exists": True, "path": str(lnk_path), "bytes": len(raw), "sha256_16": lnk_sha16, "error": res["stderr"]}, findings

    info = json.loads(res["stdout"].strip())
    target_path = Path(info["TargetPath"]) if info.get("TargetPath") else None
    target_sha16 = sha256_bytes(target_path.read_bytes())[:16] if (target_path and target_path.is_file()) else None
    if not info.get("TargetExists"):
        findings.append({"severity": "High", "code": "SHORTCUT_BROKEN_TARGET", "detail": str(info.get("TargetPath"))})
    info.update(
        {
            "exists": True,
            "path": str(lnk_path),
            "bytes": len(raw),
            "sha256_16": lnk_sha16,
            "target_sha256_16": target_sha16,
        }
    )
    return info, findings


def probe_links_and_collisions(
    canonical_dir: Path,
    canonical_file: Path,
    runtime_dirs: Sequence[Path],
    collision_roots: Sequence[Path],
    skill_name: str,
) -> Tuple[str, Dict[str, Any], List[Dict[str, str]]]:
    """Verify cross-runtime links against canonical target and scan for collisions."""
    findings: List[Dict[str, str]] = []
    if not canonical_file.exists():
        findings.append({"severity": "High", "code": "CANONICAL_MISSING", "detail": str(canonical_file)})
        return "MEASURED", {"links": [], "collisions": {}}, findings

    canon_real = os.path.realpath(canonical_dir)
    canon_md_sha16 = sha256_bytes(canonical_file.read_bytes())[:16]
    links_ev: List[Dict[str, Any]] = []

    for rdir in runtime_dirs:
        exists = rdir.exists()
        child_md = rdir / canonical_file.name
        if not exists or not child_md.exists():
            findings.append({"severity": "High", "code": "RUNTIME_LINK_OR_FILE_MISSING", "detail": str(rdir)})
            links_ev.append({"path": str(rdir), "exists": exists, "resolved_match": False})
            continue
        resolved = os.path.realpath(rdir)
        same_file = os.path.samefile(canonical_file, child_md)
        child_sha16 = sha256_bytes(child_md.read_bytes())[:16]
        is_reparse = bool(getattr(os.path, "isjunction", lambda _: False)(str(rdir)) or rdir.is_symlink())
        resolved_match = resolved == canon_real
        if not resolved_match or child_sha16 != canon_md_sha16:
            findings.append(
                {
                    "severity": "High",
                    "code": "RUNTIME_PARITY_MISMATCH",
                    "detail": f"{rdir}: resolved={resolved}, sha16={child_sha16}",
                }
            )
        links_ev.append(
            {
                "path": str(rdir),
                "exists": True,
                "is_direct_reparse": is_reparse,
                "resolved": resolved,
                "resolved_match": resolved_match,
                "samefile": same_file,
                "skill_md_sha256_16": child_sha16,
            }
        )

    collisions: Dict[str, Any] = {}
    name_pat = re.compile(rf"(?m)^name:\s*{re.escape(skill_name)}\s*$")
    for root in collision_roots:
        if not root.exists():
            collisions[str(root)] = {"exists": False, "matches": []}
            continue
        matches: List[str] = []
        scanned = 0
        for dirpath, dirnames, filenames in os.walk(root, followlinks=True):
            if len(Path(dirpath).relative_to(root).parts) > 8:
                dirnames[:] = []
                continue
            for fn in filenames:
                if fn.lower() == "skill.md":
                    scanned += 1
                    fp = Path(dirpath) / fn
                    try:
                        head = fp.read_text(encoding="utf-8", errors="ignore")[:1024]
                    except OSError:
                        continue
                    if name_pat.search(head):
                        matches.append(str(fp))
        collisions[str(root)] = {"exists": True, "scanned_skill_md": scanned, "matches": matches}
        if len(matches) > 1:
            findings.append(
                {"severity": "Medium", "code": "DUPLICATE_SKILL_COLLISION", "detail": f"{root}: {matches}"}
            )

    return "MEASURED", {"canonical_real": canon_real, "links": links_ev, "collisions": collisions}, findings


def parse_iso_timestamp(ts: str) -> Optional[float]:
    """Parse ISO-8601 timestamp string to epoch seconds."""
    if not ts:
        return None
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp()
    except ValueError:
        return None


def evaluate_ram_processes(
    processes: Sequence[Dict[str, Any]],
    artifact_mtime_iso: Optional[str],
    name_regex: str,
) -> Tuple[Dict[str, Any], List[Dict[str, str]]]:
    """Classify matching live processes against target artifact timestamp."""
    findings: List[Dict[str, str]] = []
    pat = re.compile(name_regex, re.IGNORECASE)
    art_epoch = parse_iso_timestamp(artifact_mtime_iso or "")
    matched: List[Dict[str, Any]] = []
    pre_artifact: List[Dict[str, Any]] = []

    for proc in processes:
        pname = str(proc.get("name", ""))
        cmd = str(proc.get("cmd", ""))
        if not (pat.search(pname) or pat.search(cmd)):
            continue
        start_iso = str(proc.get("start_iso", ""))
        start_epoch = parse_iso_timestamp(start_iso)
        stale = bool(art_epoch is not None and start_epoch is not None and start_epoch < art_epoch)
        item = {"pid": proc.get("pid"), "name": pname, "start_iso": start_iso, "pre_artifact": stale}
        matched.append(item)
        if stale:
            pre_artifact.append(item)

    if pre_artifact:
        pids = [str(p["pid"]) for p in pre_artifact[:10]]
        findings.append(
            {
                "severity": "Low",
                "code": "PRE_ARTIFACT_RAM_PROCESSES",
                "detail": f"count={len(pre_artifact)} pids={','.join(pids)}",
            }
        )
    return {"matched_count": len(matched), "pre_artifact_count": len(pre_artifact), "processes": matched[:40]}, findings


def collect_live_processes(name_regex: Optional[str] = None) -> Tuple[str, List[Dict[str, Any]], Optional[str]]:
    """Collect running processes with PID and ISO-8601 start timestamps."""
    if os.name == "nt":
        pat_escaped = (name_regex or ".").replace("'", "''")
        ps = (
            f"$pat='{pat_escaped}';"
            "Get-CimInstance Win32_Process | "
            "Where-Object { $_.Name -match $pat -or ($_.CommandLine -and $_.CommandLine -match $pat) } | "
            "ForEach-Object { "
            "$iso=$(if($_.CreationDate){([datetime]$_.CreationDate).ToString('o')}else{''});"
            "$cm=$(if($_.CommandLine){$_.CommandLine.Substring(0,[Math]::Min(160,$_.CommandLine.Length))}else{''});"
            "[pscustomobject]@{pid=$_.ProcessId;name=$_.Name;start_iso=$iso;cmd=$cm} } | "
            "ConvertTo-Json -Compress"
        )
        res = run_bounded_cmd(["powershell", "-NoProfile", "-Command", ps], timeout_s=12.0)
        if res["timed_out"]:
            return "TIMED_OUT", [], res["stderr"]
        if res["returncode"] != 0:
            return "BLOCKED", [], res["stderr"]
        raw = json.loads(res["stdout"] or "[]")
        if isinstance(raw, dict):
            raw = [raw]
        return "MEASURED", raw, None

    res = run_bounded_cmd(["ps", "-eo", "pid=,comm=,lstart="], timeout_s=5.0)
    if res["timed_out"]:
        return "TIMED_OUT", [], res["stderr"]
    if res["returncode"] != 0:
        return "BLOCKED", [], res["stderr"]
    procs: List[Dict[str, Any]] = []
    for line in res["stdout"].splitlines():
        parts = line.strip().split(None, 2)
        if len(parts) >= 2:
            procs.append({"pid": int(parts[0]), "name": parts[1], "start_iso": parts[2] if len(parts) > 2 else "", "cmd": ""})
    return "MEASURED", procs, None


def probe_scm_repos(repo_paths: Sequence[Path], timeout_s: float = 6.0) -> Tuple[str, Dict[str, Any], List[Dict[str, str]]]:
    """Run read-only git parity and .git residue probes with bounded timeouts."""
    findings: List[Dict[str, str]] = []
    repos_ev: List[Dict[str, Any]] = []
    overall_status = "N_A"

    for repo in repo_paths:
        if not repo.exists() or not (repo / ".git").exists():
            repos_ev.append({"path": str(repo), "is_git_repo": False})
            continue
        overall_status = "MEASURED"
        head_res = run_bounded_cmd(["git", "-C", str(repo), "rev-parse", "HEAD"], timeout_s=timeout_s)
        stat_res = run_bounded_cmd(
            ["git", "-C", str(repo), "status", "--short", "--untracked-files=all"], timeout_s=timeout_s
        )
        stash_res = run_bounded_cmd(["git", "-C", str(repo), "stash", "list"], timeout_s=timeout_s)
        rem_res = run_bounded_cmd(
            ["git", "-C", str(repo), "-c", "credential.interactive=never", "ls-remote", "--heads", "origin"],
            timeout_s=timeout_s,
        )
        locks = [str(p.name) for p in (repo / ".git").rglob("*.lock")]
        dirty = [ln for ln in stat_res["stdout"].splitlines() if ln.strip()]
        if dirty:
            findings.append({"severity": "Medium", "code": "GIT_DIRTY_WORKTREE", "detail": f"{repo}: {len(dirty)} entries"})
        if locks:
            findings.append({"severity": "Medium", "code": "GIT_LOCK_RESIDUE", "detail": f"{repo}: {locks}"})
        if rem_res["timed_out"]:
            overall_status = "TIMED_OUT"
            findings.append({"severity": "Medium", "code": "GIT_REMOTE_TIMEOUT", "detail": str(repo)})
        elif rem_res["returncode"] != 0:
            overall_status = "BLOCKED"
            findings.append(
                {"severity": "Medium", "code": "GIT_REMOTE_BLOCKED", "detail": rem_res["stderr"].strip()[:160]}
            )
        repos_ev.append(
            {
                "path": str(repo),
                "is_git_repo": True,
                "head": head_res["stdout"].strip(),
                "dirty_count": len(dirty),
                "stash_count": len([ln for ln in stash_res["stdout"].splitlines() if ln.strip()]),
                "lock_files": locks,
                "remote_returncode": rem_res["returncode"],
                "remote_timed_out": rem_res["timed_out"],
            }
        )

    return overall_status, {"repos": repos_ev}, findings


def probe_env_and_acls(
    env_names: Sequence[str],
    acl_paths: Sequence[Path],
) -> Tuple[str, Dict[str, Any], List[Dict[str, str]]]:
    """Inspect non-secret env vars across scopes and file ACLs without printing secrets."""
    findings: List[Dict[str, str]] = []
    env_ev: Dict[str, Any] = {}
    for name in env_names:
        val = os.environ.get(name)
        if val is None:
            env_ev[name] = None
        elif SECRET_ENV_RE.search(name):
            env_ev[name] = f"<REDACTED len={len(val)} sha256_16={sha256_bytes(val.encode('utf-8'))[:16]}>"
        else:
            env_ev[name] = val

    acl_ev: List[Dict[str, Any]] = []
    for p in acl_paths:
        if not p.exists():
            acl_ev.append({"path": str(p), "exists": False})
            continue
        if os.name == "nt":
            escaped = str(p).replace("'", "''")
            ps = (
                f"$a=Get-Acl -LiteralPath '{escaped}';"
                "[pscustomobject]@{Owner=$a.Owner;"
                "Rules=($a.Access|ForEach-Object{\"$($_.IdentityReference):$($_.AccessControlType):$($_.FileSystemRights)\"})} "
                "| ConvertTo-Json -Compress"
            )
            res = run_bounded_cmd(["powershell", "-NoProfile", "-Command", ps], timeout_s=5.0)
            if res["returncode"] == 0 and res["stdout"].strip():
                acl_ev.append({"path": str(p), "exists": True, "acl": json.loads(res["stdout"].strip())})
            else:
                acl_ev.append({"path": str(p), "exists": True, "error": res["stderr"].strip()})
        else:
            mode = oct(p.stat().st_mode & 0o777)
            acl_ev.append({"path": str(p), "exists": True, "mode": mode})

    return "MEASURED", {"env": env_ev, "acls": acl_ev}, findings


def probe_http_endpoints(urls: Sequence[str], timeout_s: float = 5.0) -> Tuple[List[Dict[str, Any]], List[Dict[str, str]]]:
    """Run non-mutating HTTP GET/HEAD wire checks with bounded timeouts."""
    ev: List[Dict[str, Any]] = []
    findings: List[Dict[str, str]] = []
    for url in urls:
        req = urllib.request.Request(url, method="GET")
        try:
            with urllib.request.urlopen(req, timeout=timeout_s) as resp:
                body = resp.read(512)
                ev.append({"url": url, "status": resp.status, "sample_sha256_16": sha256_bytes(body)[:16]})
        except (urllib.error.URLError, TimeoutError, ValueError) as exc:
            findings.append({"severity": "High", "code": "WIRE_PROBE_ERROR", "detail": f"{url}: {exc}"})
            ev.append({"url": url, "status": None, "error": str(exc)})
    return ev, findings


def probe_docs_and_manifests(doc_paths: Sequence[Path]) -> Tuple[str, Dict[str, Any], List[Dict[str, str]]]:
    """Inspect JSON/Markdown manifest companions for existence, JSON validity, and CRLF/leaks."""
    if not doc_paths:
        return "N_A", {"docs": []}, []
    findings: List[Dict[str, str]] = []
    docs_ev: List[Dict[str, Any]] = []
    for p in doc_paths:
        if not p.exists():
            findings.append({"severity": "Medium", "code": "COMPANION_DOC_MISSING", "detail": str(p)})
            docs_ev.append({"path": str(p), "exists": False})
            continue
        raw = p.read_bytes()
        sha16 = sha256_bytes(raw)[:16]
        entry: Dict[str, Any] = {
            "path": str(p),
            "exists": True,
            "bytes": len(raw),
            "sha256_16": sha16,
            "has_bom": raw.startswith(b"\xef\xbb\xbf"),
            "crlf_count": raw.count(b"\r\n"),
        }
        if p.suffix.lower() == ".json":
            try:
                json.loads(raw.decode("utf-8"))
                entry["json_valid"] = True
            except Exception as exc:
                entry["json_valid"] = False
                findings.append({"severity": "High", "code": "MANIFEST_JSON_INVALID", "detail": f"{p}: {exc}"})
        docs_ev.append(entry)
    return "MEASURED", {"docs": docs_ev}, findings


def finalize_surface(status: str, evidence: Dict[str, Any], findings: List[Dict[str, str]]) -> Dict[str, Any]:
    """Attach canonical leaf hash to a single surface record."""
    payload = {"status": status, "evidence": evidence, "findings": findings}
    return {**payload, "leaf_sha256": sha256_json(payload)}


def compute_overall_verdict(surfaces: Dict[str, Dict[str, Any]]) -> str:
    """Compute overall verdict strictly from measured findings and surface states."""
    has_high = False
    has_drift = False
    for rec in surfaces.values():
        if rec["status"] in ("BLOCKED", "TIMED_OUT"):
            has_drift = True
        for f in rec.get("findings", []):
            sev = f.get("severity", "Low")
            if sev == "High":
                has_high = True
            else:
                has_drift = True
    if has_high:
        return "FAIL"
    if has_drift:
        return "1:1 WITH RESIDUAL DRIFT"
    return "1:1 CLEAN"


def run_probe(spec: Dict[str, Any]) -> Dict[str, Any]:
    """Execute the complete 6-surface parity probe and compute Merkle receipt."""
    surfaces: Dict[str, Dict[str, Any]] = {}
    target_file = Path(spec["canonical_file"]) if spec.get("canonical_file") else None
    target_dir = Path(spec["canonical_dir"]) if spec.get("canonical_dir") else (target_file.parent if target_file else None)

    # 1. disk_wire
    dw_findings: List[Dict[str, str]] = []
    dw_ev: Dict[str, Any] = {}
    if target_file:
        sk_ev, sk_find = inspect_skill_file(
            target_file,
            required_name=spec.get("required_name"),
            require_use_when=bool(spec.get("require_use_when", True)),
            max_desc_chars=int(spec.get("max_desc_chars", 500)),
            extra_usernames=spec.get("extra_usernames", ()),
        )
        dw_ev["canonical_file"] = sk_ev
        dw_findings.extend(sk_find)
    if spec.get("python_files"):
        py_ev = []
        for pyf in spec["python_files"]:
            pev, pfind = check_python_syntax_in_memory(Path(pyf))
            py_ev.append(pev)
            dw_findings.extend(pfind)
        dw_ev["python_files"] = py_ev
    if spec.get("shortcuts"):
        sc_ev = []
        for lnk in spec["shortcuts"]:
            sev, sfind = resolve_windows_shortcut(Path(lnk))
            sc_ev.append(sev)
            dw_findings.extend(sfind)
        dw_ev["shortcuts"] = sc_ev
    if spec.get("http_urls"):
        http_ev, http_find = probe_http_endpoints(spec["http_urls"], timeout_s=float(spec.get("timeout_s", 5.0)))
        dw_ev["http_endpoints"] = http_ev
        dw_findings.extend(http_find)
    surfaces["disk_wire"] = finalize_surface("MEASURED" if dw_ev else "N_A", dw_ev, dw_findings)

    # 2. links_collisions
    if target_dir and target_file and (spec.get("runtime_dirs") or spec.get("collision_roots")):
        lc_status, lc_ev, lc_find = probe_links_and_collisions(
            target_dir,
            target_file,
            [Path(p) for p in spec.get("runtime_dirs", [])],
            [Path(p) for p in spec.get("collision_roots", [])],
            spec.get("required_name") or target_dir.name,
        )
        surfaces["links_collisions"] = finalize_surface(lc_status, lc_ev, lc_find)
    else:
        surfaces["links_collisions"] = finalize_surface("N_A", {}, [])

    # 3. ram_daemons
    ram_regex = spec.get("ram_process_regex")
    if ram_regex:
        if "injected_processes" in spec:
            ram_status, procs, ram_err = "MEASURED", spec["injected_processes"], None
        else:
            ram_status, procs, ram_err = collect_live_processes(ram_regex)
        if ram_status != "MEASURED":
            surfaces["ram_daemons"] = finalize_surface(
                ram_status, {"error": ram_err}, [{"severity": "Medium", "code": f"RAM_PROBE_{ram_status}", "detail": str(ram_err)}]
            )
        else:
            mtime_iso = dw_ev.get("canonical_file", {}).get("mtime_iso")
            ram_ev, ram_find = evaluate_ram_processes(procs, mtime_iso, ram_regex)
            surfaces["ram_daemons"] = finalize_surface("MEASURED", ram_ev, ram_find)
    else:
        surfaces["ram_daemons"] = finalize_surface("N_A", {}, [])

    # 4. scm_residue
    repo_paths = [Path(p) for p in spec.get("git_repos", [])]
    if repo_paths:
        scm_status, scm_ev, scm_find = probe_scm_repos(repo_paths, timeout_s=float(spec.get("timeout_s", 6.0)))
        surfaces["scm_residue"] = finalize_surface(scm_status, scm_ev, scm_find)
    else:
        surfaces["scm_residue"] = finalize_surface("N_A", {}, [])

    # 5. env_acls
    env_names = spec.get("env_vars", [])
    acl_paths = [Path(p) for p in spec.get("acl_paths", [])]
    if env_names or acl_paths:
        ea_status, ea_ev, ea_find = probe_env_and_acls(env_names, acl_paths)
        surfaces["env_acls"] = finalize_surface(ea_status, ea_ev, ea_find)
    else:
        surfaces["env_acls"] = finalize_surface("N_A", {}, [])

    # 6. docs_telemetry
    doc_paths = [Path(p) for p in spec.get("companion_docs", [])]
    dt_status, dt_ev, dt_find = probe_docs_and_manifests(doc_paths)
    surfaces["docs_telemetry"] = finalize_surface(dt_status, dt_ev, dt_find)

    merkle_root = compute_merkle_root([surfaces[s]["leaf_sha256"] for s in SURFACES])
    return {
        "schema": "audit_the_audit.blind_parity_receipt.v1",
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "verdict": compute_overall_verdict(surfaces),
        "merkle_root": merkle_root,
        "surfaces": surfaces,
    }


def check_prompt_zero_anchor(prompt_text: str, claims: Dict[str, Any]) -> List[str]:
    """Fail closed if a drafted blind-auditor prompt leaks expected anchors."""
    leaks: List[str] = []
    start_marker = "### Target End-State"
    end_marker = "### Required Deliverable"
    if start_marker in prompt_text:
        tail = prompt_text[prompt_text.find(start_marker):]
        section = tail[:tail.find(end_marker)] if end_marker in tail else tail
    else:
        section = prompt_text

    if ANCHOR_PHRASE_RE.search(section):
        leaks.append("ANCHOR_PHRASE_LEAK_IN_TARGET_SECTION")
    hex_hits = HEX_ANCHOR_RE.findall(section)
    if hex_hits:
        leaks.append(f"HEX_DIGEST_LEAK:{hex_hits[:3]}")

    for key, val in claims.items():
        if isinstance(val, str) and len(val) >= 6 and val in section:
            leaks.append(f"CLAIM_VALUE_LEAK:{key}")
        elif isinstance(val, int) and val >= 100 and re.search(rf"\b{val}\b", section):
            leaks.append(f"NUMERIC_CLAIM_LEAK:{key}={val}")
    return leaks


def create_commitment(claims: Dict[str, Any], prompt_text: str) -> Dict[str, Any]:
    """Gate zero-anchor compliance on prompt and seal expected claims with a random nonce."""
    leaks = check_prompt_zero_anchor(prompt_text, claims)
    if leaks:
        return {"barrier_passed": False, "leaks": leaks, "commitment": None}
    nonce = secrets.token_hex(16)
    commitment = sha256_bytes(f"{canonical_json(claims)}|{nonce}".encode("utf-8"))
    return {
        "schema": "audit_the_audit.blind_parity_commitment.v1",
        "barrier_passed": True,
        "leaks": [],
        "commitment": commitment,
        "nonce": nonce,
        "claims": claims,
    }


def extract_observed_claim_map(receipt: Dict[str, Any]) -> Dict[str, Any]:
    """Extract comparable deterministic metrics from a blind parity receipt."""
    dw = receipt.get("surfaces", {}).get("disk_wire", {}).get("evidence", {})
    cf = dw.get("canonical_file", {})
    lc = receipt.get("surfaces", {}).get("links_collisions", {}).get("evidence", {})
    links = lc.get("links", [])
    return {
        "canonical_sha256_16": cf.get("sha256_16"),
        "canonical_sha256": cf.get("sha256"),
        "canonical_bytes": cf.get("bytes"),
        "canonical_lines": cf.get("lines"),
        "runtime_links_matched": sum(1 for item in links if item.get("resolved_match")),
        "verdict": receipt.get("verdict"),
    }


def reconcile_commitment(reveal_bundle: Dict[str, Any], receipt: Dict[str, Any]) -> Dict[str, Any]:
    """Verify commitment integrity, Merkle receipt integrity, and compute Audit-vs-Reality Delta."""
    claims = reveal_bundle.get("claims", {})
    nonce = reveal_bundle.get("nonce", "")
    expected_commit = reveal_bundle.get("commitment", "")
    recomputed_commit = sha256_bytes(f"{canonical_json(claims)}|{nonce}".encode("utf-8"))
    commitment_valid = bool(expected_commit) and expected_commit == recomputed_commit

    surfaces = receipt.get("surfaces", {})
    recomputed_leaves = []
    leaf_tampered = False
    for name in SURFACES:
        rec = surfaces.get(name)
        if not isinstance(rec, dict):
            leaf_tampered = True
            continue
        calc = sha256_json({"status": rec.get("status"), "evidence": rec.get("evidence"), "findings": rec.get("findings")})
        if calc != rec.get("leaf_sha256"):
            leaf_tampered = True
        recomputed_leaves.append(calc)
    recomputed_merkle = compute_merkle_root(recomputed_leaves) if len(recomputed_leaves) == len(SURFACES) else ""
    receipt_valid = (not leaf_tampered) and recomputed_merkle == receipt.get("merkle_root")

    observed = extract_observed_claim_map(receipt)
    deltas: List[Dict[str, Any]] = []
    for k, exp_v in claims.items():
        obs_v = observed.get(k)
        if obs_v != exp_v:
            deltas.append({"claim": k, "expected": exp_v, "observed": obs_v})

    status = "RECONCILED_MATCH"
    if not commitment_valid or not receipt_valid:
        status = "INTEGRITY_TAMPER_DETECTED"
    elif deltas or receipt.get("verdict") != "1:1 CLEAN":
        status = "AUDIT_VS_REALITY_DELTA"

    return {
        "schema": "audit_the_audit.blind_parity_reconciliation.v1",
        "status": status,
        "commitment_valid": commitment_valid,
        "receipt_merkle_valid": receipt_valid,
        "blind_verdict": receipt.get("verdict"),
        "deltas": deltas,
    }


def run_selftest() -> Dict[str, Any]:
    """Run Popperian adversarial mutation self-tests proving calibration and fail-closed gates."""
    results: List[Dict[str, Any]] = []
    valid_skill = (
        "---\n"
        "name: test-skill\n"
        "description: Use when testing blind parity verification cleanly.\n"
        "---\n\n"
        "# Test Skill\n\nClean body with zero leaks.\n"
    )
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        canon_dir = root / "canon" / "test-skill"
        canon_dir.mkdir(parents=True)
        canon_md = canon_dir / "SKILL.md"
        canon_md.write_bytes(valid_skill.encode("utf-8"))

        # Positive control: clean skill + directory mirror + manifest + commit-reveal
        mirror_dir = root / "runtime" / "test-skill"
        mirror_dir.mkdir(parents=True)
        (mirror_dir / "SKILL.md").write_bytes(valid_skill.encode("utf-8"))
        spec_clean = {
            "canonical_file": str(canon_md),
            "canonical_dir": str(canon_dir),
            "required_name": "test-skill",
            "runtime_dirs": [],
            "collision_roots": [str(root / "canon")],
            "companion_docs": [str(canon_md)],
            "ram_process_regex": "nonexistent_proc_xyz",
            "injected_processes": [],
        }
        r_clean = run_probe(spec_clean)
        assert r_clean["verdict"] == "1:1 CLEAN", f"Positive control failed: {r_clean}"
        results.append({"case": "01_clean_positive_control", "passed": True, "verdict": r_clean["verdict"]})

        # Negative 2: UTF-8 BOM injection
        bom_md = root / "bom_SKILL.md"
        bom_md.write_bytes(b"\xef\xbb\xbf" + valid_skill.encode("utf-8"))
        r_bom = run_probe({**spec_clean, "canonical_file": str(bom_md)})
        assert r_bom["verdict"] == "FAIL"
        results.append({"case": "02_bom_rejection", "passed": True, "verdict": r_bom["verdict"]})

        # Negative 3: CRLF injection
        crlf_md = root / "crlf_SKILL.md"
        crlf_md.write_bytes(valid_skill.replace("\n", "\r\n").encode("utf-8"))
        r_crlf = run_probe({**spec_clean, "canonical_file": str(crlf_md)})
        assert r_crlf["verdict"] in ("FAIL", "1:1 WITH RESIDUAL DRIFT")
        results.append({"case": "03_crlf_detection", "passed": True, "verdict": r_crlf["verdict"]})

        # Negative 4: Identity / home-prefix path leak
        leak_md = root / "leak_SKILL.md"
        fake_win_path = "C:" + "\\Users\\FakeUser\\test"
        leak_md.write_bytes((valid_skill + f"\nPath: {fake_win_path}\n").encode("utf-8"))
        r_leak = run_probe({**spec_clean, "canonical_file": str(leak_md), "extra_usernames": ["FakeUser"]})
        assert r_leak["verdict"] == "FAIL"
        results.append({"case": "04_identity_path_leak", "passed": True, "verdict": r_leak["verdict"]})

        # Negative 5: YAML description missing 'Use when' & > 500 chars
        bad_yaml = (
            "---\n"
            "name: test-skill\n"
            f"description: Wrong prefix {'x' * 505}\n"
            "---\n\nBody\n"
        )
        bad_md = root / "bad_yaml_SKILL.md"
        bad_md.write_bytes(bad_yaml.encode("utf-8"))
        r_yaml = run_probe({**spec_clean, "canonical_file": str(bad_md)})
        assert r_yaml["verdict"] != "1:1 CLEAN"
        results.append({"case": "05_yaml_contract_violation", "passed": True, "verdict": r_yaml["verdict"]})

        # Negative 6: Runtime link hash mismatch / broken canonical resolution
        r_link = run_probe({**spec_clean, "runtime_dirs": [str(mirror_dir)]})
        assert r_link["verdict"] == "FAIL"  # mirror_dir is a copy, not resolved to canon_dir
        results.append({"case": "06_non_canonical_copy_detection", "passed": True, "verdict": r_link["verdict"]})

        # Negative 7: Pre-artifact RAM process stale timestamp detection
        r_ram = run_probe(
            {
                **spec_clean,
                "ram_process_regex": "codex",
                "injected_processes": [{"pid": 999, "name": "codex.exe", "start_iso": "2020-01-01T00:00:00+00:00", "cmd": ""}],
            }
        )
        assert r_ram["verdict"] == "1:1 WITH RESIDUAL DRIFT"
        results.append({"case": "07_stale_ram_process_detection", "passed": True, "verdict": r_ram["verdict"]})

        # Negative 8: Zero-anchor prompt leakage gate in commit (+ UUID/deliverable positive boundary)
        c_bad = create_commitment(
            {"canonical_sha256_16": r_clean["surfaces"]["disk_wire"]["evidence"]["canonical_file"]["sha256_16"]},
            "### Target End-State\nConfirm rollback succeeded with sha 0a1b2c3d4e5f6789",
        )
        assert c_bad["barrier_passed"] is False and len(c_bad["leaks"]) >= 2
        c_uuid_ok = create_commitment(
            {"verdict": "1:1 CLEAN"},
            "### Target End-State\nVerify path /tmp/9d00c094-c2da-4b65-b061-a354a2667485/spec.json\n### Required Deliverable\nVerdict: 1:1 CLEAN",
        )
        assert c_uuid_ok["barrier_passed"] is True
        results.append({"case": "08_zero_anchor_leakage_gate", "passed": True, "leaks": c_bad["leaks"]})

        # Negative 9: Commit-Reveal reconcile (clean match + tamper + delta)
        claims_ok = {
            "canonical_sha256_16": r_clean["surfaces"]["disk_wire"]["evidence"]["canonical_file"]["sha256_16"],
            "canonical_bytes": len(valid_skill.encode("utf-8")),
        }
        c_ok = create_commitment(claims_ok, "### Target End-State\nVerify canonical SKILL.md exists as clean UTF-8.")
        assert c_ok["barrier_passed"] is True
        rec_ok = reconcile_commitment(c_ok, r_clean)
        assert rec_ok["status"] == "RECONCILED_MATCH"

        tampered_receipt = json.loads(json.dumps(r_clean))
        tampered_receipt["surfaces"]["disk_wire"]["evidence"]["canonical_file"]["bytes"] = 99999
        rec_tamper = reconcile_commitment(c_ok, tampered_receipt)
        assert rec_tamper["status"] == "INTEGRITY_TAMPER_DETECTED"

        c_delta = create_commitment({"canonical_sha256_16": "0000000000000000"}, "### Target End-State\nVerify target.")
        rec_delta = reconcile_commitment(c_delta, r_clean)
        assert rec_delta["status"] == "AUDIT_VS_REALITY_DELTA"
        results.append({"case": "09_commit_reveal_and_tamper_gate", "passed": True})

        # Negative 10: Bounded subprocess timeout guard
        to_res = run_bounded_cmd([sys.executable, "-B", "-c", "import time; time.sleep(2)"], timeout_s=0.15)
        assert to_res["timed_out"] is True
        results.append({"case": "10_bounded_timeout_guard", "passed": True, "elapsed_ms": to_res["elapsed_ms"]})

        # Positive + Negative 11: Windows .lnk shortcut probe (valid + broken)
        if os.name == "nt":
            lnk_ok = root / "valid_test.lnk"
            lnk_bad = root / "broken_test.lnk"
            missing_target = root / "does_not_exist.md"
            ps_mk = (
                "$w=New-Object -ComObject WScript.Shell;"
                f"$s1=$w.CreateShortcut('{str(lnk_ok).replace(chr(39), chr(39)*2)}');"
                f"$s1.TargetPath='{str(canon_md).replace(chr(39), chr(39)*2)}';$s1.Save();"
                f"$s2=$w.CreateShortcut('{str(lnk_bad).replace(chr(39), chr(39)*2)}');"
                f"$s2.TargetPath='{str(missing_target).replace(chr(39), chr(39)*2)}';$s2.Save();"
            )
            mk_res = run_bounded_cmd(["powershell", "-NoProfile", "-Command", ps_mk], timeout_s=6.0)
            assert mk_res["returncode"] == 0, f"Failed creating test shortcuts: {mk_res}"
            ev_ok, f_ok = resolve_windows_shortcut(lnk_ok)
            assert not f_ok and ev_ok["TargetExists"] is True
            assert ev_ok["target_sha256_16"] == r_clean["surfaces"]["disk_wire"]["evidence"]["canonical_file"]["sha256_16"]
            ev_bad, f_bad = resolve_windows_shortcut(lnk_bad)
            assert f_bad and f_bad[0]["code"] == "SHORTCUT_BROKEN_TARGET"
            results.append({"case": "11_windows_shortcut_probe_live", "passed": True})

        # Positive 12: Live filtered process collection (must stay fast and return >= 1 python process)
        p_stat, p_list, p_err = collect_live_processes("python")
        assert p_stat == "MEASURED" and len(p_list) >= 1, f"Live process probe failed: {p_stat} {p_err}"
        results.append({"case": "12_live_process_probe_fast", "passed": True, "matched": len(p_list)})

    return {"status": "ALL_SELFTESTS_PASSED", "passed_count": len(results), "cases": results}


def build_arg_parser() -> argparse.ArgumentParser:
    """Construct CLI parser for blind_parity_probe."""
    parser = argparse.ArgumentParser(description="Stage-0 Blind Parity Engine for audit-the-audit")
    parser.add_argument("--selftest", action="store_true", help="Run Popperian adversarial mutation self-test suite")
    sub = parser.add_subparsers(dest="command")

    p_commit = sub.add_parser("commit", help="Validate zero-anchor prompt and seal expected claims commitment")
    p_commit.add_argument("--claims", required=True, help="Path to private expected-claims JSON")
    p_commit.add_argument("--prompt", required=True, help="Path to drafted blind-auditor prompt text")
    p_commit.add_argument("--out", help="Optional path to write private reveal bundle JSON")

    p_probe = sub.add_parser("probe", help="Execute 6-surface deterministic blind parity probe")
    p_probe.add_argument("--spec", required=True, help="Path to non-anchored probe spec JSON")
    p_probe.add_argument("--out", help="Optional path to write Merkle-signed probe receipt JSON")

    p_rec = sub.add_parser("reconcile", help="Verify commitment + receipt integrity and compute Audit-vs-Reality Delta")
    p_rec.add_argument("--reveal", required=True, help="Path to caller private reveal bundle JSON")
    p_rec.add_argument("--receipt", required=True, help="Path to blind auditor probe receipt JSON")
    return parser


def main() -> int:
    """CLI entrypoint."""
    parser = build_arg_parser()
    args = parser.parse_args()

    if args.selftest:
        report = run_selftest()
        print(json.dumps(report, indent=2))
        return 0 if report.get("status") == "ALL_SELFTESTS_PASSED" else 1

    if args.command == "commit":
        claims = json.loads(Path(args.claims).read_text(encoding="utf-8"))
        prompt_text = Path(args.prompt).read_text(encoding="utf-8")
        res = create_commitment(claims, prompt_text)
        if not res["barrier_passed"]:
            print(json.dumps(res, indent=2))
            return 2
        if args.out:
            Path(args.out).write_text(json.dumps(res, indent=2) + "\n", encoding="utf-8", newline="\n")
        public = {
            "schema": res["schema"],
            "barrier_passed": True,
            "commitment": res["commitment"],
            "claims_keys": sorted(claims.keys()),
        }
        print(json.dumps(public, indent=2))
        return 0

    if args.command == "probe":
        spec = json.loads(Path(args.spec).read_text(encoding="utf-8"))
        receipt = run_probe(spec)
        if args.out:
            Path(args.out).write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8", newline="\n")
        print(json.dumps(receipt, indent=2))
        return 0 if receipt["verdict"] == "1:1 CLEAN" else 1

    if args.command == "reconcile":
        reveal = json.loads(Path(args.reveal).read_text(encoding="utf-8"))
        receipt = json.loads(Path(args.receipt).read_text(encoding="utf-8"))
        rec = reconcile_commitment(reveal, receipt)
        print(json.dumps(rec, indent=2))
        return 0 if rec["status"] == "RECONCILED_MATCH" else 1

    parser.print_help()
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
