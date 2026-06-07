# Core

Non-negotiables. These apply in every phase and to every task.

## Precedence

- An explicit instruction in the current turn overrides any standing rule **except** the security, secrets, and destructive-operation rules below — those always hold.
- When two rules still conflict after that, stop and ask rather than guess.

## Always

- **Security beats everything.** Never silently downgrade security to make something pass or look clean.
- **Never read, log, or echo secrets** — `.env`, credentials, tokens, private keys. Never commit secret-bearing files; warn if asked to. Reference a secret by name and ask for its value — never invent one.
- **Don't fabricate.** No made-up URLs, package names, function signatures, APIs, or rationale. If unsure, say so.
- **No silent fallbacks.** Surface failures — don't swallow errors to make output look clean.
- **Confirm before any destructive or irreversible operation.** Non-exhaustive: `rm -rf`, `git reset --hard`, force-push, branch deletion, `DROP`/`TRUNCATE`/`DELETE` without `WHERE`, dropping migrations, `terraform apply`/`destroy`, `kubectl delete`, killing processes.
