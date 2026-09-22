#!/usr/bin/env node
/**
 * PreToolUse hook: block WRITES to secrets, credentials, and agent infrastructure.
 *
 * Shell-command guarding lives in guard-shell.mjs. This script covers the other
 * half: file-write tools (edit / create / apply-patch). Reads the hook payload
 * from stdin and returns a permissionDecision for any write whose target path
 * matches a protected pattern. Secrets are denied outright; control-plane files
 * (agent definitions, hooks, MCP config) prompt for confirmation instead, so a
 * human can still authorise deliberate changes.
 *
 * Read-only tools are gated against the DENY list only. Reading a secret pulls
 * it into the model context and the session transcript, which is a real leak,
 * so that stays blocked. The ASK list is write-only: prompting on every read of
 * an agent file is constant friction that prevents nothing.
 *
 * Anything not matched falls through with no output (normal permission flow).
 */

// Tool names that mutate files. Matched case-insensitively against the payload
// tool name. Read/search/list tools deliberately match none of these.
const WRITE_TOOL =
  /(edit|write|create|insert|patch|replace|append|delete|remove|rename|move|notebook)/i;
const READ_TOOL = /(read|search|list|find|grep|fetch|view|get_errors|usages)/i;

// Basename-anchored so a path merely CONTAINING a scary word does not trip the
// guard. `src/utils/tokenize.ts` is not a secret; `github-token.json` is.
const DENY = [
  {
    re: /(^|[\\/])\.env(\.|$)/i,
    why: 'Environment files hold secrets and must be edited by a human.',
  },
  { re: /\.(pem|p12|pfx|keystore|jks)$/i, why: 'Key material must never be written by an agent.' },
  { re: /(^|[\\/])[^\\/]*\.key$/i, why: 'Key material must never be written by an agent.' },
  {
    re: /(^|[\\/])(id_rsa|id_ed25519|id_ecdsa)/i,
    why: 'SSH private keys must never be written by an agent.',
  },
  { re: /(^|[\\/])\.ssh[\\/]/i, why: 'SSH configuration is out of bounds.' },
  { re: /(^|[\\/])\.aws[\\/]/i, why: 'Cloud credentials are out of bounds.' },
  {
    re: /(^|[\\/])[^\\/]*credentials?[^\\/]*\.(json|ya?ml|txt|ini|cfg|env)$/i,
    why: 'Credential files must be edited by a human.',
  },
  {
    re: /(^|[\\/])[^\\/]*(secrets?|api[-_.]?keys?|[-_.]tokens?)[^\\/]*\.(json|ya?ml|txt|ini|cfg|env|pem)$/i,
    why: 'File looks like it holds a secret. Human edit required.',
  },
  {
    re: /(^|[\\/])\.git[\\/](config|hooks[\\/])/i,
    why: 'Git internals must not be rewritten by an agent.',
  },
];

// Control plane: a human should confirm, but it is not forbidden.
const ASK = [
  {
    re: /(^|[\\/])\.github[\\/](agents|hooks)[\\/]/i,
    why: 'This is the agent control plane. Confirm the change is intended.',
  },
  {
    re: /(^|[\\/])\.vscode[\\/]mcp\.json$/i,
    why: 'This is the MCP server configuration. Confirm the change is intended.',
  },
  // Claude-side mirror. Scoped to the generated subtrees rather than all of
  // `.claude/` so this does not fire on the per-user memory store that lives
  // under ~/.claude/projects/.
  {
    re: /(^|[\\/])\.claude[\\/](agents|skills)[\\/]/i,
    why: 'Generated from .github/. Edit the source there and run `pnpm agents:sync` — a hand edit here is overwritten on the next sync.',
  },
  {
    re: /(^|[\\/])\.claude[\\/]settings(\.local)?\.json$/i,
    why: 'This is the Claude hook registration. Confirm the change is intended.',
  },
  {
    re: /(^|[\\/])\.mcp\.json$/i,
    why: 'This is the MCP server configuration. Confirm the change is intended.',
  },
];

function collectPaths(input) {
  const keys = ['filePath', 'file_path', 'path', 'uri', 'target', 'targetFile', 'file'];
  const found = [];
  for (const key of keys) {
    const value = input?.[key];
    if (typeof value === 'string' && value.trim()) found.push(value);
  }
  const list = input?.files ?? input?.edits ?? input?.replacements;
  if (Array.isArray(list)) {
    for (const entry of list) {
      if (typeof entry === 'string') found.push(entry);
      else if (entry && typeof entry === 'object') found.push(...collectPaths(entry));
    }
  }
  return found;
}

// Payload key names vary. If the tool name is missing we fall back to sniffing
// the input for content-bearing keys, so the guard fails closed on real writes
// rather than silently disabling itself.
function isWrite(toolName, input) {
  if (toolName) {
    if (READ_TOOL.test(toolName) && !WRITE_TOOL.test(toolName)) return false;
    return WRITE_TOOL.test(toolName);
  }
  const contentKeys = [
    'content',
    'newString',
    'new_string',
    'newText',
    'text',
    'edits',
    'replacements',
    'patch',
  ];
  return contentKeys.some((k) => input?.[k] !== undefined);
}

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

  const toolName = String(payload.tool_name ?? payload.toolName ?? payload.tool ?? '');
  if (/terminal|shell|bash|execute|run_in/i.test(toolName)) process.exit(0);

  const input = payload.tool_input ?? payload.toolInput ?? payload.input ?? {};
  const paths = collectPaths(input);
  if (paths.length === 0) process.exit(0);

  // Secrets are blocked for reads AND writes — reading one leaks it into context.
  for (const path of paths) {
    for (const rule of DENY) {
      if (rule.re.test(path)) {
        emit('deny', `Blocked access to "${path}". ${rule.why}`);
      }
    }
  }

  // Control-plane confirmation applies to writes only.
  if (!isWrite(toolName, input)) process.exit(0);

  for (const path of paths) {
    for (const rule of ASK) {
      if (rule.re.test(path)) {
        emit('ask', `Write to "${path}". ${rule.why}`);
      }
    }
  }
  process.exit(0);
});

function emit(permissionDecision, permissionDecisionReason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision,
        permissionDecisionReason: `[agentic-guard] ${permissionDecisionReason}`,
      },
    }),
  );
  process.exit(0);
}
