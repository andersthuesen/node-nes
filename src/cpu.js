"use strict";

/*
  Documentation:
    http://nesdev.com/6502.txt

*/

class CPU {

  constructor(NES) {

    this.NES = NES; //Sets reference to NES
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
      SP: 0x00,   // Stack pointer
      P:  0x00,   /* Processor flags (from least significant bit)
                   *  (Carry, Zero, Interrupt disable, Decimal mode, Break, Overflow, Negative)
                   */

      get P() { //Gets the byte of flags by combining the individual flags in self.flags

        return  (self.flags.CARRY)          |
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

        self.flags.CARRY      = (flags & 0b1);
        self.flags.ZERO       = (flags & 0b10)        >> 1;
        self.flags.INTERRUPT  = (flags & 0b100)       >> 2;
        self.flags.DECIMAL    = (flags & 0b1000)      >> 3;
        self.flags.BREAK      = (flags & 0b10000)     >> 4;
        self.flags.OVERFLOW   = (flags & 0b1000000)   >> 6;
        self.flags.NEGATIVE   = (flags & 0b10000000)  >> 7;

      },

      A:  0x00,   // Accumulator (used in arithmetic)
      X:  0x00,   // X register
      Y:  0x00    // Y register
    };


  }

  emulate() { //Should run the instructions

  }

  reset() {

  }

}

module.exports = CPU;
