"use strict";

class Memory extends Array { //Gosh this is cool!

  constructor(size) {
    super(size || 0x10000);
    this.reset();
  }

  reset() {

    for(let i = 0; i < 0x2000; i++) { //Set first 0x2000 bytes of RAM to FF (255)
      this[i] = 0xFF;
    }

    for(let i = 0, j = 0; i < 4; j = 0x800 * ++i) {
      this[j+0x008] = 0xF7;
      this[j+0x009] = 0xEF;
      this[j+0x00A] = 0xDF;
      this[j+0x00F] = 0xBF;
    }

    for (var i=0x2001; i < this.length; i++) {
      this[i] = 0x0;
    }

  }

}

module.exports = Memory;
