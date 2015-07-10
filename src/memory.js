"use strict";

class Memory extends Array { //Gosh this is cool!

  constructor(size) {
    super(size || 0x10000);
    this.reset();
  }

  reset() {

    // Clear all data.
    for (var i = 0; i < this.length; i++) {
      this[i] = 0;
    }

  }

}

module.exports = Memory;
