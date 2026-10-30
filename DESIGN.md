---
name: Antigravity Multi-Agent Hub
description: High-density mission control portal and atomic claim ledger for multi-agent co-development
colors:
  obsidian-ground: "#0a0d14"
  surface-panel: "#0f172a"
  surface-card: "#131d33"
  border-divider: "#1e293b"
  border-highlight: "#334155"
  status-completed: "#34d399"
  status-inprogress: "#fbbf24"
  status-claimed: "#60a5fa"
  status-blocked: "#f87171"
  text-primary: "#f8fafc"
  text-secondary: "#94a3b8"
  text-tertiary: "#64748b"
typography:
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.3"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.5"
  mono:
    fontFamily: "JetBrains Mono, Fira Code, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
---

## Overview

The Antigravity Multi-Agent Hub design system embodies mission-critical systems engineering. It provides a dense, scannable, dark-first operational cockpit where human architects and autonomous subagents track tasks, inspect domain overlays, and verify hardware proofs without cognitive friction or decorative noise.

## Colors

- **Obsidian Ground (`#0a0d14`)**: Root application background providing maximum contrast for telemetry data.
- **Surface Panels (`#0f172a` & `#131d33`)**: High-contrast slate panels anchoring distinct functional zones.
- **Borders & Dividers (`#1e293b`)**: Crisp 1px structural framing separating high-density data regions.
- **Semantic Indicators**:
  - `Completed`: Emerald (`#34d399`) — Verified pass, locked milestone, SHA256 parity.
  - `In Progress`: Amber (`#fbbf24`) — Active agent compute, uncommitted state.
  - `Claimed`: Blue (`#60a5fa`) — Atomic task ownership reserved.
  - `Blocked`: Rose (`#f87171`) — Prerequisite dependency or missing hardware.
  - `Open`: Slate (`#94a3b8`) — Unassigned task.

## Typography

- **Interface Stack**: Inter (system-ui fallback) for natural readability, consistent optical weight, and crisp UI labels.
- **Technical Stack**: JetBrains Mono for task identifiers (`BOUNTY-VD-001`), domain tags (`#hardware-hid-dualsense`), file paths, hashes, and tabular telemetry counters (`tabular-nums`).

## Layout

- **Persistent Vitals Banner**: Top telemetry rail displaying continuous node health, PINPOINT pass rates, and budget meters.
- **65 / 35 Asymmetric Split**:
  - Primary Column (65%): Central interactive Bounty Ledger with search filtering, status tabs, and detail expansion.
  - Secondary Cockpit (35%): Stacked registry modules (Domain Overlay Taxonomy, Venture Incubator Spotlight, Project Node Health).
- **Responsive Adaptability**: Drops into a single high-priority column below `1024px` viewport width.

## Elevation & Depth

- **Tonal Layering**: Flat, tactile depth achieved purely through surface luminance contrasts (`#0a0d14` -> `#0f172a` -> `#131d33`), rather than heavy drop shadows.
- **Focus Glows**: Subtle 1px focus rings (`ring-emerald-500/50`) during keyboard interaction.

## Shapes

- **Radius Discipline**:
  - `sm` (4px) for status badges, monospace tag pills, and input fields.
  - `md` (6px) for action buttons and secondary list items.
  - `lg` (8px) for major operational panels and modal drawers.

## Components

- **VitalsHeader**: Top-docked status cockpit with live system indicators.
- **BountyLedger**: High-density interactive ledger with `/` hotkey search, status filtering, and click-to-inspect trigger.
- **BountyDetailDrawer**: Slide-over modal with full dependency graph, verified artifact paths, and live status toggling.
- **DomainOverlayPanel**: Multi-tag cross-project filter index.
- **VentureIncubatorPanel**: R&D ledger card highlighting market wedge, patent targets, and technical moats.

## Do's and Don'ts

### Do's
- Always pair status badges with text labels, not color alone.
- Use `tabular-nums` on all counters, ratios, and timestamps.
- Maintain WCAG AA contrast ratio (≥4.5:1) for all body text.
- Use authored SVG icons with consistent 1.5px or 2px stroke width.

### Don'ts
- Never use generic purple/violet gradients or glowing borders.
- Never place kickers or eyebrows above section headings.
- Never use Unicode emojis in place of interface icons.
- Never create nested cards or card grids of identical icon + header + text cards.
