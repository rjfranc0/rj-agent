# Target: tauri-release (stub)

Detected via `src-tauri/` or `tauri.conf.json`. Not yet fully designed — this stub establishes the contract so expanding it later doesn't require restructuring `ci/RULES.md`'s dispatch.

**Known shape** (for expansion): cross-platform build matrix (Windows/macOS/Linux runners), per-platform code signing, artifact upload to GitHub Releases via `tauri-apps/tauri-action`. No Docker, no GHCR, no VPS — this target never touches `rules/docker/`.

If a Tauri deploy pipeline is requested before this file is fleshed out: say so explicitly, propose expanding this file as the first step (small, scoped session), don't improvise a pipeline from general knowledge that then conflicts with what this file says once written.
