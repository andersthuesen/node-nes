"use strict";

var Mapper = require("./mappers");

class ROM {

  constructor(NES) {
    this.NES    = NES;

    this.mapperName = new Array(92);

    for (let i = 0; i < this.mapperName.length; i++) {
      this.mapperName[i] = "Unknown";
    }
    //Taken from JSNES
    this.mapperName[ 0] = "Direct Access";
    this.mapperName[ 1] = "Nintendo MMC1";
    this.mapperName[ 2] = "UNROM";
    this.mapperName[ 3] = "CNROM";
    this.mapperName[ 4] = "Nintendo MMC3";
    this.mapperName[ 5] = "Nintendo MMC5";
    this.mapperName[ 6] = "FFE F4xxx";
    this.mapperName[ 7] = "AOROM";
    this.mapperName[ 8] = "FFE F3xxx";
    this.mapperName[ 9] = "Nintendo MMC2";
    this.mapperName[10] = "Nintendo MMC4";
    this.mapperName[11] = "Color Dreams Chip";
    this.mapperName[12] = "FFE F6xxx";
    this.mapperName[15] = "100-in-1 switch";
    this.mapperName[16] = "Bandai chip";
    this.mapperName[17] = "FFE F8xxx";
    this.mapperName[18] = "Jaleco SS8806 chip";
    this.mapperName[19] = "Namcot 106 chip";
    this.mapperName[20] = "Famicom Disk System";
    this.mapperName[21] = "Konami VRC4a";
    this.mapperName[22] = "Konami VRC2a";
    this.mapperName[23] = "Konami VRC2a";
    this.mapperName[24] = "Konami VRC6";
    this.mapperName[25] = "Konami VRC4b";
    this.mapperName[32] = "Irem G-101 chip";
    this.mapperName[33] = "Taito TC0190/TC0350";
    this.mapperName[34] = "32kB ROM switch";

    this.mapperName[64] = "Tengen RAMBO-1 chip";
    this.mapperName[65] = "Irem H-3001 chip";
    this.mapperName[66] = "GNROM switch";
    this.mapperName[67] = "SunSoft3 chip";
    this.mapperName[68] = "SunSoft4 chip";
    this.mapperName[69] = "SunSoft5 FME-7 chip";
    this.mapperName[71] = "Camerica chip";
    this.mapperName[78] = "Irem 74HC161/32-based";
    this.mapperName[91] = "Pirate HK-SF3 chip";


    this.valid      = false;
    this.data       = null;
    this.header     = null;
    this.PRGBanks   = null;
    this.CHRBanks   = null;
    this.mirroring  = null;
    this.batteryRAM = null;
    this.trainer    = null;
    this.fourScreen = null;
    this.mapperId   = null;

    this.PRG        = null;
    this.CHR        = null;

  }

  reload() {

    this.load(this.data);

  }

  _getBit(data, position) { //Get's the bit from data at given position
    let pos = position || 0;
    return ((data & (Math.pow(2, pos))) >> pos);

  }

  _getBool(data, position) {
    return !!this._getBit(data, position); //Gets bit and converts to boolean
  }

  _loadChunk(data, length, offset) {
    let chunk = new Array(length);
    for (let i = 0; i < length; i++) {

      if(offset + i >= data.length) break;
      chunk[i] = data.charCodeAt(offset + i) & 0xFF;

    }
    return chunk;
  }

  load(data) {

    //Check if ROM is valid
    if(!~data.indexOf("NES\x1a")) {
      let err = new Error("ROM image not valid!")
      this.NES.fail(err)
      return callback(err);
    }

    //Should be removed in release build
    this.data = data;
    this.valid = true;

    //Get header from first 16 bytes of ROM
    this.header = new Array(16);
    for (var i = 0; i < 16; i++) {
      this.header[i] = data.charCodeAt(i) & 0xFF;
    }


    //Get header information
    this.PRGBanks             = this.header[4];
    this.CHRBanks             = this.header[5] * 2;
    this.mirroring            = this._getBool(this.header[6], 0);
    this.batteryRAM           = this._getBool(this.header[6], 1);
    this.trainer              = this._getBool(this.header[6], 2);
    this.fourScreen           = this._getBool(this.header[6], 3);
    this.mapperId             = (this.header[6] >> 4) | (this.header[7] & 0xF0);

    //Check if byte 8 to 15 of in header is 0, if not, ignore byte 7 of mapper type
    for (let j = false, i = 8; i < 16; j = !!this.header[i++]) {
      if (j) { this.mapper &= 0xF; break; }
    }

    //Load PRG into each bank
    /*let offset = 16;
    this.PRG  = new Array(this.PRGBanks);
    for(let i = 0; i < this.PRGBanks; i++) {
      this.PRG[i] = this._loadChunk(data, 0x4000, offset)
      offset += 0x4000;
    }

    //Load CHR into each bank
    this.CHR  = new Array(this.CHRBanks);
    for(let i = 0; i < this.CHRBanks; i++) {
      this.CHR[i] = this._loadChunk(data, 0x1000, offset);
      offset += 0x1000;
    }*/


    let offset = 16;
    this.PRG = this._loadChunk(this.data, this.PRGBanks * 0x4000, offset);

    //console.log(this.PRG[this.PRG.length-1]);

    offset += this.PRGBanks * 0x4000;
    this.CHR = this._loadChunk(this.data, this.CHRBanks * 0x2000, offset);


  }

  get mapperInfo() {
    return {
      name: this.mapperName[this.mapperId],
      id: this.mapperId
    };
  }

  get mapper() {
    let mapper = new Mapper[this.mapperId](this.NES);

    if(typeof mapper !== undefined)
      return mapper;

    return null;

  }

}

module.exports = ROM;
