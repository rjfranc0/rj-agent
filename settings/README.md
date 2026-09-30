# Enforcement: settings and hooks

`behaviors/core` is context — Claude reads it and usually follows it, but nothing guarantees it. The rules where one miss is one too many live here instead, enforced by Claude Code itself: permission rules, a hook, and git config. They apply to the main session and to every subagent.

lore doesn't install these. Set them up once per machine.

## What's enforced where

| Rule | Mechanism | Why there |
|---|---|---|
| Never read secret files (`.env*`, keys, `~/.ssh`, `~/.aws`) | `deny` Read rules | Blocks the file tools in every permission mode |
| …or through Bash (`cat .env`, `grep … .env.local`) | `guard.mjs` hook → deny | Read rules don't cover Bash subprocesses |
| Never skip git hooks (`--no-verify`, `commit -n`) | `guard.mjs` hook → deny | The flag can sit anywhere in the command; patterns can't catch that |
| Commit and push only when asked | `ask` rules | You approve each one; a subagent trying to commit surfaces a prompt you deny |
| Confirm destructive ops (`rm -r`, `reset --hard`, `rebase`, branch switch/create/delete) | `ask` rules | Allowed, never silent |
| Confirm anything leaving the machine (`ssh`, `scp`, `docker push`) | `ask` rules | Remote effects are yours to trigger |
| Confirm destructive SQL (`DROP`, `TRUNCATE`, `DELETE` without `WHERE`) | `guard.mjs` hook → ask | SQL sits inside quoted arguments |
| Signed commits | `git config` | Git does it on every commit, no rule needed |

Everything else — scope, verification, style, commit format — stays prose in `behaviors/core`.

## Install

Requires Node (the hook has no dependencies).

1. Copy the hook:
   ```bash
   mkdir -p ~/.claude/hooks && cp settings/hooks/guard.mjs ~/.claude/hooks/
   ```
2. Merge `settings/settings.json` into `~/.claude/settings.json` — add its `permissions.deny`, `permissions.ask`, and `hooks.PreToolUse` entries to what's already there. Don't overwrite the file.
3. Sign commits:
   ```bash
   git config --global commit.gpgsign true
   ```

## Check it works

1. The hook alone:
   ```bash
   echo '{"tool_input":{"command":"git commit -n -m x"}}' | node ~/.claude/hooks/guard.mjs; echo "exit $?"
   ```
   Expect `Blocked by guard hook…` and `exit 2`.
2. In a session, run `/permissions` — the deny and ask rules should be listed with `~/.claude/settings.json` as their source.
3. Ask Claude to read a `.env` file, then to `cat` it. Both should be blocked.
4. Ask Claude to run `psql -c "DROP TABLE test"` in a scratch project. You should get a permission prompt, not a silent run.

## Limits

- Patterns are best effort. `git -C path commit` doesn't match `Bash(git commit *)`. The prose rules in `behaviors/core` cover what patterns miss.
- The hook fails open: if Node is missing or the input can't be parsed, it allows the command. That's deliberate — a broken hook shouldn't freeze every Bash call — but check step 1 after any machine setup.
- `.env.example` stays readable on purpose: it documents variable names without values.
- Background subagents surface their permission prompts in your main session. An `ask` rule pauses that subagent until you answer.
- If Claude Code's built-in git guidance ever competes with the Git rules in `behaviors/core`, set `"includeGitInstructions": false`. Trade-off: subagents also lose the git status snapshot they get at startup.
