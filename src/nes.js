"use strict";
var CPU     = require("./cpu");
var Memory  = require("./memory");
var ROM     = require("./rom");

class NES {

  constructor(options) {

    this.CPU      = new CPU(this);
    this.Memory   = new Memory(0x10000);
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
    var self = this;

    var promise = new Promise(function(resolve, reject) {

      function loadROMData() {
        var data = arguments[arguments.length-1]; //Get data from last argument
        self.ROM.load(data, function(err, ROM) {

          if (err) {
              self.fail(err);
              reject(err);

          } else {

            resolve(ROM);

          }

        });
      }


      if(process.browser) {

        // Load using ajax.
        var xhr = require("xhr");
        xhr({uri: path}, loadROMData);


      } else {
        // Load via fs module
        var fs = require("fs");
        fs.readFile(path, "utf8", loadROMData);

      }


    });

    return promise;

  }

  reset() {

    this.CPU.reset();
    this.Memory.reset();

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
