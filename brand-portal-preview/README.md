# F1R3FLY Brand Portal

Live site: **https://hannahadamsdesign-spec.github.io/f1r3fly-brand-portal/**

Everything for the F1R3FLY brands in one place: the brand books, every logo variant with a preview and a download in PDF, JPG, SVG, PNG or all four zipped, the color system, fonts, the layout grid, social templates, and the AI brand kit.

Last update: November 6, 2026. Reorganised 2026-11-06: new folder layout, new file names, one preview page per brand.

## Where things are

| Brand | Folder | What |
|---|---|---|
| **[F1R3FLY.IO →](logos/ff.io/)** | `logos/ff.io/` | 15 variants |
| **[F1R3FLY Industries →](logos/ff.indust/)** | `logos/ff.indust/` | 14 variants |
| **[f1r3lang →](logos/flang/)** | `logos/flang/` | 8 variants |
| **[ign1t10n →](products/ign/)** | `products/ign/` | 7 variants |

- `books/` the two brand books (PDF) and their cover images
- `system/` color system PDF, swatch pack, layout grid
- `fonts/` League Spartan and Source Sans 3 (SIL OFL), plus `ff-fonts.zip`
- `social/templates/` sixteen 1080 x 1080 post templates, [preview page](social/templates/)
- `social/canva/` MP4 previews and thumbnails of the animated Canva templates (links on the home page)
- `kit/` the AI brand kit skill (`f1r3fly-brand-kit.skill`) and its spec (`SKILL.md`)
- `build/` the manifest and the script that generates the pages and files
- `_archive/` retired files, including F1R3Gaze (the browser was renamed; its marks are no longer in use)

## File names

```
[brand]-[piece]-[layout]-[colorway]-[background].[ext]
```

- brand: `ff.io` (F1R3FLY.IO), `ff.indust` (F1R3FLY Industries), `flang` (f1r3lang), `ign` (ign1t10n)
- piece: `logo` (mark + wordmark), `icon` (mark alone), `avatar`, `post`, `canva`
- layout: `wide`, `stacked`, `circle` (the mark inside a black circle), `ring`, `square`
- colorway: `color`, `white`, `black`
- background: `transp-dark` (transparent, made for dark backgrounds, white wordmark), `transp-light` (transparent, for light backgrounds, black wordmark), `transp` (icons, no wordmark), `onblack`, `onwhite` (background baked in)

Example: `ff.io-logo-stacked-circle-color-transp-dark.png` is the F1R3FLY.IO bug in a black circle with the wordmark below, in color, transparent, for dark backgrounds.

Every asset ships as `.pdf`, `.jpg`, `.svg`, `.png` and a `.zip` of all four. SVGs use plain presentation attributes (no CSS classes), so they open cleanly in design apps. PNGs are 2048 px on the long side, transparent. JPGs are flattened on #0A0A0A (dark) or white (light).

Raw file base for scripts and AI tools: `https://raw.githubusercontent.com/hannahadamsdesign-spec/f1r3fly-brand-portal/main/`

## Old name → new name

- `f1r3fly-io-horizontal-logo-color-on-dark` → `ff.io-logo-wide-color-transp-dark`
- `f1r3fly-io-horizontal-logo-color-on-black-solid` → `ff.io-logo-wide-color-onblack`
- `f1r3fly-io-horizontal-logo-white` → `ff.io-logo-wide-white-transp-dark`
- `f1r3fly-io-horizontal-logo-white-background` → `ff.io-logo-wide-circle-color-transp-light`
- `f1r3fly-io-horizontal-logo-BW-white-background` → `ff.io-logo-wide-circle-black-transp-light`
- `f1r3fly-io-vertical-logo-color-on-dark` → `ff.io-logo-stacked-color-transp-dark`
- `(new)` → `ff.io-logo-stacked-circle-color-transp-dark`
- `f1r3fly-io-vertical-logo-white` → `ff.io-logo-stacked-white-transp-dark`
- `f1r3fly-io-vertical-logo-white-background` → `ff.io-logo-stacked-circle-color-transp-light`
- `f1r3fly-io-vertical-logo-BW-white-background` → `ff.io-logo-stacked-circle-black-transp-light`
- `f1r3fly-io-bug-icon-color-on-dark` → `ff.io-icon-bug-color-transp`
- `f1r3fly-io-circle-icon-color-on-dark` → `ff.io-icon-circle-color-transp`
- `f1r3fly-io-circle-icon-white` → `ff.io-icon-circle-white-transp`
- `social-media/f1r3fly-io-avatar-bug-wordmark-ring` → `ff.io-avatar-ring-color-onblack`
- `social-media/f1r3fly-io-avatar-bug-square-black` → `ff.io-avatar-square-color-onblack`
- `f1r3fly-industries-horizontal-logo-color-on-dark` → `ff.indust-logo-wide-color-transp-dark`
- `f1r3fly-industries-horizontal-logo-color-on-black-solid` → `ff.indust-logo-wide-color-onblack`
- `f1r3fly-industries-horizontal-logo-white` → `ff.indust-logo-wide-white-transp-dark`
- `f1r3fly-industries-horizontal-logo-color-on-light` → `ff.indust-logo-wide-circle-color-transp-light`
- `f1r3fly-industries-horizontal-logo-bw-on-light` → `ff.indust-logo-wide-circle-black-transp-light`
- `f1r3fly-industries-vertical-logo-color-on-dark` → `ff.indust-logo-stacked-color-transp-dark`
- `f1r3fly-industries-vertical-logo-color-on-black-solid` → `ff.indust-logo-stacked-color-onblack`
- `f1r3fly-industries-circle-icon-color-on-dark` → `ff.indust-logo-stacked-circle-color-transp-dark`
- `f1r3fly-industries-vertical-logo-white` → `ff.indust-logo-stacked-white-transp-dark`
- `f1r3fly-industries-circle-icon-color-on-dark` → `ff.indust-logo-stacked-circle-color-transp-light`
- `f1r3fly-industries-vertical-logo-bw-on-light` → `ff.indust-logo-stacked-circle-black-transp-light`
- `f1r3fly-industries-knot-icon-color-on-dark` → `ff.indust-icon-knot-color-transp`
- `f1r3fly-industries-circle-icon-white` → `ff.indust-icon-knot-white-transp`
- `f1r3fly-industries-circle-logo-color-on-dark` → `ff.indust-icon-circle-color-transp`
- `f1r3lang-logo-color-on-dark` → `flang-logo-color-transp-dark`
- `f1r3lang-logo-color-on-black-solid` → `flang-logo-color-onblack`
- `f1r3lang-logo-white` → `flang-logo-white-transp-dark`
- `f1r3lang-logo-white-on-black-solid` → `flang-logo-white-onblack`
- `f1r3lang-logo-color-on-light` → `flang-logo-color-transp-light`
- `f1r3lang-logo-color-on-white-solid` → `flang-logo-color-onwhite`
- `f1r3lang-logo-black` → `flang-logo-black-transp-light`
- `f1r3lang-logo-black-on-white-solid` → `flang-logo-black-onwhite`
- `ign1t10n-app-icon` → `ign-icon-app-color-onblack`
- `ign1t10n-horizontal-logo-color-on-dark` → `ign-logo-wide-color-transp-dark`
- `ign1t10n-horizontal-logo-white` → `ign-logo-wide-white-transp-dark`
- `ign1t10n-horizontal-logo-black` → `ign-logo-wide-black-transp-light`
- `ign1t10n-vertical-logo-color-on-dark` → `ign-logo-stacked-color-transp-dark`
- `ign1t10n-vertical-logo-white` → `ign-logo-stacked-white-transp-dark`
- `ign1t10n-vertical-logo-black` → `ign-logo-stacked-black-transp-light`
- `f1r3fly-io-social-square-1080-announcement-dark-orb` → `ff.io-post-square-announcement-dark-orb`
- `f1r3fly-io-social-square-1080-announcement-section-teal` → `ff.io-post-square-announcement-section-teal`
- `f1r3fly-io-social-square-1080-article-dark-orb` → `ff.io-post-square-article-dark-orb`
- `f1r3fly-io-social-square-1080-article-section-purple` → `ff.io-post-square-article-section-purple`
- `f1r3fly-io-social-square-1080-event-dark-orb` → `ff.io-post-square-event-dark-orb`
- `f1r3fly-io-social-square-1080-event-section-teal` → `ff.io-post-square-event-section-teal`
- `f1r3fly-io-social-square-1080-quote-dark-orb` → `ff.io-post-square-quote-dark-orb`
- `f1r3fly-io-social-square-1080-quote-section-purple` → `ff.io-post-square-quote-section-purple`
- `f1r3fly-io-social-square-1080-stat-gradient-brand-ellipse` → `ff.io-post-square-stat-gradient-brand-ellipse`
- `f1r3fly-io-social-square-1080-stat-gradient-dark-orb` → `ff.io-post-square-stat-gradient-dark-orb`
- `f1r3fly-io-social-square-1080-stat-yellow-dark-orb` → `ff.io-post-square-stat-yellow-dark-orb`
- `f1r3fly-io-social-square-1080-tagline-bold-brand-ellipse` → `ff.io-post-square-tagline-bold-brand-ellipse`
- `f1r3fly-io-social-square-1080-tagline-bold-dark-orb` → `ff.io-post-square-tagline-bold-dark-orb`
- `f1r3fly-io-social-square-1080-tagline-thin-dark-orb` → `ff.io-post-square-tagline-thin-dark-orb`
- `f1r3fly-io-social-square-1080-tagline-thin-light` → `ff.io-post-square-tagline-thin-light`
- `f1r3fly-io-social-square-1080-tagline-thin-section-teal` → `ff.io-post-square-tagline-thin-section-teal`
- `f1r3fly-io-template-01-logo-intro-square.mp4` → `ff.io-canva-01-logo-intro-square.mp4`
- `f1r3fly-io-template-01-logo-intro-square-thumb.png` → `ff.io-canva-01-logo-intro-square-thumb.png`
- `f1r3fly-io-template-01-logo-intro-portrait.mp4` → `ff.io-canva-01-logo-intro-portrait.mp4`
- `f1r3fly-io-template-01-logo-intro-portrait-thumb.png` → `ff.io-canva-01-logo-intro-portrait-thumb.png`
- `f1r3fly-io-template-02-grey-to-navy-square.mp4` → `ff.io-canva-02-grey-to-navy-square.mp4`
- `f1r3fly-io-template-02-grey-to-navy-square-thumb.png` → `ff.io-canva-02-grey-to-navy-square-thumb.png`
- `f1r3fly-io-template-02-grey-to-navy-portrait.mp4` → `ff.io-canva-02-grey-to-navy-portrait.mp4`
- `f1r3fly-io-template-03-teal-square.mp4` → `ff.io-canva-03-teal-square.mp4`
- `f1r3fly-io-template-03-teal-square-thumb.png` → `ff.io-canva-03-teal-square-thumb.png`
- `f1r3fly-io-template-03-teal-portrait.mp4` → `ff.io-canva-03-teal-portrait.mp4`
- `f1r3fly-io-template-04-magenta-square.mp4` → `ff.io-canva-04-magenta-square.mp4`
- `f1r3fly-io-template-04-magenta-square-thumb.png` → `ff.io-canva-04-magenta-square-thumb.png`
- `f1r3fly-io-template-04-magenta-portrait.mp4` → `ff.io-canva-04-magenta-portrait.mp4`
- `f1r3fly-io-template-05-green-square.mp4` → `ff.io-canva-05-green-square.mp4`
- `f1r3fly-io-template-05-green-square-thumb.png` → `ff.io-canva-05-green-square-thumb.png`
- `f1r3fly-io-template-05-green-portrait.mp4` → `ff.io-canva-05-green-portrait.mp4`
- `f1r3fly-io-template-06-panel-loop-grey-to-navy-square.mp4` → `ff.io-canva-06-panel-loop-grey-to-navy-square.mp4`
- `f1r3fly-io-template-06-panel-loop-grey-to-navy-square-thumb.png` → `ff.io-canva-06-panel-loop-grey-to-navy-square-thumb.png`
- `f1r3fly-io-template-07-panel-loop-teal-square.mp4` → `ff.io-canva-07-panel-loop-teal-square.mp4`
- `f1r3fly-io-template-07-panel-loop-teal-square-thumb.png` → `ff.io-canva-07-panel-loop-teal-square-thumb.png`
- `f1r3fly-io-template-08-panel-loop-magenta-square.mp4` → `ff.io-canva-08-panel-loop-magenta-square.mp4`
- `f1r3fly-io-template-08-panel-loop-magenta-square-thumb.png` → `ff.io-canva-08-panel-loop-magenta-square-thumb.png`
- `f1r3fly-io-template-09-firefly-panel-straight-square.mp4` → `ff.io-canva-09-firefly-panel-straight-square.mp4`
- `f1r3fly-io-template-09-firefly-panel-straight-square-thumb.png` → `ff.io-canva-09-firefly-panel-straight-square-thumb.png`
- `f1r3fly-io-template-10-firefly-panel-curved-square.mp4` → `ff.io-canva-10-firefly-panel-curved-square.mp4`
- `f1r3fly-io-template-10-firefly-panel-curved-square-thumb.png` → `ff.io-canva-10-firefly-panel-curved-square-thumb.png`
- `F1R3FLY INDUSTRIES-Brand Style Guide.pdf` → `books/ff.indust-brand-style-guide-2026-09.pdf`
- `F1R3FLY.IO-Brand Guidebook.pdf` → `books/ff.io-brand-guidebook-2026-09.pdf`
- `f1r3fly-brand-color-system-06.12.2026.pdf` → `system/ff-color-system-2026-06.pdf`
- `swatches/f1r3fly-brand-swatches.zip` → `system/ff-swatches.zip`
- `templates/f1r3fly-brand-grid.*` → `system/ff-grid.*`

## Maintaining it

Edit `build/assets.json`, drop new source SVG/PDF files beside the old ones (or under `build/NEW/`), run `python3 build/build.py <this repo> <output>`, and copy the output in. The manifest is the single list of what exists; the pages are generated from it.

Source repo: [https://github.com/hannahadamsdesign-spec/f1r3fly-brand-portal](https://github.com/hannahadamsdesign-spec/f1r3fly-brand-portal). The org fork `F1R3FLY-io/f1r3fly-brand-portal` mirrors this repo; this one is upstream.
