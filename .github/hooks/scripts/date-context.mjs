#!/usr/bin/env node
/**
 * UserPromptSubmit hook: inject the real current date/time.
 *
 * Models have a training cutoff and will otherwise assume a stale "today",
 * which poisons web searches ("latest Next.js") and any date-relative
 * reasoning. Emitting the real UTC timestamp as additional context fixes that.
 */

const now = new Date();
const iso = now.toISOString().replace(/\.\d{3}Z$/, 'Z');
const weekday = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext:
        `Current date/time: ${weekday}, ${iso}. ` +
        'Use this for any date-relative reasoning. When searching the web for ' +
        'library or framework information, restrict results to the last 12-18 ' +
        'months relative to this date rather than assuming your training cutoff.',
    },
  }),
);
