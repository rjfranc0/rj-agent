# Tauri IPC Patterns

Lazy-loaded: events, channels, streaming, cross-IPC state. Assumes `rules/tauri/RULES.md` is already loaded.

## Choosing the Primitive

| Need | Use | Direction |
|---|---|---|
| Request → response, error handling | **Command** (`invoke`) | FE → Rust → FE |
| Fire-and-forget notification, possibly to multiple windows | **Event** (`emit`/`listen`) | global broadcast, no ack |
| High-frequency typed stream tied to one operation | **Channel** (`Channel<T>`) | Rust → FE, scoped to the invocation |

Decision rule: if the frontend needs the result → command. If Rust pushes and doesn't care who listens → event. If Rust streams progress/data for *this specific call* → channel. Don't simulate request-response with paired events.

## Events

```rust
use tauri::Emitter;

#[tauri::command]
fn start_task(app: tauri::AppHandle) {
    std::thread::spawn(move || {
        // emit returns Result — handle it, don't unwrap in prod
        if let Err(e) = app.emit("task-progress", 50) {
            log::warn!("emit failed: {e}");
        }
    });
}
```

Frontend `listen()` returns an unlisten function — the wrapper must expose it so callers can clean up (leaked listeners are the classic Tauri memory bug).

## Channels

```rust
use tauri::ipc::Channel;

#[derive(Clone, serde::Serialize)]
#[serde(tag = "event", content = "data")]
enum DownloadEvent {
    Progress { percent: u32 },
    Complete { path: String },
}

#[tauri::command]
async fn download(url: String, on_event: Channel<DownloadEvent>) -> Result<(), AppError> {
    for percent in (0..=100).step_by(10) {
        on_event.send(DownloadEvent::Progress { percent })?;
    }
    on_event.send(DownloadEvent::Complete { path: "/downloads/file".into() })?;
    Ok(())
}
```

TS wrapper exposes a typed `Channel<DownloadEvent>` with the discriminated union mirroring the serde tag/content shape.

## State Across IPC

- One state struct per concern, each `.manage()`d separately — not a god-struct behind one mutex.
- Async mutation under contention: prefer `tokio::sync::Mutex` only when the guard must live across an await; otherwise `std::sync::Mutex` with tight scope is faster and simpler.
- For state the frontend must observe: mutate in Rust, then emit a change event — never have the frontend poll a getter command in a loop.

## Long-Running Work

Pattern: command spawns the work, returns immediately with a job id; progress flows through a channel; cancellation is a second command flipping an `Arc<AtomicBool>` (or `CancellationToken` under tokio) checked by the worker.
