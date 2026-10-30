<#
.SYNOPSIS
    Automated Project Repository Scaffolder & Central Registry Onboarding Script

.DESCRIPTION
    Standardizes and initializes a project for the Antigravity Multi-Agent collaboration network:
    1. Generates project-local BOUNTY_BOARD.md, PROJECT_HANDOFF.md, and MULTIAGENT_PROTOCOLS.md.
    2. Wires up bidirectional relative links to central BOUNTY_BOARD.md and GLOBAL_KNOWLEDGE_INDEX.md.
    3. Registers the project in the Central Directory Registry (c:\Users\Zachariah\Documents\antigravity\BOUNTY_BOARD.md).
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectName,

    [Parameter(Mandatory=$false)]
    [string]$ProjectPath = "",

    [Parameter(Mandatory=$false)]
    [string]$Description = "Antigravity Workspace & Research Domain",

    [Parameter(Mandatory=$false)]
    [string]$TechStack = "Multi-Agent Tools, C++, Python, TypeScript",

    [Parameter(Mandatory=$false)]
    [string[]]$DomainTags = @("#multiagent-architecture")
)

$ErrorActionPreference = "Stop"

$globalRoot = if ($PSScriptRoot) { $PSScriptRoot } else { "c:\Users\Zachariah\Documents\antigravity" }
if (-not $ProjectPath) {
    $ProjectPath = Join-Path $globalRoot $ProjectName
}

if (-not (Test-Path $ProjectPath)) {
    New-Item -ItemType Directory -Path $ProjectPath -Force | Out-Null
    Write-Host "Created project directory: $ProjectPath" -ForegroundColor Green
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "=== Antigravity Project Onboarding & Scaffolding Tool ===" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Project Name: $ProjectName"
Write-Host "Target Path:  $ProjectPath"
Write-Host ""

# 1. Generate project-local BOUNTY_BOARD.md
$localBountyPath = Join-Path $ProjectPath "BOUNTY_BOARD.md"
if (-not (Test-Path $localBountyPath)) {
    $bountyContent = @"
# Project Bounty Board & Task Ledger: $ProjectName
**Task Registry, Agent Claim Ledger & Domain Overlay Index**

> [!IMPORTANT]
> **MULTI-AGENT DIRECTIVE:**
> - **Central Global Registry:** [`../BOUNTY_BOARD.md`](file:///$($globalRoot.Replace('\', '/'))/BOUNTY_BOARD.md)
> - **Global Protocols & Invariants:** [`../MULTIAGENT_PROTOCOLS.md`](file:///$($globalRoot.Replace('\', '/'))/MULTIAGENT_PROTOCOLS.md)
> - **Global Knowledge Catalog:** [`../GLOBAL_KNOWLEDGE_INDEX.md`](file:///$($globalRoot.Replace('\', '/'))/GLOBAL_KNOWLEDGE_INDEX.md)
> - **Milestone & Handoff Ledger:** [`PROJECT_HANDOFF.md`](file:///$($ProjectPath.Replace('\', '/'))/PROJECT_HANDOFF.md)

---

## 1. Project Domain Overlay Tags
$(($DomainTags | ForEach-Object { "- $_" }) -join "`n")

---

## 2. Active & Completed Project Bounties

| Bounty ID | Title | Status | Claimant / Owner | Dates | Domain Tags | Dependencies | Artifacts / Verification | Milestone Anchor |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`BOUNTY-$($ProjectName.ToUpper().Substring(0, [Math]::Min(3, $ProjectName.Length)))-001`** | Project Initialization & Repository Setup | `COMPLETED` | Subagent Initializer | $(Get-Date -Format 'yyyy-MM-dd') | $(($DomainTags) -join ', ') | None | Scaffolding | [`HANDOFF-001`](file:///$($ProjectPath.Replace('\', '/'))/PROJECT_HANDOFF.md#handoff-001-project-initialization--repository-setup) |

---

## 3. Claiming & Handoff Checklist for This Project

1. Read [`PROJECT_HANDOFF.md`](file:///$($ProjectPath.Replace('\', '/'))/PROJECT_HANDOFF.md) and [`MULTIAGENT_PROTOCOLS.md`](file:///$($ProjectPath.Replace('\', '/'))/MULTIAGENT_PROTOCOLS.md) before writing code.
2. Mark your bounty as `CLAIMED` in this table.
3. Protect project invariants and document breaking changes.
4. Execute tests and verify cryptographic parity if distributing binaries.
5. Append a handoff entry to [`PROJECT_HANDOFF.md`](file:///$($ProjectPath.Replace('\', '/'))/PROJECT_HANDOFF.md).
"@
    Set-Content -Path $localBountyPath -Value $bountyContent -Encoding UTF8
    Write-Host "  [OK] Created $localBountyPath" -ForegroundColor Green
} else {
    Write-Host "  [SKIP] $localBountyPath already exists" -ForegroundColor DarkGray
}

# 2. Generate project-local PROJECT_HANDOFF.md
$localHandoffPath = Join-Path $ProjectPath "PROJECT_HANDOFF.md"
if (-not (Test-Path $localHandoffPath)) {
    $handoffContent = @"
# Project Handoff & Milestone Decision Ledger: $ProjectName
**Authoritative Multi-Agent Handoff Log, Architectural Decisions & Milestone Index**

> [!IMPORTANT]
> **MANDATORY INSTRUCTIONS FOR INCOMING SUBAGENTS:**
> 1. **Read this file before making changes**: Do not waste tokens re-auditing or reverse-engineering decisions that are documented and locked below.
> 2. **Do NOT touch Locked Invariants**: Algorithms, contracts, and core interfaces documented in Section 1 must be preserved.
> 3. **Append every handoff**: When completing a bounty or modifying code, append a structured handoff entry to Section 3 using the standard protocol template.

---

## 1. Locked Architectural Invariants (DO NOT TOUCH)

| Invariant ID | Subsystem | Rule / Constraint | Rationale / Failure Mode Prevented |
| :--- | :--- | :--- | :--- |
| **INV-01** | Core Architecture | Adhere to Antigravity Multi-Agent Protocols | Token waste prevention and avoidance of conflicting test harnesses |

---

## 2. Directory Locations & Artifact Verification

- **Workspace:** $ProjectPath
- **Global Central Hub:** [`../BOUNTY_BOARD.md`](file:///$($globalRoot.Replace('\', '/'))/BOUNTY_BOARD.md)

---

## 3. Chronological Handoff & Milestone Ledger

---

### [HANDOFF-001] Project Initialization & Repository Setup
- **Timestamp:** $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
- **Agent Identity:** Subagent Initializer
- **Bounty ID:** `BOUNTY-$($ProjectName.ToUpper().Substring(0, [Math]::Min(3, $ProjectName.Length)))-001`
- **Status:** COMPLETED

#### Scope & Problem Addressed:
Standardize project into the Antigravity multi-agent collaboration network to enable cross-project discovery, bounty tracking, and handoffs.

#### Solution & Implementation:
- Scaffolding generated via [`init_project_repo.ps1`](file:///$($globalRoot.Replace('\', '/'))/init_project_repo.ps1).
- Connected to Central Directory Registry in [`BOUNTY_BOARD.md`](file:///$($globalRoot.Replace('\', '/'))/BOUNTY_BOARD.md).
"@
    Set-Content -Path $localHandoffPath -Value $handoffContent -Encoding UTF8
    Write-Host "  [OK] Created $localHandoffPath" -ForegroundColor Green
} else {
    Write-Host "  [SKIP] $localHandoffPath already exists" -ForegroundColor DarkGray
}

# 3. Generate project-local MULTIAGENT_PROTOCOLS.md
$localProtocolsPath = Join-Path $ProjectPath "MULTIAGENT_PROTOCOLS.md"
if (-not (Test-Path $localProtocolsPath)) {
    $protocolsContent = @"
# Multi-Agent Collaboration & Handoff Protocols: $ProjectName
**Standard Operating Procedure for Cross-Agent Coordination, Invariant Protection & Token Conservation**

> [!IMPORTANT]
> This project operates under the unified Antigravity Multi-Agent Collaboration Network.
> For the global protocol handbook, consult [`../MULTIAGENT_PROTOCOLS.md`](file:///$($globalRoot.Replace('\', '/'))/MULTIAGENT_PROTOCOLS.md).

---

## 1. Local Pre-Flight Protocol
1. Read [`BOUNTY_BOARD.md`](file:///$($ProjectPath.Replace('\', '/'))/BOUNTY_BOARD.md) to inspect open tasks.
2. Read [`PROJECT_HANDOFF.md`](file:///$($ProjectPath.Replace('\', '/'))/PROJECT_HANDOFF.md) to review completed milestones.
3. Search [`../GLOBAL_KNOWLEDGE_INDEX.md`](file:///$($globalRoot.Replace('\', '/'))/GLOBAL_KNOWLEDGE_INDEX.md) for existing reusable algorithms before writing code.
"@
    Set-Content -Path $localProtocolsPath -Value $protocolsContent -Encoding UTF8
    Write-Host "  [OK] Created $localProtocolsPath" -ForegroundColor Green
} else {
    Write-Host "  [SKIP] $localProtocolsPath already exists" -ForegroundColor DarkGray
}

# 4. Check registration in Central BOUNTY_BOARD.md
$centralBoardPath = Join-Path $globalRoot "BOUNTY_BOARD.md"
if (Test-Path $centralBoardPath) {
    $boardText = Get-Content -Path $centralBoardPath -Raw
    if ($boardText -notmatch [regex]::Escape($ProjectName)) {
        Write-Host "Registering $ProjectName into $centralBoardPath..." -ForegroundColor Yellow
        $newRow = "| **``$ProjectName``** | [``$ProjectName/``](file:///$($ProjectPath.Replace('\', '/'))/) | $Description | $TechStack | [`BOUNTY_BOARD.md`](file:///$($ProjectPath.Replace('\', '/'))/BOUNTY_BOARD.md) | [`PROJECT_HANDOFF.md`](file:///$($ProjectPath.Replace('\', '/'))/PROJECT_HANDOFF.md) |"
        $escapedNewRow = $newRow.Replace('$', '$$')
        $boardText = $boardText -replace '(\| \*\*`[a-zA-Z0-9_-]+`\*\*.*\| \[`PROJECT_HANDOFF\.md`\].*)', "`$1`n$escapedNewRow"
        Set-Content -Path $centralBoardPath -Value $boardText -Encoding UTF8
        Write-Host "  [OK] Registered in Central Bounty Board" -ForegroundColor Green
    } else {
        Write-Host "  [PASS] Project $ProjectName is already registered in Central Bounty Board" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Project '$ProjectName' successfully onboarded into Antigravity Network!" -ForegroundColor Green
