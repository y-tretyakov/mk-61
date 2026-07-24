import type { ProgramStep } from './types'

function createEmptyProgram(): ProgramStep[] {
  return Array.from({ length: 105 }, () => ({ code: '00', mnemonic: 'НОП' }))
}

export function getInitialState() {
  return {
    power: true,
    mode: 'AVT' as const,
    angleUnit: 'RAD' as const,
    modifier: null as 'F' | 'K' | null,

    X: 0,
    Y: 0,
    Z: 0,
    T: 0,
    X1: 0,

    inputStr: '0',
    isEnteringNum: false,
    hasDot: false,
    enteringExp: false,
    expStr: '',

    memory: new Array(15).fill(0),
    programRAM: createEmptyProgram(),
    pc: 0,
    isProgramRunning: false,
    isError: false,
    errorType: null as string | null,
    soundEnabled: true,
    pendingMemoryOp: null as 'P' | 'IP' | null,
    currentTab: 'course' as const,
    currentLessonIdx: 0,
  }
}