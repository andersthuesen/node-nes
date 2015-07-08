"use strict";

/*
  Documentation:
    http://nesdev.com/6502.txt

*/

class CPU {

  constructor(NES) {

    NES = NES; //Sets reference to NES


    // http://www.6502.org/tutorials/6502opcodes.html
    var op = this.op = {

      adc: function() { },
      and: function() { },
      asl: function() { },
      bit: function() { },
      bpl: function() { },
      bmi: function() { },
      bvc: function() { },
      bvs: function() { },
      bcc: function() { },
      bcs: function() { },
      bne: function() { },
      beq: function() { },
      brk: function() { },
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
      sty: function() { }

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
      op.sed, op.sbc, op.nop, op.isc, op.nop, op.sbc, op.inc, op.isc,

    ];


    this.reset();
  }

  emulate() { //Should run the instructions

    //get opcode and

    this.registers.PC++; //Increment Program counter to move to next instruction
  }

  reset() {
    var self = this;

    this.flags = { //Sets the flags

      CARRY:      0b0,
      ZERO:       0b0,
      INTERRUPT:  0b0,
      DECIMAL:    0b0,
      OVERFLOW:   0b0,
      NEGATIVE:   0b0

    };

    this.registers = {
      PC: 0x0000, // 16-bit Program Counter
      SP: 0x00,  // Stack pointer
      A:  0x00,   // Accumulator (used in arithmetic)
      X:  0x00,   // X register
      Y:  0x00,   // Y register
      P:  0x00,   /* Processor flags (from least significant bit)
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

}

module.exports = CPU;
