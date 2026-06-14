# Scripts — Bash + Bats

Always loaded when writing or testing your own scripts (deploy scripts, CI helper scripts, validation scripts). This is your only domain where you're both author and tester — infra scripts aren't covered by the project's product-code test strategy.

## Defensive bash baseline

Every script starts with:

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'
```

- `set -e` — exit on error, don't continue past a failed command.
- `set -u` — error on unset variables, catches typos.
- `set -o pipefail` — a pipeline fails if any stage fails, not just the last.
- Quote all expansions: `"$var"`, `"${array[@]}"`.
- Check command existence before use: `command -v docker >/dev/null || { echo "docker not found" >&2; exit 1; }`.
- No silent fallbacks — don't `|| true` away real errors. Only use it where a non-zero exit is genuinely expected and handled, with a comment explaining why.

## Testing with bats

A deploy script gets a `.bats` test when it has non-trivial logic (branching, parsing, validation) — not for a thin wrapper that just runs commands in order.

```bash
#!/usr/bin/env bats

setup() {
  load 'test_helper/bats-support/load'
  load 'test_helper/bats-assert/load'
}

@test "rejects empty image tag" {
  run ./deploy.sh ""
  assert_failure
  assert_output --partial "tag required"
}
```

Run via `bats tests/` — part of your local validation, never the VPS.

### Scripts that touch the filesystem

A script that creates, moves, or deletes real files (deploy scripts writing to `/opt/<app>`, log rotation, backup scripts) must take its target paths as arguments or env vars — never hardcode `/opt/<app>` or similar. This isn't just testability: it's what makes the local-execution boundary enforceable. A script that can't know the prod path at test time can't accidentally touch it.

For the test, point those same variables at `$BATS_TEST_TMPDIR` — bats creates and cleans this directory per-test automatically, no manual setup/teardown needed:

```bash
@test "deploy script writes compose file to target dir" {
  run ./write-compose.sh "$BATS_TEST_TMPDIR"
  assert_success
  assert [ -f "$BATS_TEST_TMPDIR/docker-compose.yml" ]
}
```

## Scope note

This covers your own scripts. A request to write defensive bash or bats tests for *application* code (e.g. a CLI that's part of the product) is out of scope — flag it rather than absorbing it here.

*Stub — expand with more patterns (trap-based cleanup, logging conventions, argument parsing) as real scripts surface the need.*
