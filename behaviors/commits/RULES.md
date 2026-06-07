# Commits

- Never commit unless asked.
- Never batch unrelated changes into one commit unless asked.
- Split work into logical commits by intent — one concern per commit.
- Before committing, verify only the intended files are staged.
- Use the `commit` skill to commit. If it's missing, do as described here: « Follow Conventional Commits: `<type>(<scope>): <imperative description>`. Body explains the *why*, not the *what*; wrap at 72 chars. If the why isn't known, keep it to the subject — don't invent rationale. »
- Never use `--no-verify` or skip hooks unless explicitly asked.
- Never switch, create, or delete branches without asking.
- Never amend or rewrite history that's already been pushed without asking.
- Never push unless explicitly asked.
- **Even when push is authorized: commit first, then ask "should I push?" — never push immediately after committing.**
- Before pushing (when authorized): run tests, typecheck, and lint if the project has them.
