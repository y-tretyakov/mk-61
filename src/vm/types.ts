export interface ProgramStep {
  code: string
  mnemonic: string
}

export interface VMState {
  mode: 'AVT' | 'PRG'
  angleUnit: 'RAD' | 'DEG' | 'GRAD'
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
  isProgramRunning: boolean
  returnAddr: number | null
  isError: boolean
  errorType: string | null
  pendingMemoryOp: 'P' | 'IP' | null
}

export interface ExampleProgram {
  name: string
  description: string
  codes: string
}
