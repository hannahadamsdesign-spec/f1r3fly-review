# F1R3FLY.IO Website — Dev Log
*Last updated: February 23, 2026*

## Project Path
`/Users/hannahadams/Library/CloudStorage/Dropbox/01 ACTIVE WORK/F1R3FLY PROJECTS/02 F1R3FLY Website/08 Website Rebuild/`

## File Structure
- `index.html` — single-page site, all sections
- `css/styles.css` — mobile-first, breakpoints at 768px (tablet) and 1024px (desktop)
- `js/main.js` — scroll animations, accordion logic, mobile menu, parallax
- `images/` — all assets (logo-icon.svg, team photos, partner logos, parallax layers)

---

## Architecture

### Section Template System
- Nav sections (Home, Technology, Developers, Clients, Partners, Blog) use `.section.section-page`
- Fixed height: `calc(85vh - var(--nav-height))` for consistent scroll landing
- **Exception:** Team section uses `.section` only (content too tall for 85vh), with inline `scroll-margin-top: var(--nav-height)`
- `scroll-margin-top: var(--nav-height)` on `.section-page` handles nav offset
- Native browser `scroll-behavior: smooth` (no custom JS scroll)

### Gradient Connector Bands
- `.section-band` sits between nav sections as visual rhythm/connective tissue
- Gradient classes: `.neutral`, `.teal`, `.magenta`, `.green`, `.purple`
- Content inside bands: eyebrow labels, headings, body text, accordions

### FAQ System (Current)
- 4 simple `.section-band` wrappers with accordions (NOT sticky panels — those were removed Feb 23)
- Bands: Core Architecture (neutral), Developer-Focused (teal), Client-Focused (magenta), Partner-Focused (green)
- Accordion scope: `.closest('.section')` in main.js
- Item spacing: 12px padding-bottom/margin-bottom, 8px question padding
- Transition: 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)

### Contact Form
- Formspree free tier, endpoint: `mreabjwv`
- Sends to: general.manager@f1r3fly.io (Lilia) + hannah.adams.design@gmail.com
- Both emails verified on Formspree account (Hannah Adams login)
- 50 submissions/month limit (sufficient for pre-launch)

### Hero Section
- Logo: `logo-icon.svg` in `.hero-logo` wrapper
- Mobile: max-width 160px | Tablet (768px+): 180px | Desktop (1024px+): 196px
- Subtitle "A Subsidiary of F1R3FLY Industries" breaks into 2 lines on mobile via `<br class="mobile-break">`
- `.mobile-break` hidden at 768px+ via `display: none`

---

## CSS Breakpoint Structure
- **Base (mobile-first):** All default styles
- **768px+ (tablet):** `.mobile-break` hidden, hero-logo 180px, nav adjustments, 2-col grids
- **1024px+ (desktop):** Full nav links visible, hamburger hidden, hero-logo 196px, 3-col grids, 4-col team grid

---

## Known Issues / To-Do

### ✅ RESOLVED: Mobile "Home" nav scroll bug
Fixed in Session 3. All anchor clicks now manually calculate scroll offset accounting for nav height.

### ⚠️ DevTools responsive mode: nav position: fixed glitch
Chrome DevTools responsive emulation breaks `position: fixed` + `backdrop-filter`. Nav scrolls away in emulator but works fine in real narrow browser and on actual devices. Not a real bug — just don't trust DevTools for fixed-position testing.

### 🟡 General mobile fine-tuning
- Just started responsive pass at 400px width
- Need to check all sections at various mobile breakpoints
- Card grids, team photos, partner logos all need mobile review

---

## Session Log

### Feb 23, 2026 — Session 1 (earlier today)
- Removed FAQ sticky panel system (~55 lines CSS)
- Replaced with 4 simple `.section-band` gradient wrappers
- Compressed FAQ item spacing (30px → 12px)
- Updated accordion JS scope
- Team section: removed `.section-page`, added inline scroll-margin-top
- Diana Yevitska photo: `object-position: center 20%` to fix head crop
- Blog section: kept as standalone on black (consistent with other nav sections)

### Feb 23, 2026 — Session 2 (this session)
- Confirmed Formspree contact form routes to general.manager@f1r3fly.io (already set up)
- Hero logo: mobile size reduced 280px → 160px
- Hero subtitle: added mobile line break (`<br class="mobile-break">`)
- Removed `white-space: nowrap` from `.hero-subsidiary` base styles, restored at 768px+
- Identified "Home" mobile nav scroll bug (not yet fixed)

### Feb 23, 2026 — Session 3
- **Fixed: Mobile "Home" nav scroll bug** — All anchor clicks now use `preventDefault` + manual `scrollTo` with `--nav-height` offset via `requestAnimationFrame`. Fixes both mobile menu (body overflow reflow) and desktop (scrollIntoView not respecting scroll-margin-top).
- **Fixed: Content overlap on mobile** — Changed `.section-page` from `height` to `min-height` at base (mobile) level, so sections grow to fit content. Restored fixed `height: calc(85vh - var(--nav-height))` at 768px+ where content fits.
- **Investigated: Nav scrolling away on mobile** — Confirmed this is a Chrome DevTools responsive emulation bug, NOT a CSS issue. Nav stays fixed in real narrow browser window. `position: fixed` + `backdrop-filter` has known DevTools emulation issues.
- **Removed `overflow-x: hidden` from body** — Was on `body`, removed entirely (hero already contains parallax with its own `overflow: hidden`). Monitor for horizontal scroll on real devices.

---

*For AI instances: This file is the technical source of truth for website work. Cross-cutting project info (payments, equity, team) is in `/Dropbox/09 AI Resources/Projects/F1R3FLY.md`.*
