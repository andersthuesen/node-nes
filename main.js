"use strict";
let NES = require("./src/nes");

(function() {

  let myNES = new NES;
  function loadROM(path) {
      let promise = new Promise(function(resolve, reject) {


        if(process.browser) {

          // Load using ajax.
          let xhr = require("xhr2");

          let romrequest = new xhr();

          romrequest.onload = function() {
            resolve(romrequest.response);
          };

          romrequest.open("GET", path, true);
          romrequest.overrideMimeType("text/plain; charset=x-user-defined");
          romrequest.send();


        } else {
          console.log("Sry, Node/iojs not implemented yet...");
        }


      });

      return promise;

  }

  loadROM("smb.nes").then(function(rom) {

    myNES.loadROM(rom);
    if(process.browser) {
      window.nes = myNES;
    }
    console.log(myNES);

  });

})();
