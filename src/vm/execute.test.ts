import { describe, it, expect } from 'vitest'
import type { VMState } from './types'
import { pushStack, popStack, executeFFunction, executeKFunction, executeOneStep, triggerError } from './execute'

function createState(overrides?: Partial<VMState>): VMState {
  return {
    mode: 'AVT',
    angleUnit: 'RAD',
    X: 0, Y: 0, Z: 0, T: 0, X1: 0,
    inputStr: '0',
    isEnteringNum: false,
    hasDot: false,
    enteringExp: false,
    expStr: '',
    memory: new Array(15).fill(0),
    programRAM: Array.from({ length: 105 }, (_, i) => ({ code: '00', mnemonic: 'НОП' })),
    pc: 0,
    isProgramRunning: false,
    returnAddr: null,
    isError: false,
    errorType: null,
    pendingMemoryOp: null,
    ...overrides,
  }
}

function setMemory(s: VMState, idx: number, val: number) {
  s.memory = [...s.memory]
  s.memory[idx] = val
}

function setPgm(s: VMState, codes: string[]) {
  s.programRAM = codes.map((code, i) => ({ code, mnemonic: code }))
  while (s.programRAM.length < 105) {
    s.programRAM.push({ code: '00', mnemonic: 'НОП' })
  }
}

describe('pushStack / popStack', () => {
  it('pushStack shifts T←Z←Y←X', () => {
    const s = createState({ X: 1, Y: 2, Z: 3, T: 4 })
    pushStack(s)
    expect(s.T).toBe(3)
    expect(s.Z).toBe(2)
    expect(s.Y).toBe(1)
    expect(s.X).toBe(1)
  })

  it('popStack returns old X and shifts X←Y←Z←T', () => {
    const s = createState({ X: 1, Y: 2, Z: 3, T: 4 })
    const oldX = popStack(s)
    expect(oldX).toBe(1)
    expect(s.X).toBe(2)
    expect(s.Y).toBe(3)
    expect(s.Z).toBe(4)
    expect(s.T).toBe(4)
  })

  it('push then pop restores previous state modulo T', () => {
    const s = createState({ X: 1, Y: 2, Z: 3, T: 4 })
    pushStack(s)
    popStack(s)
    expect(s.X).toBe(1)
    expect(s.Y).toBe(2)
    expect(s.Z).toBe(3)
    expect(s.T).toBe(3)
  })
})

describe('triggerError', () => {
  it('sets isError and errorType', () => {
    const s = createState()
    triggerError(s, 'ЕГГОГ')
    expect(s.isError).toBe(true)
    expect(s.errorType).toBe('ЕГГОГ')
  })
})

describe('executeFFunction', () => {
  it('F+1 (e^x)', () => {
    const s = createState({ X: 1 })
    executeFFunction(s, '1')
    expect(s.X).toBeCloseTo(Math.E)
  })

  it('F+2 (lg): X=100 => 2', () => {
    const s = createState({ X: 100 })
    executeFFunction(s, '2')
    expect(s.X).toBeCloseTo(2)
  })

  it('F+2 (lg): X=0 => error', () => {
    const s = createState({ X: 0 })
    executeFFunction(s, '2')
    expect(s.isError).toBe(true)
  })

  it('F+3 (ln): X=1 => 0', () => {
    const s = createState({ X: 1 })
    executeFFunction(s, '3')
    expect(s.X).toBeCloseTo(0)
  })

  it('F+7 (sin): 30 DEG => 0.5', () => {
    const s = createState({ X: 30, angleUnit: 'DEG' })
    executeFFunction(s, '7')
    expect(s.X).toBeCloseTo(0.5)
  })

  it('F++ (π)', () => {
    const s = createState({ X: 0 })
    executeFFunction(s, '+')
    expect(s.X).toBeCloseTo(Math.PI)
    expect(s.Y).toBe(0)
  })

  it('F+/ (1/x): X=2 => 0.5', () => {
    const s = createState({ X: 2 })
    executeFFunction(s, '/')
    expect(s.X).toBeCloseTo(0.5)
  })

  it('F+/ (1/x): X=0 => error', () => {
    const s = createState({ X: 0 })
    executeFFunction(s, '/')
    expect(s.isError).toBe(true)
  })

  it('F+* (x²): X=5 => 25', () => {
    const s = createState({ X: 5 })
    executeFFunction(s, '*')
    expect(s.X).toBe(25)
  })

  it('F+- (√): X=25 => 5', () => {
    const s = createState({ X: 25 })
    executeFFunction(s, '-')
    expect(s.X).toBe(5)
  })

  it('F+- (√): X=-1 => error', () => {
    const s = createState({ X: -1 })
    executeFFunction(s, '-')
    expect(s.isError).toBe(true)
  })

  it('F+SWAP (xʸ): X=2, Y=3 => 9', () => {
    const s = createState({ X: 2, Y: 3 })
    executeFFunction(s, 'SWAP')
    expect(s.X).toBe(9)
  })

  it('F+ENTER (Bx): restores X1', () => {
    const s = createState({ X: 100, X1: 50 })
    executeFFunction(s, 'ENTER')
    expect(s.X).toBe(50)
  })

  it('F+0 (10ˣ): X=2 => 100', () => {
    const s = createState({ X: 2 })
    executeFFunction(s, '0')
    expect(s.X).toBe(100)
  })

  it('F+P sets pendingMemoryOp=P', () => {
    const s = createState()
    executeFFunction(s, 'P')
    expect(s.pendingMemoryOp).toBe('P')
  })

  it('F+IP sets pendingMemoryOp=IP', () => {
    const s = createState()
    executeFFunction(s, 'IP')
    expect(s.pendingMemoryOp).toBe('IP')
  })
})

describe('executeKFunction', () => {
  it('K+7 (fractional part): X=3.14 => 0.14', () => {
    const s = createState({ X: 3.14 })
    executeKFunction(s, '7')
    expect(s.X).toBeCloseTo(0.14, 10)
  })

  it('K+8 (integer part): X=3.14 => 3', () => {
    const s = createState({ X: 3.14 })
    executeKFunction(s, '8')
    expect(s.X).toBe(3)
  })

  it('K+4 (abs): X=-5 => 5', () => {
    const s = createState({ X: -5 })
    executeKFunction(s, '4')
    expect(s.X).toBe(5)
  })

  it('K+5 (sign): X=-5 => -1', () => {
    const s = createState({ X: -5 })
    executeKFunction(s, '5')
    expect(s.X).toBe(-1)
  })

  it('K+5 (sign): X=0 => 0', () => {
    const s = createState({ X: 0 })
    executeKFunction(s, '5')
    expect(s.X).toBe(0)
  })

  it('K+5 (sign): X=5 => 1', () => {
    const s = createState({ X: 5 })
    executeKFunction(s, '5')
    expect(s.X).toBe(1)
  })

  it('K+0 reads memory[10] (register A)', () => {
    const s = createState()
    setMemory(s, 10, 42)
    setMemory(s, 0, 99)
    executeKFunction(s, '0')
    expect(s.X).toBe(42)
  })

  it('K+1 reads memory[11] (register B)', () => {
    const s = createState()
    setMemory(s, 11, 77)
    executeKFunction(s, '1')
    expect(s.X).toBe(77)
  })

  it('K+2 reads memory[12] (register C)', () => {
    const s = createState()
    setMemory(s, 12, 33)
    executeKFunction(s, '2')
    expect(s.X).toBe(33)
  })

  it('K+3 reads memory[13] (register D)', () => {
    const s = createState()
    setMemory(s, 13, 55)
    executeKFunction(s, '3')
    expect(s.X).toBe(55)
  })

  it('K+6 reads memory[6] (unlabeled, fallback to default)', () => {
    const s = createState()
    setMemory(s, 6, 88)
    executeKFunction(s, '6')
    expect(s.X).toBe(88)
  })

  it('K+9 reads memory[9] (unlabeled, fallback to default)', () => {
    const s = createState()
    setMemory(s, 9, 11)
    executeKFunction(s, '9')
    expect(s.X).toBe(11)
  })

  it('K+0 does NOT conflict with |x| (K+4)', () => {
    const s = createState()
    setMemory(s, 10, 42)
    setMemory(s, 4, 99)
    executeKFunction(s, '0')
    expect(s.X).toBe(42)
  })
})

describe('executeOneStep', () => {
  it('digit: first digit pushes stack', () => {
    const s = createState({ X: 5, Y: 3 })
    setPgm(s, ['01'])
    executeOneStep(s)
    expect(s.X).toBe(1)
    expect(s.Y).toBe(5)
    expect(s.pc).toBe(1)
  })

  it('digit: subsequent digits append to inputStr', () => {
    const s = createState({ isEnteringNum: true, inputStr: '1', X: 1 })
    setPgm(s, ['02'])
    executeOneStep(s)
    expect(s.inputStr).toBe('12')
    expect(s.X).toBe(12)
    expect(s.pc).toBe(1)
  })

  it('0A (DOT): starts decimal input', () => {
    const s = createState({ X: 5, Y: 3 })
    setPgm(s, ['0A'])
    executeOneStep(s)
    expect(s.X).toBeCloseTo(0)
    expect(s.hasDot).toBe(true)
    expect(s.pc).toBe(1)
  })

  it('0B (CHS): negates X when not entering num', () => {
    const s = createState({ X: 42 })
    setPgm(s, ['0B'])
    executeOneStep(s)
    expect(s.X).toBe(-42)
    expect(s.pc).toBe(1)
  })

  it('0D (CX): clears X', () => {
    const s = createState({ X: 42, isEnteringNum: true, inputStr: '42' })
    setPgm(s, ['0D'])
    executeOneStep(s)
    expect(s.X).toBe(0)
    expect(s.isEnteringNum).toBe(false)
    expect(s.pc).toBe(1)
  })

  it('0E (ENTER): pushes X to Y', () => {
    const s = createState({ X: 7, Y: 0, Z: 0, T: 0 })
    setPgm(s, ['0E'])
    executeOneStep(s)
    expect(s.Y).toBe(7)
    expect(s.isEnteringNum).toBe(false)
    expect(s.pc).toBe(1)
  })

  it('0C (VP): enters exponent mode', () => {
    const s = createState()
    setPgm(s, ['0C'])
    executeOneStep(s)
    expect(s.enteringExp).toBe(true)
    expect(s.pc).toBe(1)
  })

  it('16 (SWAP): exchanges X and Y', () => {
    const s = createState({ X: 1, Y: 2 })
    setPgm(s, ['16'])
    executeOneStep(s)
    expect(s.X).toBe(2)
    expect(s.Y).toBe(1)
    expect(s.pc).toBe(1)
  })

  it('17 (+): adds Y and X', () => {
    const s = createState({ X: 3, Y: 7 })
    setPgm(s, ['17'])
    executeOneStep(s)
    expect(s.X).toBe(10)
    expect(s.pc).toBe(1)
  })

  it('18 (-): subtracts', () => {
    const s = createState({ X: 3, Y: 10 })
    setPgm(s, ['18'])
    executeOneStep(s)
    expect(s.X).toBe(7)
    expect(s.pc).toBe(1)
  })

  it('19 (*): multiplies', () => {
    const s = createState({ X: 4, Y: 5 })
    setPgm(s, ['19'])
    executeOneStep(s)
    expect(s.X).toBe(20)
    expect(s.pc).toBe(1)
  })

  it('1A (/): divides', () => {
    const s = createState({ X: 2, Y: 10 })
    setPgm(s, ['1A'])
    executeOneStep(s)
    expect(s.X).toBe(5)
    expect(s.pc).toBe(1)
  })

  it('1A (/): division by zero triggers error', () => {
    const s = createState({ X: 0, Y: 10 })
    setPgm(s, ['1A'])
    const result = executeOneStep(s)
    expect(s.isError).toBe(true)
    expect(result).toBe(false)
  })

  it('14 (SP): stops execution', () => {
    const s = createState()
    setPgm(s, ['14'])
    const result = executeOneStep(s)
    expect(result).toBe(false)
    expect(s.pc).toBe(1)
  })

  it('15 (VO): resets PC to 0', () => {
    const s = createState({ pc: 0 })
    setPgm(s, ['15'])
    executeOneStep(s)
    expect(s.pc).toBe(0)
  })

  it('10+reg (П): stores X to memory[reg]', () => {
    const s = createState({ X: 42 })
    setPgm(s, ['10', '05'])
    executeOneStep(s)
    expect(s.memory[5]).toBe(42)
    expect(s.pc).toBe(2)
  })

  it('11+reg (ИП): recalls memory[reg] to X', () => {
    const s = createState()
    setMemory(s, 3, 99)
    setPgm(s, ['11', '03'])
    executeOneStep(s)
    expect(s.X).toBe(99)
    expect(s.pc).toBe(2)
  })

  it('1E+00 (K+0): reads memory[10] (A)', () => {
    const s = createState()
    setMemory(s, 10, 55)
    setPgm(s, ['1E', '00'])
    executeOneStep(s)
    expect(s.X).toBe(55)
    expect(s.pc).toBe(2)
  })

  it('1D+07 (F+7): sin(30) DEG', () => {
    const s = createState({ X: 30, angleUnit: 'DEG' })
    setPgm(s, ['1D', '07'])
    executeOneStep(s)
    expect(s.X).toBeCloseTo(0.5)
    expect(s.pc).toBe(2)
  })

  it('1B (STEP_FWD): advances PC', () => {
    const s = createState({ pc: 10 })
    setPgm(s, ['1B'])
    executeOneStep(s)
    expect(s.pc).toBe(11)
  })
})