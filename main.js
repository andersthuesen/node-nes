var NES = require("./src/nes");



var myNES = new NES;

if(process.browser) {
  window.nes = myNES;
}

myNES.loadROM("smb.nes").then(function() {
  console.log(myNES);
});
