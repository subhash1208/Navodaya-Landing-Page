#!/usr/bin/env node
/**
 * PostToolUse hook: after a source file is edited, remind the agent which
 * quality gate applies. Deterministic nudge — instructions are guidance,
 * this fires every time.
 */

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  raw += chunk;
});
process.stdin.on('end', () => {
  let payload = {};
  try {
    payload = JSON.parse(raw || '{}');
  } catch {
    process.exit(0);
  }

  const input = payload.tool_input ?? payload.toolInput ?? payload.input ?? {};
  // `file_path` first: that is the snake_case key Claude's Edit/Write tools
  // use. Without it this hook silently never fires there, which looks exactly
  // like "the gates are wired up" while reminding nobody of anything.
  const path = String(input.file_path ?? input.filePath ?? input.path ?? input.file ?? '').replace(
    /\\/g,
    '/',
  );
  if (!path) process.exit(0);

  const messages = [];

  if (/\.(ts|tsx|mts)$/.test(path)) {
    messages.push('`pnpm exec tsc --noEmit` and `pnpm lint` must pass before handoff.');
  }
  if (/src\/(components|hooks|app)\//.test(path) && !/__tests__/.test(path)) {
    messages.push('Changed source under src/ — `pnpm test` must pass; new behavior needs a test.');
  }
  if (/__tests__\/|e2e\//.test(path)) {
    messages.push('Test file changed — run it now; never hand off an unrun test.');
  }
  if (/next\.config|tailwind\.config|tsconfig|eslint\.config/.test(path)) {
    messages.push('Build config changed — `pnpm build` must be re-verified.');
  }

  if (!messages.length) process.exit(0);

  process.stdout.write(
    JSON.stringify({
      systemMessage: `[quality-gates] ${messages.join(' ')}`,
    }),
  );
  process.exit(0);
});
