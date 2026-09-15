#!/usr/bin/env node
/**
 * Broken link detector for the F1R3FLY.IO static website.
 * Zero dependencies — uses only Node.js built-ins and regex.
 *
 * Usage:
 *   node scripts/check-links.mjs                  # internal links only (fast)
 *   node scripts/check-links.mjs --check-external  # also verify external URLs
 *   node scripts/check-links.mjs --verbose         # show all checked links
 *
 * Exit code 0 = all links OK, 1 = broken links found.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, relative, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = resolve(__dirname, "..");

const SKIP_SCHEMES = ["mailto:", "tel:", "javascript:", "data:"];
const SKIP_EXTERNAL_DOMAINS = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
];
const BLOCKED_EXTERNAL_HOSTS = [
  /^localhost$/,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^\[::1\]$/,
];

// Parse CLI args
const args = process.argv.slice(2);
const CHECK_EXTERNAL = args.includes("--check-external");
const VERBOSE = args.includes("--verbose");

/** Recursively find all .html files, skipping hidden dirs. */
function findHtmlFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findHtmlFiles(full));
    } else if (entry.name.endsWith(".html")) {
      results.push(full);
    }
  }
  return results.sort();
}

/** Extract all id="..." values from HTML text. */
const idCache = new Map();
function getIds(filePath) {
  if (idCache.has(filePath)) return idCache.get(filePath);
  const ids = new Set();
  try {
    const html = readFileSync(filePath, "utf-8");
    const re = /\bid\s*=\s*["']([^"']+)["']/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      ids.add(m[1]);
    }
  } catch {
    // unreadable — will be caught by file-exists check
  }
  idCache.set(filePath, ids);
  return ids;
}

/**
 * Extract href="..." and src="..." from HTML with line numbers.
 * Returns array of { url, line }.
 */
function extractLinks(filePath) {
  const html = readFileSync(filePath, "utf-8");
  const links = [];
  const re = /\b(?:href|src)\s*=\s*["']([^"']*?)["']/gi;

  // Precompute line start offsets for O(log n) line lookups
  const lineOffsets = [0];
  for (let i = 0; i < html.length; i++) {
    if (html[i] === "\n") lineOffsets.push(i + 1);
  }
  function offsetToLine(offset) {
    let lo = 0, hi = lineOffsets.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineOffsets[mid] <= offset) lo = mid; else hi = mid - 1;
    }
    return lo + 1;
  }

  // Build ranges of <script>...</script> to skip JS href assignments
  const scriptRanges = [];
  const scriptRe = /<script[\s>]/gi;
  const scriptEndRe = /<\/script>/gi;
  let sm;
  while ((sm = scriptRe.exec(html)) !== null) {
    scriptEndRe.lastIndex = sm.index;
    const em = scriptEndRe.exec(html);
    if (em) scriptRanges.push([sm.index, em.index + em[0].length]);
  }
  function insideScript(offset) {
    return scriptRanges.some(([s, e]) => offset >= s && offset < e);
  }

  let m;
  while ((m = re.exec(html)) !== null) {
    if (insideScript(m.index)) continue;
    const url = m[1].trim();
    if (url) links.push({ url, line: offsetToLine(m.index) });
  }
  return links;
}

/** Check external URL reachability via fetch. */
const externalCache = new Map();
async function checkExternalUrl(url) {
  if (externalCache.has(url)) return externalCache.get(url);

  try {
    const hostname = new URL(url).hostname;
    if (SKIP_EXTERNAL_DOMAINS.includes(hostname)) {
      const result = { ok: true, reason: "skipped (trusted domain)" };
      externalCache.set(url, result);
      return result;
    }
    if (BLOCKED_EXTERNAL_HOSTS.some((re) => re.test(hostname))) {
      const result = { ok: false, reason: "blocked (private/internal address)" };
      externalCache.set(url, result);
      return result;
    }
  } catch {
    const result = { ok: false, reason: "invalid URL" };
    externalCache.set(url, result);
    return result;
  }

  try {
    let resp = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": "F1R3FLY-LinkChecker/1.0" },
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
    });

    if (resp.status === 405 || resp.status === 403) {
      resp = await fetch(url, {
        method: "GET",
        headers: { "User-Agent": "F1R3FLY-LinkChecker/1.0" },
        signal: AbortSignal.timeout(10_000),
        redirect: "follow",
      });
    }

    const result = resp.status < 400
      ? { ok: true, reason: `HTTP ${resp.status}` }
      : { ok: false, reason: `HTTP ${resp.status}` };
    externalCache.set(url, result);
    return result;
  } catch (err) {
    const result = { ok: false, reason: err.message || String(err) };
    externalCache.set(url, result);
    return result;
  }
}

async function main() {
  const htmlFiles = findHtmlFiles(SITE_ROOT);
  console.log(`Scanning ${htmlFiles.length} HTML files in ${SITE_ROOT}...\n`);

  // Pre-cache all IDs
  for (const file of htmlFiles) getIds(file);

  const broken = [];
  let totalLinks = 0;

  for (const file of htmlFiles) {
    const rel = relative(SITE_ROOT, file);
    const links = extractLinks(file);
    totalLinks += links.length;

    if (VERBOSE && links.length > 0) {
      console.log(`\n${rel} (${links.length} links)`);
    }

    for (const { url, line } of links) {
      // Skip special schemes
      if (SKIP_SCHEMES.some((s) => url.startsWith(s))) continue;

      // External link
      if (url.startsWith("http://") || url.startsWith("https://")) {
        if (CHECK_EXTERNAL) {
          const result = await checkExternalUrl(url);
          if (result.ok) {
            if (VERBOSE) console.log(`  OK  ${url} (${result.reason})`);
          } else {
            broken.push({ file, line, url, reason: result.reason });
          }
        } else if (VERBOSE) {
          console.log(`  SKIP (external) ${url}`);
        }
        continue;
      }

      // Protocol-relative
      if (url.startsWith("//")) {
        if (CHECK_EXTERNAL) {
          const result = await checkExternalUrl(`https:${url}`);
          if (!result.ok) broken.push({ file, line, url, reason: result.reason });
        }
        continue;
      }

      // Split into path and fragment
      const hashIdx = url.indexOf("#");
      const localPath = (hashIdx >= 0 ? url.slice(0, hashIdx) : url).split("?")[0];
      const fragment = hashIdx >= 0 ? url.slice(hashIdx + 1) : null;

      // Pure anchor (#something) — check within same file
      if (!localPath && fragment) {
        const ids = getIds(file);
        if (ids.has(fragment)) {
          if (VERBOSE) console.log(`  OK  ${url} (anchor exists)`);
        } else {
          broken.push({ file, line, url, reason: `anchor '#${fragment}' not found in file` });
        }
        continue;
      }

      // Resolve to filesystem path (directories resolve to index.html)
      let target = resolve(dirname(file), localPath);

      if (existsSync(target) && statSync(target).isDirectory()) {
        const indexPath = join(target, "index.html");
        if (existsSync(indexPath)) {
          target = indexPath;
        } else {
          broken.push({ file, line, url, reason: `directory missing index.html: ${relative(SITE_ROOT, target)}/` });
          continue;
        }
      }

      if (!existsSync(target)) {
        broken.push({ file, line, url, reason: `file not found: ${relative(SITE_ROOT, target)}` });
        continue;
      }

      if (VERBOSE) console.log(`  OK  ${url} (file exists)`);

      // Check fragment in target file
      if (fragment) {
        const targetIds = getIds(target);
        if (targetIds.has(fragment)) {
          if (VERBOSE) console.log(`  OK  ${url} (anchor exists)`);
        } else {
          broken.push({
            file, line, url,
            reason: `anchor '#${fragment}' not found in ${relative(SITE_ROOT, target)}`,
          });
        }
      }
    }
  }

  // Report
  console.log();
  if (broken.length > 0) {
    console.log("============================================================");
    console.log(`BROKEN LINKS FOUND: ${broken.length}`);
    console.log("============================================================");
    for (const { file, line, url, reason } of broken) {
      console.log(`\n  ${relative(SITE_ROOT, file)}:${line}`);
      console.log(`    Link:   ${url}`);
      console.log(`    Reason: ${reason}`);
    }
    console.log();
    process.exit(1);
  } else {
    console.log(`All links OK (${totalLinks} links checked across ${htmlFiles.length} files)`);
  }
}

main();
