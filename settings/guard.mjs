#!/usr/bin/env node
// PreToolUse guard for Bash commands. Catches what permission patterns can't:
// flags anywhere in a command, secret-file reads through Bash, destructive SQL.
// Deny: exit 2, reason on stderr. Ask: permissionDecision JSON on stdout.

const SECRET_ENV = /^\.env(\.(local|development|production|test)|\.[\w-]+\.local)?$/;
const READERS = new Set([
  'cat', 'less', 'more', 'head', 'tail', 'grep', 'rg', 'awk', 'sed', 'cut',
  'source', '.', 'cp', 'mv', 'base64', 'xxd', 'od', 'strings', 'bat', 'diff',
]);

const deny = (reason) => {
  process.stderr.write(`Blocked by guard hook: ${reason}\n`);
  process.exit(2);
};

const ask = (reason) => {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason: reason,
    },
  }));
  process.exit(0);
};

const unquote = (token) => token.replace(/^['"]|['"]$/g, '');
const basename = (path) => path.split('/').pop();

function check(command) {
  const segments = command.split(/&&|\|\||[;|\n]/).map((s) => s.trim()).filter(Boolean);

  for (const segment of segments) {
    const tokens = segment.split(/\s+/).map(unquote);
    const tool = basename(tokens[0] ?? '');
    const args = tokens.slice(1);

    if (tool === 'git' && (args.includes('commit') || args.includes('push'))
        && (args.includes('--no-verify') || (args.includes('commit') && args.includes('-n')))) {
      deny('skipping git hooks (--no-verify / -n) is not allowed');
    }

    if (READERS.has(tool) && args.some((arg) => SECRET_ENV.test(basename(arg)))) {
      deny('reading secret env files through Bash is not allowed — reference variables by name');
    }
  }

  if (/\b(DROP\s+(TABLE|DATABASE|SCHEMA)|TRUNCATE)\b/i.test(command)
      || /\bDELETE\s+FROM\b(?![\s\S]*\bWHERE\b)/i.test(command)) {
    ask('destructive SQL (DROP / TRUNCATE / DELETE without WHERE)');
  }
}

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let command = '';
  try {
    command = JSON.parse(input)?.tool_input?.command ?? '';
  } catch {
    process.stderr.write('guard hook: could not parse hook input, allowing\n');
    process.exit(0);
  }
  check(command);
  process.exit(0);
});
