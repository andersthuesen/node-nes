"use strict";
var CPU     = require("./cpu");
var Memory  = require("./memory");
var ROM     = require("./rom");

class NES {

  constructor(options) {

    this.CPU      = null;
    this.MMAP     = null;
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

  loadROMData(data) {
    this.ROM.load(data);
    this.MMAP = this.ROM.mapper;
    this.CPU = new CPU(this);
    this.ready = false;
  }

  loadROM(path, callback) { //Should probably be moved to main file...
    this.ROM = new ROM(this);
    var self = this;

    if(process.browser) {

      // Load using ajax.
      let xhr = require("xhr2");



      let romrequest = new xhr();

      romrequest.onload = function() {
        self.loadROMData(romrequest.response);
        callback(null, self);
      };

      romrequest.open("GET", path, true);
      romrequest.overrideMimeType("text/plain; charset=x-user-defined");
      romrequest.send();



    } else {
      // TODO Load via fs module.

      this.fail("Can not load ROM - not implemented yet.");

    }

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
