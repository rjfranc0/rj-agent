# Tauri Rules (v2+)

Loaded when `src-tauri/` exists or `tauri` is in `Cargo.toml`. Tauri v2 only — never use v1 APIs (`@tauri-apps/api/tauri`, `allowlist`, `app.get_window()`).

## Project Shape

- `src-tauri/src/main.rs` is a thin passthrough calling `app_lib::run()`. **All logic lives in `lib.rs`** — required for mobile, where Tauri replaces `main()` via `#[cfg_attr(mobile, tauri::mobile_entry_point)]`.
- `Cargo.toml` keeps `crate-type = ["staticlib", "cdylib", "rlib"]` for cross-platform builds.
- Never hardcode filesystem paths — use `app.path()` APIs.

## Commands

- Every command **must** be registered in `tauri::generate_handler![...]` — unregistered commands fail silently from the frontend. Verify registration as part of validation.
- Commands return `Result<T, E>` with a `thiserror` error type implementing `serde::Serialize` (serialize to its `Display` string unless the contract specifies structured errors).
- **Async commands take owned types** (`String`, not `&str`) — borrows can't cross await points in the IPC layer.
- Never block in a command: I/O goes async; CPU-heavy work goes through `spawn_blocking` or a rayon bridge (see `rules/concurrency/RULES.md`).
- Window access: `app.get_webview_window("label")` / `tauri::WebviewWindow`.

## Serde Boundary

- Command args derive `Deserialize`, returns derive `Serialize`. Tauri converts JS camelCase ↔ Rust snake_case automatically — don't fight it with manual renames.
- `Option<T>` ↔ optional/`null` JS args.
- Enums crossing IPC need an explicit representation: `#[serde(tag = "event", content = "data")]` or similar. Never ship a default-repr enum across the wire.

## Capabilities & Security

- **Everything is denied by default.** Each plugin feature used requires its permission string in `src-tauri/capabilities/*.json` — a missing one fails silently at runtime. When adding a plugin or API call, adding the capability is part of the same change, not a follow-up.
- Grant minimal permissions, scoped (`fs` scoped to `$APPDATA/*`, not blanket). Target specific windows in the capability, not `"*"`.
- Keep CSP strict in `tauri.conf.json`; never widen it to make something work without flagging the security trade-off.

## State

- Shared state: `.manage(Mutex<T>)` (or `RwLock`), accessed via `State<'_, Mutex<T>>` — the type must match `.manage()` exactly or access panics.
- Lock scope minimal: lock, read/write, drop — never hold a lock across an await.

## TypeScript Wrappers (the only TS you write)

For each command, produce/maintain a typed wrapper in the project's IPC binding module (e.g. `src/lib/ipc/`):

```typescript
import { invoke } from '@tauri-apps/api/core';

export interface User { id: number; name: string }

export function createUser(name: string, email: string): Promise<User> {
  return invoke<User>('create_user', { name, email });
}
```

- Types mirror the serde shapes exactly (camelCase side). One module per command group.
- **Nothing else**: no logic beyond marshalling, no components, no stores, no UI state. Frontend code consumes these wrappers; it never calls `invoke` raw — if you find raw `invoke` calls in frontend code, flag it, don't refactor it (out of scope).

## Mobile

- Check platform support before using any plugin/API in a mobile-targeted app — tray, multi-window, and some shell features are desktop-only. Use `#[cfg(desktop)]` / `#[cfg(mobile)]` for divergent paths.
- IPC primitives (commands, events, channels) and `AppHandle` are safe on all platforms.

## Validation Additions

On top of the standard loop: confirm new commands are in `generate_handler!`, new permissions are in a capability file, and exercise at least one real invoke round-trip when a dev environment is available.

For events vs channels selection, streaming, and richer state patterns → load `rules/tauri/ipc-patterns.md`.
