import { AudioEngine } from "./audio-engine.js";
import { KeyboardController } from "./keyboard-controller.js";


const audioEngine = new AudioEngine();


await audioEngine.preload({
  kick: "./assets/sounds/kick.wav",
  snare: "./assets/sounds/snare.wav",
  "hi-hat": "./assets/sounds/hi-hat.wav",
  tom: "./assets/sounds/tom.wav",
  clap: "./assets/sounds/clap.wav",
  crash: "./assets/sounds/crash.wav",
  ride: "./assets/sounds/ride.wav",
  "floor-tom": "./assets/sounds/floor-tom.wav",
  percussion: "./assets/sounds/percussion.wav"
});


const keyboardController = new KeyboardController(audioEngine);
keyboardController.start();