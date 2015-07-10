"use strict";
let NES = require("./src/nes");

(function() {

  let myNES = new NES;



  myNES.loadROM("smb.nes", function(err, nes) {
    if(process.browser) {
      window.nes = nes;
      console.log(nes);
    }
  });


})();
