import type { VMState } from './types'
import { OPCODE_TO_KEY, opcodeDigit } from './opcodes'
import { toRad, fromRad } from './math'

export function pushStack(s: VMState) {
  s.T = s.Z
  s.Z = s.Y
  s.Y = s.X
}

export function popStack(s: VMState) {
  const top = s.X
  s.X = s.Y
  s.Y = s.Z
  s.Z = s.T
  return top
}

export function triggerError(s: VMState, type = 'ЕГГОГ') {
  s.isError = true
  s.errorType = type
}

export function executeFFunction(s: VMState, key: string) {
  switch (key) {
    case '1': s.X = Math.exp(s.X); break
    case '2':
      if (s.X <= 0) { triggerError(s); return }
      s.X = Math.log10(s.X); break
    case '3':
      if (s.X <= 0) { triggerError(s); return }
      s.X = Math.log(s.X); break
    case '7': s.X = Math.sin(toRad(s.X, s.angleUnit)); break
    case '8': s.X = Math.cos(toRad(s.X, s.angleUnit)); break
    case '9': s.X = Math.tan(toRad(s.X, s.angleUnit)); break
    case '4': s.X = fromRad(Math.asin(s.X), s.angleUnit); break
    case '5': s.X = fromRad(Math.acos(s.X), s.angleUnit); break
    case '6': s.X = fromRad(Math.atan(s.X), s.angleUnit); break
    case '+':
      pushStack(s)
      s.X = Math.PI; break
    case '/':
      if (s.X === 0) { triggerError(s); return }
      s.X = 1 / s.X; break
    case '*': s.X = Math.pow(s.X, 2); break
    case '-':
      if (s.X < 0) { triggerError(s); return }
      s.X = Math.sqrt(s.X); break
    case 'SWAP': {
      const y = s.Y
      s.X = Math.pow(y, s.X); break
    }
    case 'ENTER': s.X = s.X1; break
    case '0': s.X = Math.pow(10, s.X); break
    case 'P': s.pendingMemoryOp = 'P'; break
    case 'IP': s.pendingMemoryOp = 'IP'; break
  }
}

export function executeKFunction(s: VMState, key: string) {
  switch (key) {
    case '7': s.X = s.X - Math.floor(s.X); break
    case '8': s.X = Math.trunc(s.X); break
    case '4': s.X = Math.abs(s.X); break
    case '5': s.X = Math.sign(s.X); break
    default:
      if (key >= '0' && key <= '9') {
        const idx = parseInt(key)
        s.X = s.memory[idx <= 4 ? idx + 10 : idx] || 0
      }
      break
  }
}

export function executeOneStep(s: VMState): boolean {
  const code = s.programRAM[s.pc].code

  const peek = (offset: number = 1) => s.programRAM[(s.pc + offset) % 105].code

  const advance = (n: number = 1) => { s.pc = (s.pc + n) % 105 }

  switch (code) {
    case '00': case '01': case '02': case '03': case '04':
    case '05': case '06': case '07': case '08': case '09': {
      const digit = opcodeDigit(code)
      s.X1 = s.X
      if (!s.isEnteringNum) {
        pushStack(s)
        s.inputStr = String(digit)
        s.isEnteringNum = true
        s.hasDot = false
        s.enteringExp = false
      } else {
        if (s.inputStr.replace(/[^0-9]/g, '').length < 8) {
          s.inputStr += String(digit)
        }
      }
      s.X = parseFloat(s.inputStr)
      advance(); return true
    }

    case '0A': {
      s.X1 = s.X
      if (!s.isEnteringNum) {
        pushStack(s)
        s.inputStr = '0.'
        s.isEnteringNum = true
        s.hasDot = true
      } else if (!s.hasDot) {
        s.inputStr += '.'
        s.hasDot = true
      }
      s.X = parseFloat(s.inputStr)
      advance(); return true
    }

    case '0B':
      if (s.isEnteringNum) {
        s.inputStr = s.inputStr.startsWith('-') ? s.inputStr.slice(1) : '-' + s.inputStr
        s.X = parseFloat(s.inputStr)
      } else {
        s.X1 = s.X
        s.X = -s.X
      }
      advance(); return true

    case '0C':
      s.X1 = s.X
      if (!s.isEnteringNum) {
        pushStack(s)
        s.inputStr = '1'
        s.isEnteringNum = true
        s.hasDot = false
      }
      s.enteringExp = true
      s.expStr = ''
      advance(); return true

    case '0D':
      s.inputStr = '0'
      s.X = 0
      s.isEnteringNum = false
      advance(); return true

    case '0E':
      s.T = s.Z; s.Z = s.Y; s.Y = s.X
      s.isEnteringNum = false
      advance(); return true

    case '10': {
      const reg = opcodeDigit(peek())
      s.memory[reg] = s.X
      advance(2); return true
    }

    case '11': {
      const reg = opcodeDigit(peek())
      s.X = s.memory[reg] || 0
      s.isEnteringNum = false
      advance(2); return true
    }

    case '12': {
      const hi = opcodeDigit(peek(1))
      const lo = opcodeDigit(peek(2))
      s.pc = hi * 10 + lo
      return true
    }

    case '13': {
      s.returnAddr = (s.pc + 3) % 105
      const hi = opcodeDigit(peek(1))
      const lo = opcodeDigit(peek(2))
      s.pc = hi * 10 + lo
      return true
    }

    case '14':
      advance()
      if (s.returnAddr !== null) {
        s.pc = s.returnAddr
        s.returnAddr = null
        return true
      }
      return false

    case '15':
      s.pc = 0
      s.isEnteringNum = false
      return true

    case '16':
      s.X1 = s.X; { const t = s.X; s.X = s.Y; s.Y = t }
      s.isEnteringNum = false
      advance(); return true

    case '17':
      s.X1 = s.X; { const b = s.X; popStack(s); s.X = s.X + b }
      advance(); return true

    case '18':
      s.X1 = s.X; { const b = s.X; popStack(s); s.X = s.X - b }
      advance(); return true

    case '19':
      s.X1 = s.X; { const b = s.X; popStack(s); s.X = s.X * b }
      advance(); return true

    case '1A': {
      const b = s.X; popStack(s)
      if (b === 0) { triggerError(s); return false }
      s.X1 = s.X; s.X = s.X / b
      advance(); return true
    }

    case '1B':
      advance(); return true

    case '1C':
      s.pc = (s.pc - 1 + 105) % 105
      return true

    case '1D': {
      const funcCode = peek()
      s.X1 = s.X
      const key = OPCODE_TO_KEY[funcCode]

      const condMap: Record<string, (x: number) => boolean> = {
        'STEP_BACK': (x) => x < 0,
        'STEP_FWD': (x) => x === 0,
        'VO': (x) => x >= 0,
        'SP': (x) => x !== 0,
      }

      const cond = key ? condMap[key] : undefined
      if (cond) {
        const hi = opcodeDigit(peek(2))
        const lo = opcodeDigit(peek(3))
        if (cond(s.X)) {
          s.pc = hi * 10 + lo
        } else {
          advance(4)
        }
        return true
      }

      if (key) executeFFunction(s, key)
      advance(2); return !s.isError
    }

    case '1E': {
      const funcCode = peek()
      s.X1 = s.X
      const key = OPCODE_TO_KEY[funcCode]
      if (key) executeKFunction(s, key)
      advance(2); return !s.isError
    }

    default:
      advance(); return true
  }
}
