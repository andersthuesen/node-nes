"use strict";

/*
  Documentation:
    http://nesdev.com/6502.txt

*/

class CPU {

  constructor(NES) {

    this.NES  = NES; //Sets reference to NES
    this.MMAP = NES.MMAP;
    let cpu   = this;


    this.stack = {

      push: function(value) {
        cpu.MMAP.write(0x100 | cpu.registers.SP, value & 0xFF);
        cpu.registers.SP--;
      },
      pull: function() {
        cpu.registers.SP++;
        return cpu.MMAP.read(0x100 | cpu.registers.SP);
      },
      push16: function(value) {
        let hi = value >> 8 & 0xFF;
        let lo = value & 0xFF;
        this.push(hi);
        this.push(lo);
      },
      pull16: function() {
        let lo = this.pull();
        let hi = this.pull();
        return hi<<8 | lo;
      }

    };

    // http://www.6502.org/tutorials/6502opcodes.html
    let op = this.op = {

      adc: function(info) { // Add with Carry

        let A = cpu.registers.A;
        let M = cpu.MMAP.read(info.address);
        let C = cpu.flags.CARRY;
        cpu.registers.A = (A + M + C) & 0xFF;
        cpu._setZN(cpu.registers.A);
        cpu.flags.CARRY = (A + M + C > 0xFF) ? 1 : 0;
        cpu.flags.OVERFLOW = ((A^M) & 0x80 == 0 && (A^cpu.registers.A) & 0x80 !== 0) ? 1 : 0;

      },
      and: function(info) { // Logical AND

        cpu.registers.A = cpu.registers.A & cpu.MMAP.read(info.address) & 0xFF;
        cpu._setZN(cpu.registers.A);

      },
      asl: function(info) { // Arithmetic Shift Left

        if(info.mode == cpu.addressingMode.accumulator) {

          cpu.registers.CARRY = (cpu.registers.A >> 7) & 1;
          cpu.registers.A = cpu.registers.A << 1 & 0xFF;
          cpu._setZN(cpu.registers.A);

        } else {

          let value = cpu.MMAP.read(info.address);
          cpu.flags.CARRY = (value >> 7) & 1;
          value = value << 7 & 0xFF;
          cpu.MMAP.write(info.address, value);
          cpu._setZN(value);

        }

      },
      bit: function(info) { // Bit test

        let value = cpu.MMAP.read(info.address);
        cpu.registers.OVERFLOW = (value >> 6) & 1;
        cpu._setZ(value & cpu.registers.A);
        cpu._setN(value);

      },
      bpl: function(info) { // Branch if Positive
        if(cpu.flags.NEGATIVE == 0) {
          cpu.registers.PC = info.address;
          cpu._addBranchCycles(info);
        }
      },
      bmi: function(info) { // Branch if minus

        if(cpu.flags.NEGATIVE !== 0) {
          cpu.registers.PC = info.address;
          cpu._addBranchCycles(info);
        }

      },
      bvc: function(info) { // Branch if Overflow Clear

        if(cpu.flags.OVERFLOW == 0) {
          cpu.registers.PC = info.address;
          cpu._addBranchCycles(info);
        }

      },
      bvs: function(info) { // Branch if Overflow Set

        if(cpu.flags.OVERFLOW !== 0) {
          cpu.registers.PC = info.address;
          cpu._addBranchCycles(info);
        }

      },
      bcc: function(info) {

        if(cpu.flags.CARRY == 0) {
          cpu.registers.PC = info.address;
          cpu._addBranchCycles(info);
        }

      },
      bcs: function(info) {
        if(cpu.flags.CARRY !== 0) {
          cpu.registers.PC = info.address;
          cpu._addBranchCycles(info);
        }
      },
      bne: function(info) { // Branch if Not Equal
        if(cpu.flags.ZERO == 0) {
          cpu.registers.PC = info.address;
          cpu._addBranchCycles(info);
        }
      },
      beq: function(info) {

        if(cpu.flags.ZERO !== 0) {
          cpu.registers.PC = info.address;
          cpu._addBranchCycles(info);
        }

      },
      brk: function(info) {
        cpu.stack.push16(cpu.registers.PC);
        this.php(info);
        this.sei(info);
        cpu.registers.PC = cpu.MMAP.read16(0xFFFE);
      },
      cmp: function() { },
      cpx: function() { },
      cpy: function() { },
      dec: function() { },
      eor: function() { },
      clc: function() { },
      sec: function() { },
      cli: function() { },
      sei: function() { },
      cli: function() { },
      sei: function() { },
      clv: function() { },
      cld: function() { },
      sed: function() { },
      inc: function() { },
      jmp: function() { },
      jsr: function() { },
      lda: function() { },
      ldx: function() { },
      ldy: function() { },
      lsr: function() { },
      nop: function() { },
      ora: function() { },
      tax: function() { },
      txa: function() { },
      dex: function() { },
      inx: function() { },
      tay: function() { },
      tya: function() { },
      dey: function() { },
      iny: function() { },
      rol: function() { },
      ror: function() { },
      rti: function() { },
      rts: function() { },
      sbc: function() { },
      sta: function() { },
      txs: function() { },
      tsx: function() { },
      pha: function() { },
      pla: function() { },
      php: function() { },
      plp: function() { },
      stx: function() { },
      sty: function() { },
      slo: function() { }

    };

    this.addressingMode = {
      absolute:         0,
      absoluteX:        1,
      absoluteY:        2,
      accumulator:      3,
      immediate:        4,
      implied:          5,
      indexedIndirect:  6,
      indirect:         7,
      indirectIndexed:  8,
      relative:         9,
      zeroPage:         10,
      zeroPageX:        11,
      zeroPageY:        12
    };

    this.instructions = [

      op.brk, op.ora, op.kil, op.slo, op.nop, op.ora, op.asl, op.slo,
      op.php, op.ora, op.asl, op.anc, op.nop, op.ora, op.asl, op.slo,
      op.bpl, op.ora, op.kil, op.slo, op.nop, op.ora, op.asl, op.slo,
      op.clc, op.ora, op.nop, op.slo, op.nop, op.ora, op.asl, op.slo,
      op.jsr, op.und, op.kil, op.rla, op.bit, op.und, op.rol, op.rla,
      op.plp, op.und, op.rol, op.anc, op.bit, op.und, op.rol, op.rla,
      op.bmi, op.und, op.kil, op.rla, op.nop, op.und, op.rol, op.rla,
      op.sec, op.und, op.nop, op.rla, op.nop, op.und, op.rol, op.rla,
      op.rti, op.eor, op.kil, op.sre, op.nop, op.eor, op.lsr, op.sre,
      op.pha, op.eor, op.lsr, op.alr, op.jmp, op.eor, op.lsr, op.sre,
      op.bvc, op.eor, op.kil, op.sre, op.nop, op.eor, op.lsr, op.sre,
      op.cli, op.eor, op.nop, op.sre, op.nop, op.eor, op.lsr, op.sre,
      op.rts, op.adc, op.kil, op.rra, op.nop, op.adc, op.ror, op.rra,
      op.pla, op.adc, op.ror, op.arr, op.jmp, op.adc, op.ror, op.rra,
      op.bvs, op.adc, op.kil, op.rra, op.nop, op.adc, op.ror, op.rra,
      op.sei, op.adc, op.nop, op.rra, op.nop, op.adc, op.ror, op.rra,
      op.nop, op.sta, op.nop, op.sax, op.sty, op.sta, op.stx, op.sax,
      op.dey, op.nop, op.txa, op.xaa, op.sty, op.sta, op.stx, op.sax,
      op.bcc, op.sta, op.kil, op.ahx, op.sty, op.sta, op.stx, op.sax,
      op.tya, op.sta, op.txs, op.tas, op.shy, op.sta, op.shx, op.ahx,
      op.ldy, op.lda, op.ldx, op.lax, op.ldy, op.lda, op.ldx, op.lax,
      op.tay, op.lda, op.tax, op.lax, op.ldy, op.lda, op.ldx, op.lax,
      op.bcs, op.lda, op.kil, op.lax, op.ldy, op.lda, op.ldx, op.lax,
      op.clv, op.lda, op.tsx, op.las, op.ldy, op.lda, op.ldx, op.lax,
      op.cpy, op.cmp, op.nop, op.dcp, op.cpy, op.cmp, op.dec, op.dcp,
      op.iny, op.cmp, op.dex, op.axs, op.cpy, op.cmp, op.dec, op.dcp,
      op.bne, op.cmp, op.kil, op.dcp, op.nop, op.cmp, op.dec, op.dcp,
      op.cld, op.cmp, op.nop, op.dcp, op.nop, op.cmp, op.dec, op.dcp,
      op.cpx, op.sbc, op.nop, op.isc, op.cpx, op.sbc, op.inc, op.isc,
      op.inx, op.sbc, op.nop, op.sbc, op.cpx, op.sbc, op.inc, op.isc,
      op.beq, op.sbc, op.kil, op.isc, op.nop, op.sbc, op.inc, op.isc,
      op.sed, op.sbc, op.nop, op.isc, op.nop, op.sbc, op.inc, op.isc

    ];
    this.instructionsNames = [

      "brk", "ora", "kil", "slo", "nop", "ora", "asl", "slo",
      "php", "ora", "asl", "anc", "nop", "ora", "asl", "slo",
      "bpl", "ora", "kil", "slo", "nop", "ora", "asl", "slo",
      "clc", "ora", "nop", "slo", "nop", "ora", "asl", "slo",
      "jsr", "und", "kil", "rla", "bit", "und", "rol", "rla",
      "plp", "und", "rol", "anc", "bit", "und", "rol", "rla",
      "bmi", "und", "kil", "rla", "nop", "und", "rol", "rla",
      "sec", "und", "nop", "rla", "nop", "und", "rol", "rla",
      "rti", "eor", "kil", "sre", "nop", "eor", "lsr", "sre",
      "pha", "eor", "lsr", "alr", "jmp", "eor", "lsr", "sre",
      "bvc", "eor", "kil", "sre", "nop", "eor", "lsr", "sre",
      "cli", "eor", "nop", "sre", "nop", "eor", "lsr", "sre",
      "rts", "adc", "kil", "rra", "nop", "adc", "ror", "rra",
      "pla", "adc", "ror", "arr", "jmp", "adc", "ror", "rra",
      "bvs", "adc", "kil", "rra", "nop", "adc", "ror", "rra",
      "sei", "adc", "nop", "rra", "nop", "adc", "ror", "rra",
      "nop", "sta", "nop", "sax", "sty", "sta", "stx", "sax",
      "dey", "nop", "txa", "xaa", "sty", "sta", "stx", "sax",
      "bcc", "sta", "kil", "ahx", "sty", "sta", "stx", "sax",
      "tya", "sta", "txs", "tas", "shy", "sta", "shx", "ahx",
      "ldy", "lda", "ldx", "lax", "ldy", "lda", "ldx", "lax",
      "tay", "lda", "tax", "lax", "ldy", "lda", "ldx", "lax",
      "bcs", "lda", "kil", "lax", "ldy", "lda", "ldx", "lax",
      "clv", "lda", "tsx", "las", "ldy", "lda", "ldx", "lax",
      "cpy", "cmp", "nop", "dcp", "cpy", "cmp", "dec", "dcp",
      "iny", "cmp", "dex", "axs", "cpy", "cmp", "dec", "dcp",
      "bne", "cmp", "kil", "dcp", "nop", "cmp", "dec", "dcp",
      "cld", "cmp", "nop", "dcp", "nop", "cmp", "dec", "dcp",
      "cpx", "sbc", "nop", "isc", "cpx", "sbc", "inc", "isc",
      "inx", "sbc", "nop", "sbc", "cpx", "sbc", "inc", "isc",
      "beq", "sbc", "kil", "isc", "nop", "sbc", "inc", "isc",
      "sed", "sbc", "nop", "isc", "nop", "sbc", "inc", "isc"

    ];


    this.instructionModes = [

      5, 6, 5, 6, 10, 10, 10, 10, 5, 4, 3, 4, 0, 0, 0, 0,
      9, 8, 5, 8, 11, 11, 11, 11, 5, 2, 5, 2, 1, 1, 1, 1,
      0, 6, 5, 6, 10, 10, 10, 10, 5, 4, 3, 4, 0, 0, 0, 0,
      9, 8, 5, 8, 11, 11, 11, 11, 5, 2, 5, 2, 1, 1, 1, 1,
      5, 6, 5, 6, 10, 10, 10, 10, 5, 4, 3, 4, 0, 0, 0, 0,
      9, 8, 5, 8, 11, 11, 11, 11, 5, 2, 5, 2, 1, 1, 1, 1,
      5, 6, 5, 6, 10, 10, 10, 10, 5, 4, 3, 4, 7, 0, 0, 0,
      9, 8, 5, 8, 11, 11, 11, 11, 5, 2, 5, 2, 1, 1, 1, 1,
      4, 6, 4, 6, 10, 10, 10, 10, 5, 4, 5, 4, 0, 0, 0, 0,
      9, 8, 5, 8, 11, 11, 12, 12, 5, 2, 5, 2, 1, 1, 2, 2,
      4, 6, 4, 6, 10, 10, 10, 10, 5, 4, 5, 4, 0, 0, 0, 0,
      9, 8, 5, 8, 11, 11, 12, 12, 5, 2, 5, 2, 1, 1, 2, 2,
      4, 6, 4, 6, 10, 10, 10, 10, 5, 4, 5, 4, 0, 0, 0, 0,
      9, 8, 5, 8, 11, 11, 11, 11, 5, 2, 5, 2, 1, 1, 1, 1,
      4, 6, 4, 6, 10, 10, 10, 10, 5, 4, 5, 4, 0, 0, 0, 0,
      9, 8, 5, 8, 11, 11, 11, 11, 5, 2, 5, 2, 1, 1, 1, 1

    ];

    this.instructionSizes = [
      1, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
      2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
      3, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
      2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
      1, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
      2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
      1, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
      2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
      2, 2, 0, 0, 2, 2, 2, 0, 1, 0, 1, 0, 3, 3, 3, 0,
      2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 0, 3, 0, 0,
      2, 2, 2, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
      2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
      2, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
      2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
      2, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
      2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0
    ];

    this.instructionCycles = [
      7, 6, 2, 8, 3, 3, 5, 5, 3, 2, 2, 2, 4, 4, 6, 6,
      2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7,
      6, 6, 2, 8, 3, 3, 5, 5, 4, 2, 2, 2, 4, 4, 6, 6,
      2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7,
      6, 6, 2, 8, 3, 3, 5, 5, 3, 2, 2, 2, 3, 4, 6, 6,
      2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7,
      6, 6, 2, 8, 3, 3, 5, 5, 4, 2, 2, 2, 5, 4, 6, 6,
      2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7,
      2, 6, 2, 6, 3, 3, 3, 3, 2, 2, 2, 2, 4, 4, 4, 4,
      2, 6, 2, 6, 4, 4, 4, 4, 2, 5, 2, 5, 5, 5, 5, 5,
      2, 6, 2, 6, 3, 3, 3, 3, 2, 2, 2, 2, 4, 4, 4, 4,
      2, 5, 2, 5, 4, 4, 4, 4, 2, 4, 2, 4, 4, 4, 4, 4,
      2, 6, 2, 8, 3, 3, 5, 5, 2, 2, 2, 2, 4, 4, 6, 6,
      2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7,
      2, 6, 2, 8, 3, 3, 5, 5, 2, 2, 2, 2, 4, 4, 6, 6,
      2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7

    ];

    this.instructionPageCycles = [

      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0

    ];

    this.haltCycles = null; //Numbers of cycles to halt
    this.cycles     = null;
    this.flags      = null; //CPU flags
    this.registers  = null;
    this.stepInfo   = null;

    /*
      TODO
      - Implement interrupts

    */

    this.reset();
  }

  _setZ(value) { // Sets Zero registers if value is zero
    let flag = (value == 0 ? 1: 0);
    this.NES.log(`Settings Zero flag to ${flag}`);
    this.registers.Zero = flag;
  }

  _setN(value) {
    let flag = (value & 0x80 !== 0 ? 1 : 0);
    this.NES.log(`Settings Negative flag to ${flag}`);
    this.registers.Negative = flag;
  }

  _setZN(value) {
    this._setZ(value);
    this._setN(value);
  }

  _addBranchCycles(info) {

    this.cycles++;
    if(this._pagesDiffer(info.pc, info.address)) {
      this.cycles++;
    }

  }
  _pagesDiffer(a, b) { // Checks if the two addresses references different pages
    return (a & 0xFF00) !== (a & 0xFF00);
  }

  _getAddress(mode) { // Finds addressmode and returns address

    let cpu         = this; //Lets create some shortcuts.
      cpu.read      = function(addr) { return cpu.MMAP.read(addr) };
      cpu.read16    = function(addr) { return cpu.MMAP.read16(addr) };
      cpu.read16bug = function(addr) { return cpu.MMAP.read16bug(addr) };
      cpu.write     = function(addr, val) { return cpu.MMAP.write(addr, val) };
      cpu.write16   = function(addr, val) { return cpu.MMAP.write16(addr, val) };

    let modes     = cpu.addressingMode;
    let pageCross = false;
    let address   = null;

    switch(mode) { // Get address in comparison with addressing mode.

      case modes.absolute:
        address = cpu.read16(cpu.registers.PC + 1);
        break;
      case modes.absoluteX:
        address = cpu.read16(cpu.registers.PC + 1) + cpu.registers.X;
        pageCross = cpu._pagesDiffer(address - cpu.registers.X, address);
        break;
      case modes.absoluteY:
        address = cpu.read16(cpu.registers.PC + 1) + cpu.registers.Y;
        pageCross = cpu._pagesDiffer(address - cpu.registers.Y, address);
        break;
      case modes.accumulator:
        address = 0;
        break;
      case modes.immediate:
        address = cpu.registers.PC + 1;
        break;
      case modes.implied:
        address = 0;
        break;
      case modes.indexedIndirect:
        address = cpu.read16bug(cpu.read(cpu.registers.PC+1) + cpu.registers.X);
        break;
      case modes.indirect:
        address = cpu.read16bug(cpu.read16(cpu.registers.PC + 1));
        break;
      case modes.indirectIndexed:
        address = cpu.read16bug(cpu.read(cpu.registers.PC+1)) + cpu.registers.Y;
        pageCross = cpu._pagesDiffer(address - cpu.registers.Y, address);
        break;
      case modes.relative:
        let offset = cpu.read(cpu.registers.PC+1);
        if(offset < 0x80) {
          address = cpu.registers.PC + 2 + offset;
        } else {
          address = cpu.registers.PC + 2 + offset - 0x100;
        }
        break;
      case modes.zeroPage:
        address = cpu.read(cpu.registers.PC + 1);
        break;
      case modes.zeroPageX:
        address = cpu.read(cpu.registers.PC + 1) + cpu.registers.X;
        break;
      case modes.zeroPageY:
        address = cpu.read(cpu.registers.PC + 1) + cpu.registers.Y;
        break;
      default:
        this.NES.fail("Invalid addressing mode.");
        break;
    }

    if(pageCross) { // Add extra cycles for opcode.
      cpu.cycles += cpu.instructionPageCycles[opcode];
    }

    return address;


  }

  reset() {
    let self = this;


    this.haltCycles = 0; //Numbers of cycles to halt
    this.cycles     = 0;

    this.flags = { //Sets the flags

      CARRY:      0b0,
      ZERO:       0b0,
      INTERRUPT:  0b0,
      DECIMAL:    0b0,
      OVERFLOW:   0b0,
      NEGATIVE:   0b0

    };

    this.registers = {
      PC: this.NES.MMAP.read16(0xFFFC), // 16-bit Program Counter from reset vector
      SP: 0xFD,  // Stack pointer
      A:  0x00,   // Accumulator (used in arithmetic)
      X:  0x00,   // X register
      Y:  0x00,   // Y register
      P:  0x24,   /* Processor flags (from least significant bit)
                   *  (Carry, Zero, op.Interrupt disable, op.Decimal mode, op.Break, op.Overflow, op.Negative)
                   */

      get P() { //Gets the byte of flags by combining the individual flags in self.flags

        return  (self.flags.CARRY     << 0) |
                (self.flags.ZERO      << 1) |
                (self.flags.INTERRUPT << 2) |
                (self.flags.DECIMAL   << 3) |
                (self.flags.BREAK     << 4) |
                (1                    << 5) | //Should always be 1 according to documentation
                (self.flags.OVERFLOW  << 6) |
                (self.flags.NEGATIVE  << 7);
                //OCD? Yes.

      },

      set P(flags) {

        self.flags.CARRY      = (flags & 0b1)         >> 0;
        self.flags.ZERO       = (flags & 0b10)        >> 1;
        self.flags.INTERRUPT  = (flags & 0b100)       >> 2;
        self.flags.DECIMAL    = (flags & 0b1000)      >> 3;
        self.flags.BREAK      = (flags & 0b10000)     >> 4;
        self.flags.OVERFLOW   = (flags & 0b1000000)   >> 6;
        self.flags.NEGATIVE   = (flags & 0b10000000)  >> 7;

      }

    };
  }



  step() { //Should run the next instructions

    if (this.haltCycles > 0) {
      this.haltCycles--;
      return;
    }

    let cpu       = this;
    let cycles    = cpu.cycles;
    let opcode    = this.MMAP.read(cpu.registers.PC);
    let mode      = cpu.instructionModes[opcode];
    let info      = null;
    let address   = cpu._getAddress(mode);


    info = {
      address: address,
      pc: cpu.registers.PC,
      registers: cpu.registers,
      mode: mode
    };

    cpu.cycles        += cpu.instructionCycles[opcode]; // Increase cycles for given operation
    this.registers.PC += this.instructionSizes[opcode];

    // Execute instruction
    let instruction = cpu.instructions[opcode];
    if(typeof instruction == undefined) {
      this.NES.fail("Illegal instruction:", cpu.instructionsNames[opcode].toUpperCase());
      return 0;
    }

    this.NES.log(`Flags: ${this.registers.P.toString(2)}`);
    this.NES.log(`Executing instruction ${cpu.instructionsNames[opcode].toUpperCase()} with address mode ${mode}`);

    instruction(info);
    return (cpu.cycles - cycles);

  }


}

module.exports = CPU;
