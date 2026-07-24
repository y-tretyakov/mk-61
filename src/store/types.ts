export interface ProgramStep {
  code: string
  mnemonic: string
}

export interface CalculatorState {
  power: boolean
  mode: 'AVT' | 'PRG'
  angleUnit: 'RAD' | 'DEG' | 'GRAD'
  modifier: 'F' | 'K' | null

  X: number
  Y: number
  Z: number
  T: number
  X1: number

  inputStr: string
  isEnteringNum: boolean
  hasDot: boolean
  enteringExp: boolean
  expStr: string

  memory: number[]
  programRAM: ProgramStep[]
  pc: number
  expectingOperand: 'register' | 'address' | null
  operandDigits: number
  isProgramRunning: boolean
  returnAddr: number | null
  isError: boolean
  errorType: string | null
  soundEnabled: boolean
  pendingMemoryOp: 'P' | 'IP' | null
  currentTab: 'course' | 'stack' | 'program'
  currentLessonIdx: number
}

export interface CalculatorActions {
  handleKey: (key: string) => void
  updateUI: () => void
  setTab: (tab: 'course' | 'stack' | 'program') => void
  setLesson: (idx: number) => void
  togglePower: () => void
  toggleAngle: () => void
  toggleSound: () => void
  resetCalculator: () => void
  nextLesson: () => void
  prevLesson: () => void
  runAutoDemo: () => void
  exportProgram: () => string
  importProgram: (text: string) => void
  loadExample: (index: number) => void
}

export type CalculatorStore = CalculatorState & CalculatorActions