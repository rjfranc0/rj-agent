# rj-codex

Runs one pipeline station on Codex. Packet on stdin, `codex exec` in the current repo, short envelope on stdout. atlas calls it directly with Bash.

```
atlas ──Bash──▶ rj-codex run <station> ──▶ codex exec
atlas ──Agent─▶ aurora-design / corpus   (Claude subagents)
```

## Setup

1. **Dependencies:** `codex` (logged in), `git`, `jq`, `timeout` (coreutils).
2. **PATH:** `ln -s "$PWD/bin/rj-codex" ~/.local/bin/rj-codex`.
3. **Claude Code settings:** see [Settings](#settings).
4. **Check the CLI:** `codex exec --help` should list `--model`, `-c`, `--sandbox`, `--add-dir`, `--json`, `-o`, and stdin via `-`.
5. **Check discovery:** `echo "List the skills you can see" | codex exec -` should show `~/.agents/skills`.

## Settings

In `~/.claude/settings.json` (merge with what's there):

```json
{
  "env": { "BASH_MAX_TIMEOUT_MS": "6000000" },
  "permissions": {
    "allow": [
      "Bash(rj-codex run:*)",
      "Bash(rj-codex ctx:*)",
      "Bash(git diff:*)",
      "Bash(git status:*)"
    ]
  }
}
```

`BASH_MAX_TIMEOUT_MS` must stay above atlas's Bash timeout (95 min). The allowlist lets atlas dispatch without prompts; any other command still asks you.

## Stations

Set in `config_for()`:

| Station | Model / effort | Sandbox | Guard |
|---|---|---|---|
| `hugo` | Sol 6.1 / xhigh | full access | — |
| `ferran` | Sol 6.1 / xhigh | workspace-write | — |
| `vera`, `aurora`, `silas` | Sol 6.1 / high | workspace-write | — |
| `tessa` | Sol 6.1 / high | full access | test paths only |
| `argus` | Astra 6 / high | read-only | any change |

Workspace-write stations also get the pnpm dirs as writable (`--add-dir`), so `pnpm <script>` works.

| Variable | Default | Purpose |
|---|---|---|
| `RJ_CODEX_TIMEOUT` | `90m` | Hard limit per run |
| `RJ_CODEX_ADD_DIRS` | pnpm store, cache, state | Extra writable dirs |
| `RJ_SKILLS_DIR` | `~/.agents/skills` | Where skills live |
| `RJ_AGENTS_DIR` | `~/.claude/agents` | Where the station agent files live |

## Commands

**`rj-codex ctx <ISSUE-ID>`** — stores the issue context from stdin in `.git/rj-codex/ctx/<ID>.md` and prints the path. atlas runs it once per invocation; packets point to the file.

**`rj-codex run <station>`** — runs the station. Codex receives `mission.md`:

1. The body of `agents/<station>.md` (role).
2. A pointer to the skill in its `skills:` frontmatter.
3. Execution rules (no git writes, no installs, this repo only), then the packet.

## Envelope

Exit code 0 once a run starts; the outcome is in the envelope:

```
status=done
reason=ok
station=hugo
job=/repo/.git/rj-codex/20261021-141403-4242-hugo
thread=<codex thread id>
changed=3
result=/repo/.git/rj-codex/20261021-141403-4242-hugo/result.md
```

| `status` | `reason` | Meaning |
|---|---|---|
| `done` | `ok` / `no_changes` | Output in `result=` |
| `failed` | `empty_packet` | Nothing on stdin |
| `failed` | `codex_exit_<n>` | Codex crashed or refused; see `stderr.log` |
| `failed` | `no_result` | No final message |
| `failed` | `scope_violation(...)` | Files changed outside the station's guard |
| `cancelled` | `timeout_<t>` | Hit the timeout; partial changes stay |

`done` says nothing about Pass/Fail; the verdict is in `result.md`. Usage errors exit 2.

## Guarantees

- **Never commits.** No git writes, and the script makes none.
- **Your index is untouched.** Change detection uses a throwaway index in the job dir.
- **Only this run's changes count.** Earlier uncommitted work isn't attributed to it.

## Job directory

`.git/rj-codex/<timestamp>-<pid>-<station>/`, inside `.git` so it's never committed.

| File | Content |
|---|---|
| `mission.md` | Exactly what Codex received |
| `result.md` | The station output |
| `events.jsonl` | Raw Codex event stream |
| `stderr.log` | Codex stderr |
| `changed.txt` | Files this run changed (atlas uses it to scope argus re-checks) |
| `scope_violation.txt` | Only on a guard violation |

Clean up whenever: `rm -rf .git/rj-codex`.

## Adding a station

1. Add a case to `config_for()`.
2. Add it to the Calling table in `skills/atlas/rules/dispatch.md`.

## Troubleshooting

| Symptom | Check |
|---|---|
| Bash call killed early | `BASH_MAX_TIMEOUT_MS` below 6000000 |
| `codex_exit_*` right away | `stderr.log`: login, flag syntax, model name |
| Codex ignores role rules | `mission.md`: role body and skill path present? |
| `pnpm` lock / EPERM errors | Missing `--add-dir` for a pnpm dir; set `RJ_CODEX_ADD_DIRS` |
| `listen EPERM` / `spawnSync EPERM` | Station needs full access; change its sandbox in `config_for()` |
| Continue a stopped run by hand | `codex exec resume <thread> -` |
