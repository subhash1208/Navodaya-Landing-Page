#!/usr/bin/env node
/**
 * PreToolUse hook: gate destructive or bypass-style shell commands.
 *
 * Reads the hook payload from stdin, inspects any shell command the agent is
 * about to run, and returns a permissionDecision of "deny" or "ask".
 * Anything not matched falls through with no output (normal permission flow).
 */

const DENY = [
  {
    re: /\bgit\s+push\b[^\n]*--force(?!-with-lease)/i,
    why: 'Force push can destroy remote history. Use --force-with-lease and run it yourself.',
  },
  { re: /\bgit\s+reset\s+--hard\b/i, why: 'Hard reset discards uncommitted work irreversibly.' },
  {
    re: /\bgit\s+clean\s+-[a-z]*f/i,
    why: 'git clean -f deletes untracked files, which may be in-progress work.',
  },
  { re: /--no-verify\b/i, why: 'Bypassing git hooks defeats the quality gates.' },
  { re: /\brm\s+-[a-z]*r[a-z]*f/i, why: 'Recursive force delete is irreversible.' },
  {
    re: /\bRemove-Item\b[^\n]*-Recurse[^\n]*-Force/i,
    why: 'Recursive force delete is irreversible.',
  },
  { re: /\bnpm\s+publish\b/i, why: 'Publishing is a release action requiring human approval.' },
  { re: /\b(vercel|netlify)\s+(deploy|--prod)/i, why: 'Deployment requires human approval.' },
  { re: /\bDROP\s+(TABLE|DATABASE|SCHEMA)\b/i, why: 'Destructive schema operation.' },
  // Native `deny` rules cover Read/Edit/Write on secret paths, but they cannot
  // see inside a shell command -- `cat .env` is a Bash call, not a Read. This is
  // the one place that gap can be closed, so it is closed here.
  // `.env.example` is deliberately still allowed: the negative lookahead lets a
  // committed template through while blocking `.env`, `.env.local`, `.env.prod`.
  {
    re: /\b(cat|type|more|less|head|tail|nl|strings|Get-Content|gc)\b[^\n|;&]*\.env(?!\.example\b|\.sample\b|\.template\b)/i,
    why: 'Reading an environment file through the shell leaks its contents into the transcript. Native deny rules cannot see inside a shell command, so it is blocked here.',
  },
  {
    re: /\b(cat|type|more|less|head|tail|strings|Get-Content|gc)\b[^\n|;&]*(id_rsa|id_ed25519|id_ecdsa|\.pem\b|\.p12\b|\.pfx\b)/i,
    why: 'Reading key material through the shell leaks it into the transcript.',
  },
];

const ASK = [
  { re: /\bgit\s+push\b/i, why: 'Pushing publishes work. Confirm before proceeding.' },
  { re: /\bgit\s+commit\b/i, why: 'Confirm the commit is intended.' },
  {
    re: /\bnpm\s+(install|i|uninstall|remove)\s+\S/i,
    why: 'Adds or removes a dependency — confirm it is justified.',
  },
  {
    re: /\bnpx\s+playwright\s+test[^\n]*--update-snapshots/i,
    why: 'Regenerating visual snapshots should be deliberate.',
  },
];

function decide(command) {
  for (const rule of DENY) if (rule.re.test(command)) return ['deny', rule.why];
  for (const rule of ASK) if (rule.re.test(command)) return ['ask', rule.why];
  return null;
}

let raw = '';
process.stdin.setEncoding('utf8');

// Watchdog. Under `cmd /c` on Windows the parent's stdin handle is not always
// closed for the child, so the `end` event below can simply never fire -- node
// blocks forever, cmd.exe waits on node, and the console window cmd allocated
// stays on the user's desktop until it is killed by hand. The registered hook
// `timeout` did not reap these. Exiting 0 means "no decision", which is the same
// thing this hook returns for any command it does not recognise, so failing open
// after a few seconds costs nothing that hanging would have saved.
const watchdog = setTimeout(() => process.exit(0), 3000);
watchdog.unref?.();

process.stdin.on('data', (chunk) => {
  raw += chunk;
});
process.stdin.on('error', () => process.exit(0));
process.stdin.on('end', () => {
  clearTimeout(watchdog);
  let payload = {};
  try {
    payload = JSON.parse(raw || '{}');
  } catch {
    process.exit(0);
  }

  const input = payload.tool_input ?? payload.toolInput ?? payload.input ?? {};
  const command = String(input.command ?? input.commandLine ?? '');
  if (!command.trim()) process.exit(0);

  const verdict = decide(command);
  if (!verdict) process.exit(0);

  const [permissionDecision, reason] = verdict;
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision,
        permissionDecisionReason: `[agentic-guard] ${reason}`,
      },
    }),
  );
  process.exit(0);
});
