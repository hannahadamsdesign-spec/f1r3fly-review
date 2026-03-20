# F1R3FLY.IO Website — Dev Log
*Last updated: March 17, 2026*

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
- **Client logos: 2-col grid on mobile** — Changed `.client-logo-grid` base from `repeat(4, 1fr)` to `repeat(2, 1fr)`, restores to 4-col at 768px+. Increased logo sizes from 55%/45% to 75%/60%.
- **Client body text: stacked on mobile** — Replaced inline `2fr 1fr` grid with `.client-body-grid` class. Stacks single-column on mobile, 2-col at 768px+.

---

### Mar 16, 2026 — Session 4
- **Typography swap:** Replaced Adobe Typekit (Brandon Grotesque) with Google Fonts (Josefin Sans 100/300/400/600/700 + Source Sans 3 300/400/600/700). Updated `--font-heading` and `--font-body` CSS variables. Zero remaining references to Brandon in codebase.
- **Brand color corrections:** `--color-bg` → `#000000`, `--color-accent` → `#3FA9F5`, `--color-highlight` → `#F3D630`, `--gradient-brand` → `#F3D630 → #8BB999` (Yellow → Sage), `--gradient-developer` → `#007BC4 → #009188`.
- **Logo replacement:** Nav now uses `f1r3fly-io-horizontal-logo.svg` (bug + wordmark baked in) via `.nav-logo-wordmark` class at 40px height. Hero uses `f1r3fly-io-vertical-logo.svg` at 200×178px. Removed separate `<h1>` heading and `.nav-logo-text` span since wordmark is in the SVG.
- **Eyebrow labels:** Changed `.label` from `display: block` to `display: inline-block` so gradient maps to text width, not container width. Removed `display: block` from `.faq-subsection-label`. Gradient now renders Yellow→Sage correctly on all labels.
- **Nav subtitle gradient fix:** Added `width: fit-content` to `.nav-logo-subtitle`. Removed duplicate gradient from child `<a>` — parent gradient now covers entire subtitle. Changed tablet breakpoint from `display: inline` to `display: inline-block`.
- **Card h3 style:** Changed `.card h3` to Source Sans 3 (`--font-body`), 16px, bold (700) — matches body text size.
- **Ticker text:** Changed from gradient text to `color: rgba(255, 255, 255, 0.35)` with `mix-blend-mode: overlay`.
- **Full audit document created:** `F1R3FLY-Website-Audit-2026-03-16.md` — covers content, colors, typography, team roster, technical issues, deployment questions, prioritized fix list.

---

### Mar 17, 2026 — Session 5
- **Blog cards built:** 17 expandable article cards injected via JS into `#blogGrid`. Each card: tag (AI & Agents / Compositionality / Developer / Philosophy), title, description, date, expand/collapse with key takeaways, Substack link. Content sourced from Daria's SEO delivery. Hover gradients cycle through purple, teal, magenta, green (6n rotation).
- **Blog card CSS added to styles.css:** `.blog-parent`, `.blog-tag`, `.blog-expand-btn`, `.blog-child-grid`, `.blog-child`, expanded state (`grid-column: 1 / -1`), tag color classes (`.blog-tag-ai` #3FA9F5, `.blog-tag-comp` #F3D630, `.blog-tag-phil` #8BB999, `.blog-tag-dev` #009188).
- **Quote band added** between Blog and Contact sections: Greg Meredith pull quote in `.section-band.neutral`.
- **Bug fix: blog cards invisible (opacity: 0).** Cards were generated with `animate-in from-bottom` class, but IntersectionObserver had already run before JS injected the cards — so observer never fired on them. Cards rendered as transparent boxes. Fix: removed `animate-in from-bottom` from JS card generation (`card.className='blog-parent'`). Cards now render immediately. Fade-in animation can be restored later by re-triggering the observer after injection.
- **Bug fix: section content bleed-through on tablet/desktop.** The 768px+ breakpoint set `.section-page { height: calc(85vh - var(--nav-height)) }` — a fixed height. Any section with content taller than 85vh (blog with 17 cards, plus others Daria flagged) overflowed, and subsequent sections rendered underneath the overflow. Fix: changed `height` to `min-height` at the 768px+ breakpoint, matching the mobile-first rule. The CSS comment already acknowledged this was the correct approach ("Mobile: min-height instead of height to prevent content overflow/overlap") — the tablet override just wasn't following it.
- **Daria's keyword framework reviewed.** Document `key_words_for_the_web_site.docx` — five clusters: Core Intent, Pain Point Hooks, Use Case, Audience-Specific, Brand Differentiators. Directly useful for meta tags, alt text, and content strategy.

---

---

### Mar 20, 2026 — Session 6
- **Individual article pages built:** Per Daria's meeting (March 20 morning call), switched from expandable inline cards to 17 individual article HTML pages. Each page follows Daria's specified structure: H1 title, Substack subtitle link, "In brief" intro, Key Takeaways (bullets), Key Questions (bullets), Why It Matters (prose), Related internal cross-link, Substack link, topic tags.
- **Article file structure:** `articles/` directory with 17 HTML files using keyword-rich slugs from Daria's doc. Generator script (`generate_articles.py`) at website rebuild root — regenerates all 17 from data + template.
- **Article CSS:** `css/article.css` — article-specific styles inheriting base `styles.css`. Width matches site `--container-max` (1400px). H1 at `font-weight: 500` (medium). Eyebrow tags at 16px/400 matching site `.label` spec. Dashed border box (`.article-box`) wraps article content below breadcrumb.
- **Blog section updated on index.html:** Cards changed from expandable `<div>`s to `<a>` link cards pointing to `articles/[slug].html`. Removed expand/collapse JS, detail content, and Substack links from cards. Added `blog-link-card` and `blog-read-more` CSS classes.
- **Page transitions added:** Directional slide transitions between blog grid and article pages. Blog card click → black panel slides right (going deeper). "← Ideas & Research" back link → panel slides left (going back). CSS keyframe animations (`slideRight` / `slideLeft`) on `.page-transition` overlay in `styles.css`. JS in `main.js` intercepts link clicks, plays transition, navigates at midpoint.
- **Smooth scroll conflict fixed:** Back link previously navigated to `index.html#blog`, triggering CSS `scroll-behavior: smooth` which caused a "rush down" animation competing with the slide transition. Fix: back link now navigates to `index.html?scrollto=blog`. JS on page load detects `?scrollto=` param, forces `scrollBehavior: auto` (instant jump), scrolls to target, then cleans URL to `#blog` and restores smooth scroll.
- **Files modified:** `index.html` (blog section JS), `css/styles.css` (transition overlay, link card styles), `css/article.css` (new file, article layout), `js/main.js` (transition logic, scrollto handler), `generate_articles.py` (article generator script), `articles/*.html` (17 generated files).

---

*For AI instances: This file is the technical source of truth for website work. Cross-cutting project info (payments, equity, team) is in `/Dropbox/09 AI Resources/Projects/F1R3FLY.md`.*
