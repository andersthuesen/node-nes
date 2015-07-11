/*
  Memory mappers are used for mapping parts of the address space to PRG, CHR, I/O etc..

  Multiple mappers exist, which is why each mapper has to map different parts of the ROM image
  to different locations.


  - Taken from https://en.wikibooks.org/wiki/NES_Programming/Memory_Map


  CPU:

  Address	  Size	  Description
  -----------------------------------------
  $0000     $800	  2KB of work RAM
  $0800     $800	  Mirror of $000-$7FF
  $1000     $800	  Mirror of $000-$7FF
  $1800     $800	  Mirror of $000-$7FF
  $2000     8	      PPU Ctrl Registers
  $2008     $1FF8	  *Mirror of $2000-$2007
  $4000     $20	    Registers (Mostly APU)
  $4020     $1FDF	  Cartridge Expansion ROM
  $6000     $2000	  SRAM
  $8000     $4000	  PRG-ROM
  $C000     $4000	  PRG-ROM


  PPU:

  Address	  Size	   Description
  -----------------------------------------
  $0000	    $1000	   Pattern Table 0
  $1000	    $1000	   Pattern Table 1
  $2000	    $3C0	   Name Table 0
  $23C0	    $40	     Attribute Table 0
  $2400	    $3C0	   Name Table 1
  $27C0	    $40	     Attribute Table 1
  $2800	    $3C0	   Name Table 2
  $2BC0	    $40	     Attribute Table 2
  $2C00	    $3C0	   Name Table 3
  $2FC0	    $40      Attribute Table 3
  $3000	    $F00     Mirror of 2000h-2EFFh
  $3F00	    $10	     BG Palette
  $3F10	    $10	     Sprite Palette
  $3F20	    $E0	     Mirror of 3F00h-3F1Fh


*/

"use strict";
var Memory = require("./memory");


class Mapper {

  constructor(NES) {
    this.NES = NES;
    this.MEM = new Memory;
    this.ROM = NES.ROM; //Shortcut
    this.offsets = {
      PRG: [0, 0, 0],
      CHR: [0, 0, 0]
    };

  }

  _loadIntoMemory(data, address, length, offset) {

    let _offset = offset || 0;
    let _length = length || (data.length - _offset); // Don't read past end of data.

    for (let i = 0; i < _length; i++) {
      this.MEM[address + i] = data[i + _offset];
    }

  }


  getPRGIndex(address) {

    address -= 0x8000; // Get relative address
    if(this.ROM.PRGBanks == 1) { // Check if only 1 PRG bank is present
      address &=0x3FFF; // if so, mirror PRG bank 1 in PRG bank 2
    }
    let bank = parseInt(address / 0x4000);
    let offset = address % 0x4000;
    return address + this.offsets.PRG[bank]

  }

  getCHRIndex(address) {

    address -= 0x2000;
    let bank = parseInt(address / 0x1000);
    let offset = address % 0x1000;
    return offset + this.offsets.CHR[bank];

  }

  getRAMIndex(address) {

  }

  step() {

  }


  read(address) {

    address &= 0xFFFF; //Wrap around

    switch(true) {

      case (address < 0x2000): { // If reading CHR

        let index = this.getCHRIndex(address);
        return this.ROM.CHR[index];
        break;

      }
      case (address >= 0x8000): { // If reading PRG

        let index = this.getPRGIndex(address);
        return this.ROM.PRG[index];
        break;

      }

      case (address >= 0x6000): // If reading battery RAM
        return this.MEM[address];
        break;

      default:
        this.NES.fail(`Unhandled mapper read at ${address.toString(16)}`);
        break;

    }

  }

  read16(address) {
    return (this.read(address+1) << 8) | this.read(address);
  }

  read16bug(address) {
    let a = address;
    let b = (a & 0xFF00) | (a+1);
    let lo = this.read(a);
    let hi = this.read(b);
    return (hi << 8) | lo;
  }

  write(address, value) {

    value &= 0xFF; // Only get first byte.
    address &= 0xFFFF; //Wrap around.

    switch(true) {

      case (address < 0x2000): { // If reading CHR

        let index = this.getCHRIndex(address);
        this.ROM.CHR[index] = value;
        break;

      }
      case (address >= 0x8000): { // If reading PRG

        let index = this.getPRGIndex(address);
        this.ROM.PRG[index] = value;
        break;

      }

      case (address >= 0x6000): // If reading battery RAM
        this.MEM[address] = value;
        break;

      default:
        this.NES.fail(`Unhandled mapper write at ${address.toString(16)}`);
        break;

    }

  }

  reset() {
    this.MEM.reset();
  }

}

class Mapper1 extends Mapper {

}


class Mapper2 extends Mapper {

  constructor(NES) {
    super(NES);
    this.offsets.PRG[1] = -1;
  }


}


module.exports = [
  Mapper1,
  Mapper2
];
