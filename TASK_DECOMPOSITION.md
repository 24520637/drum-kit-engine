# WBS Module 1 — HTML Data-Sound Contract

## Objective

Build the complete HTML/CSS foundation for the Drum Kit Engine with **zero JavaScript dependency**.

| Task ID  | Task                    | Acceptance Criteria                                                                                                              |
| -------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **M1.1** | **HTML Structure**      | Valid HTML5; semantic `<main>` and drum-pad container; meaningful `<title>` and viewport meta.                                   |
| **M1.2** | **Drum Pad Elements**   | Create 9 `<button type="button" class="drum-pad">` elements using keys **Q, W, E, A, S, D, Z, X, C**.                            |
| **M1.3** | **Data Contract**       | Each pad has a unique `data-key` and non-empty `data-sound`.                                                                     |
| **M1.4** | **Key/Sound UI Labels** | Each pad contains `<kbd>` for the keyboard key and `<span>` for the sound name.                                                  |
| **M1.5** | **Accessibility**       | Native buttons are keyboard-focusable; `<kbd>` and `<span>` provide clear visible labels.                                        |
| **M1.6** | **CSS Layout & States** | Responsive layout; implement `:hover`, `:focus-visible`, `:active`; apply `user-select: none` to drum pads.                      |
| **M1.7** | **Zero JS Dependency**  | No `<script>`, inline event handlers, JS-generated elements, or JS-required styling. Page must remain complete with JS disabled. |
| **M1.8** | **Contract Validation** | All 9 keys are present exactly once; every pad has valid `data-key` and `data-sound`.                                            |

## Key Mapping

| Key | Sound      |
| --- | ---------- |
| Q   | Kick       |
| W   | Snare      |
| E   | Hi-Hat     |
| A   | Tom        |
| S   | Clap       |
| D   | Crash      |
| Z   | Ride       |
| X   | Floor Tom  |
| C   | Percussion |

## Data Contract

```html
<button
  class="drum-pad"
  type="button"
  data-key="Q"
  data-sound="kick"
>
  <kbd>Q</kbd>
  <span>Kick</span>
</button>
```

### Definition of Done

* [ ] All **Q, W, E, A, S, D, Z, X, C** pads exist in the initial HTML.
* [ ] Each pad contains `<kbd>` and `<span>` labels.
* [ ] `data-key` uniquely identifies the keyboard control.
* [ ] `data-sound` identifies the sound.
* [ ] `.drum-pad { user-select: none; }` is implemented.
* [ ] Accessibility states work entirely through CSS.
* [ ] **No JavaScript is loaded, referenced, or required in M1.**

# WBS Module 2 — Polyphonic Audio Playback Engine

## Objective

Build a standalone audio engine that supports **zero-latency, overlapping drum sounds without cutoffs**, with **zero DOM references**.

| Task ID  | Task                                 | Acceptance Criteria                                                                                                                                                                                              |
| -------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M2.1** | **Standalone Audio Module**          | Create an independent audio module/API; no `document`, `window`, DOM selectors, or DOM event listeners inside the engine.                                                                                        |
| **M2.2** | **Audio Preloading & Buffering**     | Implement `preload(soundMap)` using the **Web Audio API** to fetch/decode all audio files into `AudioBuffer`s before playback; first playback must not wait for network/file loading.                            |
| **M2.3** | **Decoupled Play API**               | Expose `preload(soundMap)` and `play(soundId)` APIs; `play()` uses preloaded `AudioBuffer`s and knows nothing about HTML elements.                                                                               |
| **M2.4** | **Polyphonic Playback**              | Create an independent `AudioBufferSourceNode` for every `play()` call so multiple sounds, including repeated identical sounds, play simultaneously without interrupting each other.                              |
| **M2.5** | **Playback Lifecycle**               | Create, connect, start, and release each `AudioBufferSourceNode` correctly; completed nodes must become eligible for garbage collection.                                                                         |
| **M2.6** | **Autoplay Policy & Error Handling** | Implement `unlock()` / `resume()` to resume the `AudioContext` after user interaction; gracefully handle suspended contexts, failed decoding, missing sounds, and playback errors.                               |
| **M2.7** | **Max Pool/Instance Limit**          | Enforce a maximum of **10–15 active instances per sound** (configurable); when the limit is reached, apply a defined policy such as dropping or recycling the oldest voice to prevent uncontrolled memory usage. |
| **M2.8** | **Web Audio API Validation**         | Use **`AudioContext` + `AudioBufferSourceNode`** as the recommended production architecture; verify rapid and overlapping playback produces no first-play latency or audible cutoffs after preloading.           |

## Data/API Contract

```js id="q2n0jv"
audioEngine.preload({
  kick: "/sounds/kick.wav",
  snare: "/sounds/snare.wav"
});

audioEngine.unlock();

audioEngine.play("kick");
audioEngine.play("snare");
audioEngine.play("kick"); // must overlap the previous kick
```

### Zero-DOM Requirement

The audio engine **must not contain**:

```js id="d9f5ww"
document.querySelector(...)
document.getElementById(...)
window.addEventListener(...)
element.addEventListener(...)
```

DOM-to-audio mapping belongs to a separate controller/integration layer.

## Definition of Done

* [ ] Engine is importable and usable independently of the DOM.
* [ ] `preload(soundMap)` loads and decodes all required sounds before interaction.
* [ ] `play(soundId)` uses preloaded `AudioBuffer`s.
* [ ] `unlock()` / `resume()` handles browser Autoplay Policy after user interaction.
* [ ] **Web Audio API (`AudioContext` + `AudioBufferSourceNode`) is used for production polyphony.**
* [ ] Multiple sounds can play simultaneously.
* [ ] Repeated playback of the same sound does **not** stop the previous instance.
* [ ] Rapid playback does not cause audible cutoffs within the configured pool limit.
* [ ] Active instances per sound are capped at **10–15** by configuration.
* [ ] Invalid/missing audio sources and decoding failures fail gracefully.
* [ ] Completed audio nodes are released and do not accumulate indefinitely.
* [ ] No DOM APIs or DOM references exist inside the audio engine.

# WBS Module 3 — Keyboard Controller & Event Throttling

## Objective

Implement a decoupled keyboard controller that maps keyboard input to the Module 1 `data-key` / `data-sound` contract while preventing unwanted repeated events.

| Task ID  | Task                                | Acceptance Criteria                                                                                                                                                                          |
| -------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M3.1** | **Keyboard Event Handlers**         | Register `keydown` and `keyup` handlers; normalize pressed keys consistently (e.g., uppercase) before lookup.                                                                                |
| **M3.2** | **Dynamic DOM Attribute Queries**   | Resolve pads using `[data-key="..."]` and read `data-sound` dynamically; no hard-coded key-to-sound mapping in the controller.                                                               |
| **M3.3** | **`event.repeat` Throttling Guard** | Ignore `keydown` events where `event.repeat === true` so holding a key does not trigger continuous unwanted playback.                                                                        |
| **M3.4** | **Audio Integration**               | Call the Module 2 `play(soundId)` API only after a valid `data-sound` is found; keyboard logic must not implement audio playback itself.                                                     |
| **M3.5** | **UI Active State**                 | Add/remove an `.active` class on `keydown`/`keyup`; use the same state for mouse/pointer interaction where applicable.                                                                       |
| **M3.6** | **Fast-Key Handling**               | Rapidly pressing different keys must trigger each valid sound independently without missed events, cutoffs, or controller errors.                                                            |
| **M3.7** | **Key Rebinding Refactor**          | Key mappings must be controlled exclusively through HTML `data-key` attributes, allowing a live key rebinding during defense by changing the attribute rather than editing controller logic. |
| **M3.8** | **Live Defense Validation**         | Demonstrate a key rebinding in **≤3 minutes**: change `data-key`, reload/refresh if required, and verify the new key triggers the correct sound without modifying controller mapping code.   |

## Key Event Flow

```text
keydown
  ↓
Normalize key
  ↓
event.repeat? → ignore
  ↓
Find [data-key]
  ↓
Read data-sound
  ↓
audioEngine.play(soundId)
  ↓
Add .active state
```

```text
keyup
  ↓
Find [data-key]
  ↓
Remove .active state
```

## Acceptance Criteria — Fast Presses & Rebinding

* [ ] Holding a key does not repeatedly trigger playback because of `event.repeat`.
* [ ] Rapid presses of Q/W/E/A/S/D/Z/X/C trigger the corresponding sounds independently.
* [ ] Keyboard input does not contain a hard-coded sound map.
* [ ] Changing a pad's `data-key` automatically changes its keyboard mapping.
* [ ] Changing `data-sound` changes the sound triggered by that pad.
* [ ] No controller code modification is required for normal key rebinding.
* [ ] A complete key-rebinding demonstration can be performed within **3 minutes** during Live Defense.
* [ ] Invalid/unmapped keys are ignored safely without JavaScript errors.
* [ ] `.active` UI state is correctly removed on `keyup`.
* [ ] Controller remains separate from the Module 2 audio engine.

# WBS Module 4 — FIFO Beat Recorder (Timestamped Event Queue)

## Objective

Implement a FIFO event recorder that captures drum inputs with high-resolution timestamps and reproduces them in the original sequence and timing.

| Task ID  | Task                                   | Acceptance Criteria                                                                                                                            |
| -------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **M4.1** | **FIFO Queue Initialization**          | Initialize an empty event array/queue; events are appended in recording order and never reordered.                                             |
| **M4.2** | **Timestamp Logging**                  | Record each drum event with `performance.now()` and its `soundId`/key. Timestamp resolution must be sufficient for rapid drum hits.            |
| **M4.3** | **Relative Timing Calculation**        | Store event timing relative to the start of recording or the first recorded event, avoiding dependence on absolute wall-clock time.            |
| **M4.4** | **Record Event API & Recording State** | Provide a decoupled API such as `record(soundId, timestamp)`; maintain an `isRecording` flag and only append events while recording is active. |
| **M4.5** | **Playback Scheduler**                 | Replay events sequentially using their relative timestamp differences as playback delays; preserve the original event order.                   |
| **M4.6** | **Playback Integration**               | Trigger Module 2 `audioEngine.play(soundId)` for each scheduled event without directly managing audio implementation details.                  |
| **M4.7** | **Clear / Reset Operations**           | Provide `clear()`/`reset()` operations that remove all recorded events and reset recording/playback state.                                     |
| **M4.8** | **Playback State & Cancellation**      | Maintain playback state; provide `stop()` to clear all scheduled timers and cancel active playback before starting a new playback session.     |
| **M4.9** | **Accuracy Validation**                | Verify that recorded intervals are reproduced in the same sequence and within an acceptable timing tolerance under normal browser conditions.  |

## Event Data Structure

```js id="e8v9a6"
{
  soundId: "kick",
  timestamp: 1250.42,
  delay: 0
}
```

Example recording:

```text id="v8a4b2"
Kick  → t=0ms
Snare → t=250ms
Kick  → t=500ms
HiHat → t=750ms
```

Playback should schedule:

```text id="5k6xqz"
play("kick")  → 0ms
play("snare") → 250ms
play("kick")  → 500ms
play("hihat") → 750ms
```

## Acceptance Criteria — Recording & Playback

* [ ] Events are stored in strict FIFO order.
* [ ] Each event records a `performance.now()` timestamp.
* [ ] Relative delays are calculated from recording timestamps.
* [ ] `isRecording` correctly controls whether new events are captured.
* [ ] Rapid consecutive hits are recorded as separate events.
* [ ] Playback preserves the exact recorded event sequence.
* [ ] Playback uses relative delays rather than fixed intervals.
* [ ] Module 2 `audioEngine.play()` is used for sound playback.
* [ ] `clear()`/`reset()` completely empties the recorded queue.
* [ ] `stop()` clears all scheduled timers and safely cancels active playback.
* [ ] Starting a new playback automatically stops/cleans up the previous playback session.
* [ ] A recorded beat can be played back repeatedly without modifying the original event queue.
* [ ] Timing remains sufficiently accurate for normal drum-kit performance and does not introduce noticeable sequencing drift.

## Definition of Done

* [ ] FIFO event queue is implemented.
* [ ] `performance.now()` timestamps are recorded.
* [ ] `isRecording` manages recording state correctly.
* [ ] Relative event delays reproduce the original rhythm.
* [ ] Playback integrates with Module 2 through `audioEngine.play()`.
* [ ] `clear()`/`reset()` removes recording data and resets state.
* [ ] `stop()` clears all scheduled timers and releases playback scheduling state.
* [ ] Replaying always starts from a clean scheduler state.
* [ ] Sequential playback maintains the recorded event order and timing.
