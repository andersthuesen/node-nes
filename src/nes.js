"use strict";
let CPU     = require("./cpu");
let Memory  = require("./memory");
let ROM     = require("./rom");
let PPU     = require("./ppu");
let APU     = require("./apu");

class NES {

  constructor(options) {

    this.CPU      = null;
    this.MMAP     = null;
    this.ROM      = new ROM(this);
    this.PPU      = new PPU(this);
    this.APU      = new APU(this);
    this.RAM      = new Memory(0x0800);
    this.SRAM     = new Memory(0x2000);

    this.debug    = true;

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

  loadROM(data) {
    this.ROM.load(data);
    this.MMAP = this.ROM.mapper;
    this.CPU = new CPU(this);
    this.ready = false;
  }

  reset() { // Reset all the things!

    this.CPU.reset();
    this.APU.reset();
    this.PPU.reset();
    this.MMAP.reset();
    this.ROM.reset();

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

    this.step();

  }

  log(message) {

    if(this.debug) {

      console.log(`Node-NES: ${message}`);

    }

  }

  step() {

    let cpuCycles = this.CPU.step();
    let ppuCycles = cpuCycles * 3;

    for (let i = 0; i < ppuCycles; i++) {
      this.PPU.step();
      this.MMAP.step();
    }

    for (let i = 0; i < cpuCycles; i++) {
      this.APU.step();
    }
    return cpuCycles;

  }

  pause() {

  }

  fail(err) {

    this.stop();

    if(err instanceof Error)
      throw err;

    throw new Error(err || "Something went wrong");

  }

}

module.exports = NES;
