# F1R3FLY.IO Website

The official website for F1R3FLY.IO — an AI-native Layer 1 platform built on Rholang for verifiable, concurrent, multi-agent applications.

## Live Site

**https://f1r3fly.io/f1r3fly-io-website/**

Deployed via GitHub Pages from the [F1R3FLY-io/f1r3fly-io-website](https://github.com/F1R3FLY-io/f1r3fly-io-website) organization repository.

## Tech Stack

- **HTML5** with embedded CSS and JavaScript (no build step)
- **Typography:** Brandon Grotesque (headings) + Source Sans Pro (body) via Adobe Typekit
- **Deployment:** GitHub Pages

## Quick Setup

```bash
git clone git@github.com:F1R3FLY-io/f1r3fly-io-website.git
cd f1r3fly-io-website
cp scripts/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

## Local Development

1. Open `index.html` in a browser, or use a local server:
   ```bash
   python -m http.server 8000
   ```
   Then visit `http://localhost:8000`

2. Check for broken links before pushing:
   ```bash
   node scripts/check-links.mjs              # internal links only (fast)
   node scripts/check-links.mjs --check-external  # also check external URLs
   node scripts/check-links.mjs --verbose     # show all checked links
   ```

## Link Checking

A zero-dependency Node.js script (`scripts/check-links.mjs`) scans all HTML files for broken internal links, missing anchors, and missing assets. It runs automatically in two places:

- **GitHub Actions** — on every PR targeting `main` and on pushes to `main`
- **Pre-push hook** — blocks pushes to `main` if broken links are found (bypass with `git push --no-verify`)

### Setting Up the Pre-push Hook

The hook lives at `scripts/pre-push` so it's version-controlled. Copy it into your local git hooks:

```bash
cp scripts/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

This only needs to be done once per clone.

## Deployment

Files from this working folder are manually uploaded to the `F1R3FLY-io/f1r3fly-io-website` organization repository. GitHub Pages serves the site from the `main` branch root.

## Design

- **Color Scheme:** Black background with purple/blue gradients
- **Typography:** Brandon Grotesque headings, Source Sans Pro body (light weights)
- **Visual Style:** Parallax forest backgrounds, scroll-reveal animations, video hero, FAQ accordion

See `docs/design-specs.md` for full specifications.

## License

Apache 2.0 — See [LICENSE](LICENSE) for details.

## Contact

Website development: Hannah Adams (Creative Director)
Project owner: Greg Meredith — f1r3fly.ceo@gmail.com
