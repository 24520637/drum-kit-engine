/**
 * BeatRecorder
 *
 * Module 4:
 * - M4.1 FIFO event queue
 * - M4.2 performance.now() timestamps
 * - M4.3 relative timestamps
 * - M4.4 recording state
 * - M4.5 playback scheduling
 * - M4.6 AudioEngine integration
 * - M4.7 clear/reset
 * - M4.8 playback cancellation
 * - M4.9 timing preservation
 */
export class BeatRecorder {
  constructor() {
    this.events = [];
    this.isRecording = false;
    this.isPlaying = false;

    this.recordingStartTime = null;
    this.playbackTimers = [];
  }

  /**
   * Start a new recording.
   * A new recording replaces the previous sequence.
   */
  startRecording() {
    this.stop();

    this.events = [];
    this.recordingStartTime = performance.now();
    this.isRecording = true;
  }

  /**
   * Record a sound event.
   *
   * Timestamp is stored relative to recordingStartTime.
   *
   * @param {string} soundId
   */
  record(soundId) {
    if (!this.isRecording) {
      return;
    }

    if (typeof soundId !== "string" || soundId.trim() === "") {
      return;
    }

    const timestamp = performance.now();
    const relativeTime = timestamp - this.recordingStartTime;

    this.events.push({
      soundId,
      timestamp: relativeTime
    });
  }

  /**
   * Stop recording/playback.
   *
   * The recorded queue is preserved.
   */
  stop() {
    this.isRecording = false;
    this.recordingStartTime = null;

    for (const timer of this.playbackTimers) {
      clearTimeout(timer);
    }

    this.playbackTimers = [];
    this.isPlaying = false;
  }

  /**
   * Play the recorded sequence using Module 2 AudioEngine.
   *
   * Each event is scheduled using its relative timestamp.
   *
   * @param {object} audioEngine
   * @returns {boolean}
   */
  playSequence(audioEngine) {
    if (
      !audioEngine ||
      typeof audioEngine.play !== "function"
    ) {
      throw new TypeError(
        "BeatRecorder.playSequence() requires an AudioEngine with a play() method."
      );
    }

    if (this.events.length === 0) {
      return false;
    }

    // Stop an existing playback before starting another.
    this.stop();

    this.isPlaying = true;

    for (const event of this.events) {
      const timer = setTimeout(() => {
        if (!this.isPlaying) {
          return;
        }

        audioEngine.play(event.soundId);
      }, event.timestamp);

      this.playbackTimers.push(timer);
    }

    // Mark playback complete after the final event.
    const finalEvent = this.events[this.events.length - 1];

    const endTimer = setTimeout(() => {
      this.isPlaying = false;
      this.playbackTimers = [];
    }, finalEvent.timestamp);

    this.playbackTimers.push(endTimer);

    return true;
  }

  /**
   * Clear the recorded sequence and reset state.
   */
  clear() {
    this.stop();
    this.events = [];
  }

  /**
   * Read-only copy of the recorded events.
   * Useful for testing/debugging.
   */
  getEvents() {
    return this.events.map((event) => ({ ...event }));
  }
}

export default BeatRecorder;