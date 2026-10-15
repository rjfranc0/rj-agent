# rj-codex

Runs one pipeline station on Codex instead of Claude. Takes a task packet on stdin, runs `codex exec`, prints a short envelope on stdout.

It exists to move procedural stations off the Claude quota while keeping the pipeline unchanged: same packets, same role text, same output format, nothing committed.

## How it fits

```
mix:         atlas ──Agent──▶ <station>-codex (Haiku relay) ──Bash──▶ rj-codex ──▶ codex exec
full Claude: atlas ──Agent──▶ <station> (Claude agent, as before)
```

- `atlas` picks the relay or the Claude agent per invocation. `mix` is the default; say "full Claude" to skip Codex.
- The relay (`agents/<station>-codex.md`) only pipes its prompt into `rj-codex` and returns the envelope.
- `atlas` reads the `result=` file and posts it like any station output.

| Station | `mix` | `full Claude` |
|---|---|---|
| `aurora`, `vera`, `tessa`, `corpus` | Codex (Sol 6.1 / high) | their Claude agent |
| everything else | its Claude agent | its Claude agent |

## Setup

1. **Dependencies:** `codex` (logged in), `git`, `jq`, `timeout` (coreutils).
2. **PATH:** `ln -s "$PWD/bin/rj-codex" ~/.local/bin/rj-codex` (any dir on your PATH).
3. **Claude Code settings:** raise the Bash cap, or the relay gets killed after 10 min:
   ```json
   { "env": { "BASH_MAX_TIMEOUT_MS": "3000000" } }
   ```
4. **Check the CLI:** `codex exec --help`. The script assumes `--model`, `-c key=value`, `--sandbox`, `--json`, `-o <file>` and the prompt on stdin via `-`. Adjust the `codex exec` call if your version differs.
5. **Check discovery:** `echo "List the skills you can see and summarize your global instructions" | codex exec -` should show `~/.agents/AGENTS.md` and `~/.agents/skills`.
6. **Prepare the repo:** run `pnpm install` (or equivalent) before the workflow. The sandbox has no network.

## Configuration

All optional, via environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `RJ_CODEX_MODEL` | `gpt-6.1-sol` | Codex model |
| `RJ_CODEX_EFFORT` | `high` | Reasoning effort |
| `RJ_CODEX_TIMEOUT` | `45m` | Hard limit per run (keep it under the relay's 47 min Bash timeout) |
| `RJ_SKILLS_DIR` | `~/.agents/skills` | Where skills live |
| `RJ_AGENTS_DIR` | `~/.claude/agents` | Where the Claude station agents live |

## Usage

Normally you never call it yourself. `atlas` dispatches the relay, the relay calls the script.

Manual run, from inside the target repo:

```bash
echo "Mode: docs Update. Scope: last change. Return your full output as your final message." \
  | rj-codex run corpus
```

### What Codex receives

`mission.md` is built from three parts, so Codex gets the same thing a Claude station gets:

1. The body of `agents/<station>.md` (role and boundaries).
2. A pointer to the skill named in its `skills:` frontmatter.
3. Execution rules (no git writes, no network, report blockers), then the packet, verbatim.

### Envelope

Always exit code 0 once a run starts; the outcome is in the envelope:

```
status=done
reason=ok
station=tessa
job=/repo/.git/rj-codex/20261015-141403-4242-tessa
thread=<codex thread id>
changed=3
result=/repo/.git/rj-codex/20261015-141403-4242-tessa/result.md
```

| `status` | `reason` | Meaning |
|---|---|---|
| `done` | `ok` | Ran, changed files, output in `result=` |
| `done` | `no_changes` | Ran, touched nothing (normal for reviews or "nothing to update") |
| `failed` | `empty_packet` | Nothing on stdin |
| `failed` | `codex_exit_<n>` | Codex crashed or refused; see `stderr.log` |
| `failed` | `no_result` | Codex exited without a final message |
| `failed` | `scope_violation(...)` | Files changed outside the station's allowed paths |
| `cancelled` | `timeout_<t>` | Hit `RJ_CODEX_TIMEOUT`; partial changes stay in place |

`done` says nothing about Pass/Fail. The verdict is in `result.md`, in the station's own format.

Usage errors (unknown station, missing agent file or skill, missing dependency) exit with code 2 and a message on stderr.

## Guarantees

- **Never commits.** Codex is told not to write git, the sandbox blocks `.git`, and the script makes no commits. Everything waits for your final review.
- **Your index is untouched.** Change detection snapshots the working tree into a throwaway index under the job dir.
- **Only this run's changes are counted.** Changes left uncommitted by earlier stations are not attributed to Codex.

## Scope guards

A tripwire, not a lock: on violation, changes stay on disk and the run reports `failed`.

| Station | Allowed paths |
|---|---|
| `tessa` | `tests/`, plus `*.rs` for in-file `#[cfg(test)]` |
| `corpus` | `docs/`, any `AGENTS.md`, any `README.md` |
| `aurora`, `vera` | no guard |

Violations are listed in `<job>/scope_violation.txt`.

## Job directory

Each run gets `.git/rj-codex/<timestamp>-<pid>-<station>/`. It lives inside `.git`, so it is never committed and needs no `.gitignore` entry.

| File | Content |
|---|---|
| `mission.md` | Exactly what Codex received |
| `result.md` | Codex's final message, the station output |
| `events.jsonl` | Raw Codex event stream |
| `stderr.log` | Codex stderr |
| `changed.txt` | Files changed by this run |
| `scope_violation.txt` | Only on a guard violation |
| `index` | Throwaway index used for snapshots |

Clean up whenever: `rm -rf .git/rj-codex`.

## Adding a station

1. Add a case to `guard_for()` in `rj-codex` (an empty string means no guard).
2. Copy any `agents/*-codex.md` relay, rename it and change the station in its command.
3. Add the row to the Executor routing table in `skills/atlas/rules/dispatch.md`.

## Troubleshooting

| Symptom | Check |
|---|---|
| Relay killed around 10 min | `BASH_MAX_TIMEOUT_MS` missing from settings |
| `codex_exit_*` right away | `stderr.log`: login, flag syntax, model name |
| Codex ignores role rules | `mission.md`: role body and skill path present? `RJ_AGENTS_DIR` correct? |
| Tests fail with connection errors | Sandbox blocks localhost/network for that project. Run that station in full Claude, or allow network in the Codex sandbox config |
| Install or fetch errors | Dependencies weren't installed before the run |
| Need to continue a stopped run by hand | `codex exec resume <thread> -` with the `thread=` id |
