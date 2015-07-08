"use strict";

/*
  Memory mappers are used for mapping parts of the address space to PRG, CHR, I/O etc..

  Multiple mappers exist, which is why each mapper has to map different parts of the ROM image
  to different locations.

*/

class Mapper {

  constructor(NES) {
    this.NES = NES;
  }

  load(address) {

  }

}


class Mapper2 extends Mapper {

}

module.exports = [Mapper, Mapper2];
