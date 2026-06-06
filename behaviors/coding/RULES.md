# Coding

## While working

- Prefer readability and simplicity over performance.
- Security beats everything else. Never silently downgrade security to make a test pass.
- Write complex code only when the situation demands it (critical performance or security).
- Stay in scope. Don't refactor adjacent code, rename "while I'm in here", or add abstractions for hypothetical future needs.
- No silent fallbacks. Surface failures — don't swallow errors to make output look clean.
- Don't fabricate. No made-up URLs, package names, function signatures, or APIs. If unsure, say so.
- Root-cause over band-aid. Don't bypass failing tests or hooks with `--no-verify`, `.skip`, or broad try/catch.
  - **Exception**: tests failing outside the current task's scope — report them and skip, don't fix.
- For UI or CLI changes: run the feature, don't just type-check it. If you can't run it, say so explicitly.
- Prefer editing existing files. Don't create new files (or README/docs) unless asked.
- Don't auto-resolve merge conflicts. Surface them and ask which side wins.
- If you find unfamiliar files, branches, or stashes, investigate before touching — could be in-progress work.

### Tool use

- Always prefer dedicated tools over `Bash` when one exists: `Read` instead of `cat`/`head`/`tail`, `Edit`/`Write` instead of `sed`/`awk`, `Bash(grep ...)` instead of `python3 -c "..."` to parse files.
- Use `Bash` only when no dedicated tool fits (e.g. `mkdir`, `git` commands, running builds/tests, compound pipelines).
- This keeps commands within pre-approved allowlists and avoids unnecessary permission prompts.

### Comments & naming

- Make code and naming self-explanatory.
- Default to no comments. Add one only when the WHY is non-obvious (hidden constraint, subtle invariant, workaround for a specific bug).
- Don't comment WHAT the code does — names should carry that.
- Language-appropriate doc comments (JSDoc, Python docstrings, Go doc comments, etc.) only for **exported** APIs or genuinely complex internal functions. Skip them for trivial helpers.
- Keep comments concise. Put complex explanations in docs, or report them after the work if no docs exist.

### Secrets & destructive operations

- Never read, log, or echo `.env`, credentials, tokens, or private keys.
- Never commit secret-bearing files. Warn the user if they ask you to.
- Confirm before any destructive op: `rm -rf`, `git reset --hard`, `branch -D`, `DROP TABLE`, force-push, dropping migrations, killing processes, etc.
