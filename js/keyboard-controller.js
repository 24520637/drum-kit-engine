/**
 * Drum Kit Keyboard Controller
 *
 * Module 3:
 * - M3.1 Keyboard keydown/keyup handlers
 * - M3.2 Dynamic [data-key] / data-sound lookup
 * - M3.3 event.repeat throttling
 * - M3.4 AudioEngine integration
 * - M3.5 .active UI state
 * - M3.6 Fast-key handling
 * - M3.7 Data-attribute-based key rebinding
 *
 * The controller does NOT contain a hard-coded key-to-sound map.
 */

export class KeyboardController {
  constructor(audioEngine) {
    if (!audioEngine || typeof audioEngine.play !== "function") {
      throw new TypeError(
        "KeyboardController requires an AudioEngine with a play() method."
      );
    }

    this.audioEngine = audioEngine;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerCancel = this.handlePointerCancel.bind(this);
  }

  /**
   * Start listening for keyboard and pointer input.
   */
  start() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    const pads = document.querySelectorAll(".drum-pad");

    pads.forEach((pad) => {
      pad.addEventListener("pointerdown", this.handlePointerDown);
      pad.addEventListener("pointerup", this.handlePointerUp);
      pad.addEventListener("pointercancel", this.handlePointerCancel);
    });
  }

  /**
   * Stop listening for input.
   */
  stop() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);

    const pads = document.querySelectorAll(".drum-pad");

    pads.forEach((pad) => {
      pad.removeEventListener("pointerdown", this.handlePointerDown);
      pad.removeEventListener("pointerup", this.handlePointerUp);
      pad.removeEventListener("pointercancel", this.handlePointerCancel);
      pad.classList.remove("active");
    });
  }

  /**
   * M3.1 + M3.3 + M3.4 + M3.5
   */
  async handleKeyDown(event) {
    // M3.3: ignore browser auto-repeat.
    if (event.repeat) {
      return;
    }

    // M3.1: normalize key consistently.
    const key = event.key.toUpperCase();

    const pad = this.findPadByKey(key);

    // Invalid/unmapped keys are ignored safely.
    if (!pad) {
      return;
    }

    const soundId = pad.dataset.sound;

    // M3.4: only play when a valid data-sound exists.
    if (!soundId) {
      return;
    }

    pad.classList.add("active");

    try {
      await this.audioEngine.unlock();
      this.audioEngine.play(soundId);
    } catch {
      // Keep controller stable if audio cannot be unlocked/played.
    }
  }

  /**
   * M3.1 + M3.2 + M3.5
   */
  handleKeyUp(event) {
    const key = event.key.toUpperCase();

    const pad = this.findPadByKey(key);

    if (!pad) {
      return;
    }

    pad.classList.remove("active");
  }

  /**
   * M3.2 + M3.4 + M3.5
   *
   * Pointer interaction uses the same data-key/data-sound contract.
   */
  async handlePointerDown(event) {
    const pad = event.currentTarget;

    if (!(pad instanceof HTMLElement)) {
      return;
    }

    const soundId = pad.dataset.sound;

    if (!soundId) {
      return;
    }

    pad.classList.add("active");

    try {
      await this.audioEngine.unlock();
      this.audioEngine.play(soundId);
    } catch {
      // Ignore audio errors so pointer interaction does not break.
    }
  }

  handlePointerUp(event) {
    const pad = event.currentTarget;

    if (pad instanceof HTMLElement) {
      pad.classList.remove("active");
    }
  }

  handlePointerCancel(event) {
    const pad = event.currentTarget;

    if (pad instanceof HTMLElement) {
      pad.classList.remove("active");
    }
  }

  /**
   * M3.2:
   * Dynamically resolve the pad from its data-key attribute.
   *
   * No key-to-sound map exists in JavaScript.
   */
  findPadByKey(key) {
    return document.querySelector(
      `[data-key="${CSS.escape(key)}"]`
    );
  }
}

export default KeyboardController;