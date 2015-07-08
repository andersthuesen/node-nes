"use strict";
let NES = require("./src/nes");

(function() {

  let myNES = new NES;

  if(process.browser) {
    window.nes = myNES;
  }

  myNES.loadROM("test.nes").then(function() {

    console.log(myNES);
    //myNES.start();

  }).catch(function(err) {
    console.log("Something went wrong...")
  });



})();
