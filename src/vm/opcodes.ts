import type { ProgramStep } from './types'

export const OPCODE_TABLE: Record<string, { code: string; mnemonic: string }> = {
  '0': { code: '00', mnemonic: '0' },
  '1': { code: '01', mnemonic: '1' },
  '2': { code: '02', mnemonic: '2' },
  '3': { code: '03', mnemonic: '3' },
  '4': { code: '04', mnemonic: '4' },
  '5': { code: '05', mnemonic: '5' },
  '6': { code: '06', mnemonic: '6' },
  '7': { code: '07', mnemonic: '7' },
  '8': { code: '08', mnemonic: '8' },
  '9': { code: '09', mnemonic: '9' },
  'DOT': { code: '0A', mnemonic: '•' },
  'CHS': { code: '0B', mnemonic: '/−/' },
  'VP': { code: '0C', mnemonic: 'ВП' },
  'CX': { code: '0D', mnemonic: 'СХ' },
  'ENTER': { code: '0E', mnemonic: 'В↑' },
  'P': { code: '10', mnemonic: 'П' },
  'IP': { code: '11', mnemonic: 'ИП' },
  'BP': { code: '12', mnemonic: 'БП' },
  'PP': { code: '13', mnemonic: 'ПП' },
  'SP': { code: '14', mnemonic: 'С/П' },
  'VO': { code: '15', mnemonic: 'В/О' },
  'SWAP': { code: '16', mnemonic: '↔' },
  '+': { code: '17', mnemonic: '+' },
  '-': { code: '18', mnemonic: '−' },
  '*': { code: '19', mnemonic: '×' },
  '/': { code: '1A', mnemonic: '÷' },
  'STEP_FWD': { code: '1B', mnemonic: 'ШГ→' },
  'STEP_BACK': { code: '1C', mnemonic: 'ШГ←' },
  'F': { code: '1D', mnemonic: 'F' },
  'K': { code: '1E', mnemonic: 'K' },
}

export const OPCODE_TO_KEY: Record<string, string> = {
  '00': '0', '01': '1', '02': '2', '03': '3', '04': '4',
  '05': '5', '06': '6', '07': '7', '08': '8', '09': '9',
  '0A': 'DOT', '0B': 'CHS', '0C': 'VP', '0D': 'CX', '0E': 'ENTER',
  '10': 'P', '11': 'IP', '12': 'BP', '13': 'PP', '14': 'SP', '15': 'VO',
  '16': 'SWAP', '17': '+', '18': '-', '19': '*', '1A': '/',
  '1B': 'STEP_FWD', '1C': 'STEP_BACK',
}

const KEY_TO_MNEMONIC: Record<string, string> = Object.fromEntries(
  Object.entries(OPCODE_TABLE).map(([, v]) => [v.code, v.mnemonic])
)

export function codeToMnemonic(code: string): string {
  return KEY_TO_MNEMONIC[code] || '???'
}

export function opcodeDigit(code: string): number {
  return Number(code[1])
}

export function recordProgramStep(
  programRAM: ProgramStep[],
  pc: number,
  mod: string | null,
  key: string,
): ProgramStep[] {
  const step = OPCODE_TABLE[key]
  if (!step) return programRAM

  const ram = [...programRAM]
  const prefixCode = mod === 'K' ? '1E' : '1D'

  if (mod) {
    ram[pc] = { code: prefixCode, mnemonic: mod }
    pc = (pc + 1) % 105
    ram[pc] = { code: step.code, mnemonic: `${mod} ${step.mnemonic}` }
  } else {
    ram[pc] = { code: step.code, mnemonic: step.mnemonic }
  }

  return ram
}

export function advancePc(pc: number, n: number = 1): number {
  return (pc + n) % 105
}
