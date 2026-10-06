/**
 * Drum Kit Audio Engine
 *
 * Module 2 requirements:
 * - Zero DOM dependency
 * - Web Audio API
 * - Preload and decode audio files
 * - Polyphonic playback
 * - Autoplay-policy unlock/resume
 * - Configurable per-sound instance pool
 */
export class AudioEngine {
  /**
   * @param {Object} options
   * @param {number} options.maxInstancesPerSound
   */
  constructor({ maxInstancesPerSound = 12 } = {}) {
    if (
      !Number.isInteger(maxInstancesPerSound) ||
      maxInstancesPerSound < 10 ||
      maxInstancesPerSound > 15
    ) {
      throw new RangeError(
        "maxInstancesPerSound must be between 10 and 15."
      );
    }

    this.maxInstancesPerSound = maxInstancesPerSound;

    // No document/window/DOM references.
    const AudioContextClass =
      globalThis.AudioContext ||
      globalThis.webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error("Web Audio API is not supported.");
    }

    this.context = new AudioContextClass();

    // soundId -> AudioBuffer
    this.buffers = new Map();

    // soundId -> active AudioBufferSourceNode[]
    this.activeInstances = new Map();

    // Stores preload errors without stopping other valid sounds.
    this.errors = new Map();
  }

  /**
   * Preload and decode all sounds before playback.
   *
   * @param {Record<string, string>} soundMap
   * @returns {Promise<{loaded: string[], failed: string[]}>}
   */
  async preload(soundMap) {
    if (!soundMap || typeof soundMap !== "object") {
      throw new TypeError("soundMap must be an object.");
    }

    const entries = Object.entries(soundMap);

    const results = await Promise.all(
      entries.map(async ([soundId, source]) => {
        try {
          if (!source || typeof source !== "string") {
            throw new Error(`Invalid audio source for "${soundId}".`);
          }

          const response = await fetch(source);

          if (!response.ok) {
            throw new Error(
              `Failed to fetch "${source}" (${response.status}).`
            );
          }

          const audioData = await response.arrayBuffer();

          const audioBuffer =
            await this.context.decodeAudioData(audioData);

          this.buffers.set(soundId, audioBuffer);
          this.errors.delete(soundId);

          return {
            soundId,
            success: true
          };
        } catch (error) {
          this.errors.set(soundId, error);

          return {
            soundId,
            success: false
          };
        }
      })
    );

    const loaded = results
      .filter((result) => result.success)
      .map((result) => result.soundId);

    const failed = results
      .filter((result) => !result.success)
      .map((result) => result.soundId);

    return {
      loaded,
      failed
    };
  }

  /**
   * Unlock/resume the AudioContext after user interaction.
   *
   * This should be called from a user gesture such as:
   * click, pointerdown, or keydown.
   *
   * @returns {Promise<void>}
   */
  async unlock() {
    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  /**
   * Play a preloaded sound.
   *
   * Every call creates a new AudioBufferSourceNode,
   * allowing overlapping/polyphonic playback.
   *
   * @param {string} soundId
   * @returns {AudioBufferSourceNode|null}
   */
  play(soundId) {
    const buffer = this.buffers.get(soundId);

    if (!buffer) {
      // Missing sounds fail safely instead of throwing.
      return null;
    }

    // Get currently active voices for this sound.
    let instances = this.activeInstances.get(soundId);

    if (!instances) {
      instances = [];
      this.activeInstances.set(soundId, instances);
    }

    /*
     * M2.7:
     * Limit active instances per sound.
     *
     * Policy:
     * When the pool is full, recycle the oldest voice.
     */
    if (instances.length >= this.maxInstancesPerSound) {
      const oldestSource = instances.shift();

      if (oldestSource) {
        try {
          oldestSource.onended = null;
          oldestSource.stop();
          oldestSource.disconnect();
        } catch {
          // The node may already have finished.
        }
      }
    }

    /*
     * M2.4:
     * Every play() call gets a completely independent source node.
     */
    const source = this.context.createBufferSource();

    source.buffer = buffer;
    source.connect(this.context.destination);

    instances.push(source);

    /*
     * M2.5:
     * Remove the source when playback finishes so completed
     * nodes do not accumulate indefinitely.
     */
    source.onended = () => {
      const currentInstances = this.activeInstances.get(soundId);

      if (!currentInstances) {
        return;
      }

      const index = currentInstances.indexOf(source);

      if (index !== -1) {
        currentInstances.splice(index, 1);
      }

      try {
        source.disconnect();
      } catch {
        // Already disconnected.
      }

      source.onended = null;

      if (currentInstances.length === 0) {
        this.activeInstances.delete(soundId);
      }
    };

    try {
      source.start(0);
    } catch (error) {
      // Clean up if starting playback fails.
      const index = instances.indexOf(source);

      if (index !== -1) {
        instances.splice(index, 1);
      }

      try {
        source.disconnect();
      } catch {
        // Already disconnected.
      }

      source.onended = null;

      if (instances.length === 0) {
        this.activeInstances.delete(soundId);
      }

      return null;
    }

    return source;
  }
}