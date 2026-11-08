# PRECEDENT — Public Website & Brand Experience Redesign Report

**Date:** November 9, 2026  
**Audience:** Product Engineering, Brand Strategy & Systems Architecture  
**Status:** **IMPLEMENTED & VERIFIED**

---

## 1. Executive Summary

PRECEDENT’s public-facing brand experience has been designed and implemented from the ground up, establishing an authoritative, category-defining visual presence without altering or regressing any internal application workflows.

The new brand experience implements the **Dark Swiss Editorial × Subtle Aurora Gradient × Bento Grid** design system, delivering:
1. **Public Landing Page (`/`)**: A typography-led editorial narrative paired with an asymmetrical capabilities bento grid and an adapted DotTiles instrument panel.
2. **About PRECEDENT (`/about`)**: A deep product philosophy and cognitive architecture essay on organizational memory and the Retain → Recall → Reflect flywheel.
3. **Seamless Platform Entry (`/app`)**: Clean transition into the existing PRECEDENT Command Center, with all existing deep links (`/proposals`, `/review`, `/contradictions`, `/lab`, etc.) completely preserved.

---

## 2. Information Architecture & Routing

| Route | Role | Layout & Shell Treatment |
| :--- | :--- | :--- |
| **`/`** | **Public Landing Page** | Full-width, natural page scrolling, `PublicNavbar` with wordmark, Hero, Brand Statement, Loop Visual, Bento Grid, DotTiles Instrument Panel, How It Works, Closing CTA, `PublicFooter`. |
| **`/about`** | **Philosophy & Architecture** | Full-width, natural page scrolling, editorial essay format, deep cognitive mechanics, verified technology stack. |
| **`/app`** | **Institutional Command Center** | Existing Overview dashboard with metric cards, active contradiction defense banner, live proposal workspace, and recent memory feed. Rendered with internal `<Sidebar />`. |
| **`/proposals`** | **Proposal Workspace** | Existing proposal and RFP management. |
| **`/review`** | **Review Center** | Domain lead human correction engine. |
| **`/contradictions`**| **Contradiction Defense** | Pre-submission deterministic conflict blocking and resolution audit trail. |
| **`/lab`** | **A/B Memory Lab** | Empirical side-by-side Memory ON vs OFF measurement. |
| **`/memory`** | **Memory Explorer** | Provenance inspection of Hindsight memory banks. |
| **`/claims`**, **`/clients`**, **`/outcomes`**, **`/analytics`**, **`/settings`** | **Auxiliary Workspaces** | Preserved with full backward compatibility. |

---

## 3. Visual System & Design Tokens

The visual language follows strict Swiss graphic design principles, utilizing intentional negative space, high typographic hierarchy, and controlled atmospheric lighting:

```css
:root {
  --background: #08090D;          /* Near-black canvas */
  --bg-secondary: #0D0F15;       /* Elevated dark backdrop */
  --surface: #111319;            /* Bento & tile surface */
  --foreground: #F5F5F7;         /* Primary crisp editorial typography */
  --foreground-muted: #9295A1;   /* Secondary technical metadata */
  --border-muted: rgba(255, 255, 255, 0.09); /* Restrained hairline dividers */
  --electric-violet: #7965FF;    /* Primary aurora accent & memory highlight */
  --muted-teal: #00C9B7;         /* Secondary aurora accent & grounding indicator */
}
```

### Aesthetic Safeguards
- **Zero Generic AI Tropes**: No glowing floating glass spheres, no rainbow gradient text on body copy, no generic humanoid robots or neural networks.
- **Controlled Lighting**: Soft radial glows (`blur-[120px]` to `blur-[140px]`) positioned strictly behind key narrative anchors.
- **Atmospheric Backgrounds**: Fine hairline grids (`background-size: 40px 40px`) and subtle dot grids (`background-size: 24px 24px`) provide depth without visual noise.

---

## 4. Reference Implementations Adapted

### 4.1 Agency Hero Reference Adaptation (`components/public/HeroSection.tsx`)
- **Preserved Structural Mechanics**:
  - Balanced typography-first composition with high-contrast eyebrow badges.
  - Art-directed connected knowledge graph visual representing RFP Requirements ↔ Human Review Revision ↔ Grounded Response.
  - Horizontal proof tape emphasizing real enterprise bidding constraints (`RFPs Ingested`, `Human Reasoning Retained`, `Contradictions Defended`, `Client Concessions Quarantined`).
- **Brand Identity Enforced**:
  - Wordmark: `PRECEDENT`
  - Headline: *Your organization’s memory. Your next unfair advantage.*
  - Supporting Statement: *Every proposal contains decisions, experience, corrections, and outcomes worth remembering. PRECEDENT turns that institutional knowledge into intelligence that makes every next bid stronger.*

### 4.2 DotTiles Reference Adaptation (`components/public/DotTile.tsx`, `components/public/DotTilesSection.tsx`)
- **Preserved Component Architecture**:
  - Black translucent glass surfaces (`background: #0D0F15/90`, `border: 1px solid rgba(255, 255, 255, 0.08)`).
  - Dot-matrix numerical typography with animated count-up transitions via `requestAnimationFrame`.
  - Micro-visualizations (sparkline bars, dot matrix grids, confidence rings).
  - Restrained hover states with subtle violet/teal border illumination.
  - Strict `prefers-reduced-motion` compliance.
- **PRECEDENT Domain Grounding**:
  1. *Retained Experiences* (Verified domain lead review corrections).
  2. *Proposals & RFPs Processed* (Line-item requirements parsed).
  3. *Precedents Recalled* (Historical revisions injected into active prompt contexts).
  4. *Approved Human Corrections* (Transformed into permanent organizational precedent).
  5. *Contradictions Prevented* (Colliding claims blocked before submission).
  6. *Reviewer Edit Reduction Rate* (Empirically measured A/B character reduction).
- **Honest Telemetry Flag**: Clearly distinguishes whether telemetry originates from the live database or validated synthetic seed baselines.

---

## 5. Architectural & Component Inventory

```
frontend/src/
├── app/
│   ├── layout.tsx                     # Root layout with AppShell wrapper & metadata
│   ├── globals.css                    # Tailwind v3, CSS variables, aurora glows, grid backgrounds
│   ├── page.tsx                       # Public Landing Page (17 routes total)
│   ├── about/
│   │   └── page.tsx                   # About PRECEDENT (Product Philosophy & Architecture)
│   └── app/
│       └── page.tsx                   # Internal Command Center (Moved from root, 100% intact)
├── components/
│   ├── AppShell.tsx                   # Client router switcher (public vs internal app shell)
│   ├── Header.tsx                     # Internal application header
│   ├── Sidebar.tsx                    # Internal navigation sidebar (updated with /app links)
│   └── public/
│       ├── PublicNavbar.tsx           # Minimal Swiss navigation with responsive drawer
│       ├── HeroSection.tsx            # Art-directed hero with knowledge graph visual & tape
│       ├── BrandStatement.tsx         # "Every bid builds a better next bid" thesis & matrix
│       ├── LoopVisual.tsx             # 5-step continuous intelligence flywheel timeline
│       ├── BentoGrid.tsx              # Asymmetrical capabilities bento grid
│       ├── DotTile.tsx                # Reusable black-glass dot-matrix metric tile
│       ├── DotTilesSection.tsx        # 6-metric operational intelligence panel
│       ├── HowItWorks.tsx             # Retain, Recall, Reflect 3-stage cognitive breakdown
│       ├── ClosingCta.tsx             # "Stop starting from zero" call to action
│       └── PublicFooter.tsx           # Category-defining enterprise footer
```

---

## 6. Verification & Test Evidence

### 6.1 Frontend Production Build
```
▲ Next.js 15.5.29
✓ Compiled successfully in 2.7s
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (17/17)
✓ Finalizing page optimization

Route (app)                                 Size  First Load JS
┌ ○ /                                    12.5 kB         122 kB
├ ○ /_not-found                            993 B         104 kB
├ ○ /about                               4.24 kB         113 kB
├ ○ /analytics                           5.08 kB         112 kB
├ ○ /app                                 5.63 kB         112 kB
├ ○ /claims                              4.22 kB         111 kB
├ ○ /clients                             3.72 kB         110 kB
├ ○ /contradictions                      4.97 kB         111 kB
├ ○ /lab                                 5.96 kB         112 kB
├ ○ /memory                              4.87 kB         111 kB
├ ○ /outcomes                            4.61 kB         111 kB
├ ○ /proposals                           3.68 kB         110 kB
├ ƒ /proposals/[id]                      6.01 kB         112 kB
├ ○ /proposals/upload                    5.38 kB         112 kB
├ ○ /review                              6.08 kB         113 kB
└ ○ /settings                            4.28 kB         111 kB
+ First Load JS shared by all             103 kB
```

### 6.2 Backend Test Suite
```
tests/test_api_e2e.py::test_api_health_endpoint PASSED                   [  6%]
tests/test_api_e2e.py::test_api_proposals_list PASSED                    [ 12%]
tests/test_api_e2e.py::test_api_generate_and_review_flow PASSED          [ 18%]
tests/test_api_e2e.py::test_api_comparison_endpoint PASSED               [ 25%]
tests/test_api_e2e.py::test_api_analytics_summary PASSED                 [ 31%]
tests/test_contradiction_gate.py::test_contradiction_blocks_submission_and_audits_resolution PASSED [ 37%]
tests/test_core.py::test_rfp_parser_valid_text PASSED                    [ 43%]
tests/test_core.py::test_rfp_parser_empty_file PASSED                    [ 50%]
tests/test_core.py::test_hindsight_retain_and_recall PASSED              [ 56%]
tests/test_core.py::test_hindsight_client_isolation PASSED               [ 62%]
tests/test_core.py::test_contradiction_detection_deterministic PASSED    [ 68%]
tests/test_full_lifecycle.py::test_full_precedent_lifecycle PASSED       [ 75%]
tests/test_hindsight_live.py::test_live_hindsight_daemon_connectivity SKIPPED [ 81%]
tests/test_hindsight_live.py::test_hindsight_service_honesty_mode PASSED [ 87%]
tests/test_learning_demonstration.py::test_institutional_learning_cycle_api PASSED [ 93%]
tests/test_persistence_restart.py::test_hindsight_persistence_survives_restart PASSED [100%]

=================== 15 passed, 1 skipped, 1 warning in 0.74s ===================
```

---

## 7. Operational Integrity & Verification Checklist

- [x] Zero breaking changes to existing backend, models, routers, and database schemas.
- [x] Internal application accessible at `/app` with full command center metrics and workflows.
- [x] All deep links (`/proposals`, `/review`, `/contradictions`, `/lab`, `/settings`, etc.) preserved.
- [x] All public CTAs lead to `/app`.
- [x] DotTiles respect `prefers-reduced-motion` and animate numbers without layout jitter.
- [x] Aurora glow backdrops are restrained and subtle (no rainbow meshes, no full-screen glowing gradients).
- [x] Zero fabricated customer logos, testimonials, or usage claims.
