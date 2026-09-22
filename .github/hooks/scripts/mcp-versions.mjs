#!/usr/bin/env node
/**
 * Report when a newer MCP server version has shipped.
 *
 * The servers are deliberately PINNED: `.vscode/mcp.json` launches them by
 * absolute path out of a pnpm project at D:/mise/mcp-servers rather than by the
 * documented `npx -y <pkg>`, which re-resolves latest on every launch. Pinning
 * buys reproducibility, offline startup, and immunity to an upstream release
 * changing tool names under us -- the `sequentialthinking` vs
 * `sequential_thinking` trap would silently empty every agent's tool allowlist.
 *
 * The cost of pinning is silent staleness. This script is the compensating
 * control: it is the thing that makes "pinned" a decision rather than neglect.
 *
 * Usage:
 *   node mcp-versions.mjs            report, always hits the network
 *   node mcp-versions.mjs --check    exit 1 if any server is behind
 *   node mcp-versions.mjs --throttle only hit the network once a week
 *
 * Never fails the caller on a network error. A machine that is offline, or
 * behind a proxy, must still be able to run `pnpm agents:sync`.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const THROTTLE_MS = 7 * 24 * 60 * 60 * 1000;
const NETWORK_TIMEOUT_MS = 4000;

/**
 * Derive the installed package root from a server's launch command.
 *
 * Only a `node <absolute entry>` launcher has a pinned version to compare; a
 * server launched any other way -- npx, docker, a remote HTTP endpoint -- is
 * skipped rather than guessed at.
 *
 * The entry file is NOT assumed to be `dist/index.js`. It was until 2026-09-22,
 * and the cost showed up the day `tavily-mcp` was added: its entry is
 * `build/index.js`, so it failed the pattern, was reported as "skipped", and the
 * one server nobody had version history for became the one server this checker
 * did not watch. A silent skip in a drift checker is the same defect class as a
 * silent pass. Walk up from the entry to the nearest `package.json` instead --
 * that works for dist/, build/, lib/, or an entry at the package root.
 */
function packageRootFor(cfg) {
  if (cfg.command !== 'node' || !Array.isArray(cfg.args) || !cfg.args.length) return null;
  let dir = dirname(String(cfg.args[0]).replace(/\\/g, '/'));
  // Bounded: stop at the filesystem root, and never escape node_modules into
  // the parent project, whose package.json would report the wrong version.
  for (let i = 0; i < 6; i++) {
    if (existsSync(resolve(dir, 'package.json'))) return dir;
    const up = dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return null;
}

export function readInstalled() {
  const src = JSON.parse(readFileSync(join(ROOT, '.vscode', 'mcp.json'), 'utf8'));
  const out = [];

  for (const [server, cfg] of Object.entries(src.servers ?? {})) {
    const root = packageRootFor(cfg);
    if (!root) {
      out.push({ server, skipped: 'not a pinned `node <absolute entry>` launcher' });
      continue;
    }
    const manifest = resolve(root, 'package.json');
    if (!existsSync(manifest)) {
      out.push({ server, root, missing: true });
      continue;
    }
    const { name, version } = JSON.parse(readFileSync(manifest, 'utf8'));
    out.push({ server, root, name, version });
  }
  return out;
}

async function fetchLatest(name) {
  // AbortSignal.timeout rather than a bare fetch: the registry hanging must not
  // hang `pnpm agents:sync`, which developers run constantly.
  //
  // No `accept: application/vnd.npm.install-v1+json` here. That abbreviated
  // metadata format is only served for the full packument; on `/<pkg>/latest`
  // the registry answers **406 Not Acceptable**. Because a non-ok response maps
  // to null, and null across the board is read as "offline", sending it made
  // the checker permanently and silently blind -- reporting the network as down
  // on a machine that could reach the registry fine. Verified 2026-09-17.
  try {
    const res = await fetch(`https://registry.npmjs.org/${name}/latest`, {
      signal: AbortSignal.timeout(NETWORK_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return (await res.json()).version ?? null;
  } catch {
    return null;
  }
}

// The stamp lives beside the servers, not in the repo -- this is host-level
// tooling state and the repo should stay clean of it.
function stampPath(installed) {
  const anchor = installed.find((s) => s.root)?.root;
  return anchor ? resolve(anchor, '..', '..', '..', '.mcp-version-check.json') : null;
}

function throttled(installed) {
  const p = stampPath(installed);
  if (!p || !existsSync(p)) return false;
  try {
    const { checkedAt } = JSON.parse(readFileSync(p, 'utf8'));
    return Date.now() - new Date(checkedAt).getTime() < THROTTLE_MS;
  } catch {
    return false;
  }
}

function recordCheck(installed) {
  const p = stampPath(installed);
  if (!p) return;
  try {
    writeFileSync(p, JSON.stringify({ checkedAt: new Date().toISOString() }, null, 2) + '\n');
  } catch {
    /* a read-only tooling dir is not worth failing a sync over */
  }
}

/**
 * @returns {Promise<{behind: Array, offline: boolean, ran: boolean}>}
 */
export async function checkDrift({ throttle = false } = {}) {
  const installed = readInstalled();
  if (throttle && throttled(installed))
    return { behind: [], offline: false, ran: false, installed };

  const pinned = installed.filter((s) => s.name);
  const latest = await Promise.all(pinned.map((s) => fetchLatest(s.name)));
  pinned.forEach((s, i) => {
    s.latest = latest[i];
  });

  // Every lookup failing means the network is unavailable, not that everything
  // is current. Saying "up to date" there would be a lie, and worse, the stamp
  // would suppress the next real check for a week.
  const offline = pinned.length > 0 && latest.every((v) => v === null);
  if (!offline) recordCheck(installed);

  const behind = pinned.filter((s) => s.latest && s.latest !== s.version);

  return { behind, offline, ran: true, installed };
}

// Reported by `pnpm agents:sync`, so it has to be short and silent when there
// is nothing to say.
export function formatNotice({ behind, offline }) {
  if (offline) return null;
  if (!behind.length) return null;
  const list = behind.map((s) => `${s.name} ${s.version} -> ${s.latest}`).join(', ');
  return (
    `[mcp-versions] newer MCP server release(s) available: ${list}\n` +
    `              upgrade with: pnpm --dir D:/mise/mcp-servers up\n` +
    `              then re-verify tool names with: claude mcp list`
  );
}

// `pathToFileURL`, not a hand-built `file://${argv[1]}` string. On Windows the
// two do not match: import.meta.url is `file:///D:/...` with three slashes and
// a drive letter, and the naive form produces `file://D:/...` -- so the CLI
// block never runs and the script exits silently with status 0. That failure is
// invisible, which is the worst kind for a checker whose whole job is to speak up.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const CHECK = process.argv.includes('--check');
  const THROTTLE = process.argv.includes('--throttle');

  const result = await checkDrift({ throttle: THROTTLE });

  if (!result.ran) {
    console.log(
      '[mcp-versions] checked within the last 7 days — skipping. Run without --throttle to force.',
    );
    process.exit(0);
  }

  for (const s of result.installed) {
    if (s.skipped) {
      console.log(`${s.server.padEnd(22)} skipped — ${s.skipped}`);
    } else if (s.missing) {
      console.log(`${s.server.padEnd(22)} MISSING — no package.json at ${s.root}`);
    } else {
      // A failed lookup is `unknown`, never `up to date`. Reporting a silent
      // network failure as a clean bill of health is the exact drift this
      // script exists to surface.
      const status = !s.latest
        ? 'unknown (registry lookup failed)'
        : s.latest === s.version
          ? 'up to date'
          : `BEHIND — latest=${s.latest}`;
      console.log(`${s.server.padEnd(22)} ${s.name}  pinned=${s.version}  ${status}`);
    }
  }

  if (result.offline) {
    console.log('[mcp-versions] registry unreachable — version status unknown, nothing recorded.');
    process.exit(0);
  }

  const notice = formatNotice(result);
  if (notice) console.log('\n' + notice);

  process.exit(CHECK && result.behind.length ? 1 : 0);
}
