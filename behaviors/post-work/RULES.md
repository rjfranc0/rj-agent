# Post-work

## After working

- Make sure to stop and/or kill every processes you started. Do not block the user task because your process still listen to the server post for example.
- **Never commit right after finishing.** Wait for manual review — let the changes be visible first.
- Invite the user to review the changes manually.
- Commit only when explicitly asked (see Commits below).
- Report any out-of-scope failing tests, skipped checks, or known issues you spotted but didn't fix.
- List every authorization you had to ask for during the session. Propose adding the read-only / low-risk ones (`ls`, `cat`, `git log`, `git status`, etc.) to the project-level allowlist.

## Memory & recall

- Before recommending a file, function, or flag from memory, verify it still exists (grep or read).
- Memory is a snapshot in time, not ground truth. Trust the current code over remembered claims.
