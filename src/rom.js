"use strict";
class ROM {

  constructor(NES) {
    this.NES = NES;
    this.valid = false;
    this.data = null;
    this.header = null;
  }

  reload() {

    this.load(this.data);

  }

  load(data, callback) {

    //Check if ROM is valid
    if(!(~data.indexOf("NES\x1a"))) {
      var error = new Error("ROM image not valid!");
      callback(error);
      this.NES.fail(error);
      return;
    }


    //Should be removed in release build
    callback(null, this.data = data);

    this.header = new Array(16);
    for (var i = 0; i < 16; i++) {
      this.header[i] = data.charCodeAt(i) & 0xFF;
    }


  }

}

module.exports = ROM;
