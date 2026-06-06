# Commits

- Never commit unless asked.
- Never batch unrelated changes into one commit unless asked.
- Split work into logical commits by intent — one concern per commit.
- Follow Conventional Commits (format and types below).
- Never use `--no-verify` or skip hooks unless explicitly asked.
- Never switch, create, or delete branches without asking.
- Never push unless explicitly asked.
- **Even when push is authorized: commit first, then ask "should I push?" — never push immediately after committing.**
- Before pushing (when authorized): run tests, typecheck, and lint if the project has them.

### Conventional commit format

```text
<type>(<scope>): <short imperative description>

[optional body — explain the WHY, not the WHAT]

[optional footer]
BREAKING CHANGE: <description>
```

- Wrap commit body at 72 characters.
- Keep the subject concise. Add detail in the body only for batched or genuinely complex commits.

### Conventional commit types

| Type       | When                                     |
| ---------- | ---------------------------------------- |
| `feat`     | New feature visible to users             |
| `fix`      | Bug fix                                  |
| `refactor` | Code change with no behaviour change     |
| `style`    | Formatting, whitespace — no logic change |
| `docs`     | Documentation only                       |
| `test`     | Adding or updating tests                 |
| `chore`    | Tooling, config, dependencies            |
| `ci`       | CI/CD pipeline changes                   |
| `build`    | Build system changes                     |
| `perf`     | Performance improvement                  |
| `revert`   | Reverting a previous commit              |
