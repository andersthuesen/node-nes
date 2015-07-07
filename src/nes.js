"use strict";
var CPU     = require("./cpu");
var Memory  = require("./memory");
var ROM     = require("./rom");

class NES {

  constructor(options) {

    this.CPU      = new CPU(this);
    this.Memory   = new Memory;
    this.ROM      = null;

    this.frameInterval    = null;
    this.running  = false;
    this.paused   = false;

    this.options = options || {

      sound: true,
      controls: {
        "UP": 38,
        "DOWN": 40,
        "LEFT": 37,
        "RIGHT": 39,
        "A": 188,
        "B": 90,
        "SELECT": 13,
        "START": 27
      },
      fps: 60,
      pal: false

    };
  }

  loadROM(path) {
    this.ROM = new ROM(this);
    this.ROM.load();
  }

  reset() {

    this.CPU.reset();

  }

  stop() {
    clearInterval(this.frameInterval);
    this.running = false;
  }

  start() {
    if(!this.running) {
      // Run this.frame 1000/60 ≈ 16Hz
      this.frameInterval = setInterval(this.frame, 1000 / this.options.fps);

      this.running = true;
    }
  }

  frame() {
    console.log("test");
  }

  pause() {

  }

}

var myNES = new NES;
window.nes = myNES;

myNES.loadROM("test.rom");
console.log(myNES);
