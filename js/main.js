import { AudioEngine } from "./audio-engine.js";
import { KeyboardController } from "./keyboard-controller.js";
import { BeatRecorder } from "./beat-recorder.js";

const audioEngine = new AudioEngine();
const beatRecorder = new BeatRecorder();

const soundMap = {
  kick: "./assets/sounds/kick.wav",
  snare: "./assets/sounds/snare.wav",
  "hi-hat": "./assets/sounds/hi-hat.wav",
  tom: "./assets/sounds/tom.wav",
  clap: "./assets/sounds/clap.wav",
  crash: "./assets/sounds/crash.wav",
  ride: "./assets/sounds/ride.wav",
  "floor-tom": "./assets/sounds/floor-tom.wav",
  percussion: "./assets/sounds/percussion.wav"
};

await audioEngine.preload(soundMap);

/*
 * Wrapper used by KeyboardController.
 * Every keyboard/pointer hit is:
 * 1. recorded by BeatRecorder
 * 2. played by AudioEngine
 */
const recordingAudioEngine = {
  async unlock() {
    await audioEngine.unlock();
  },

  play(soundId) {
    beatRecorder.record(soundId);
    return audioEngine.play(soundId);
  }
};

const keyboardController = new KeyboardController(
  recordingAudioEngine
);

keyboardController.start();

/* Transport controls */
const recordButton = document.querySelector("#record-button");
const playButton = document.querySelector("#play-button");
const stopButton = document.querySelector("#stop-button");
const clearButton = document.querySelector("#clear-button");

/* Record */
recordButton?.addEventListener("click", async () => {
  await audioEngine.unlock();

  beatRecorder.startRecording();

  recordButton.classList.add("active");
});

/* Play */
playButton?.addEventListener("click", async () => {
  await audioEngine.unlock();

  beatRecorder.playSequence(audioEngine);
});

/* Stop */
stopButton?.addEventListener("click", () => {
  beatRecorder.stop();

  recordButton?.classList.remove("active");
});

/* Clear */
clearButton?.addEventListener("click", () => {
  beatRecorder.clear();

  recordButton?.classList.remove("active");
});

console.log("Drum Kit Engine initialized.");