import type { VMState } from './types'

export function formatNumber(num: number): string {
  if (isNaN(num) || !isFinite(num)) return '       ЕГГОГ '

  let exp = 0
  let n = num
  if (num !== 0 && (Math.abs(num) >= 1e8 || Math.abs(num) < 1e-7)) {
    exp = Math.floor(Math.log10(Math.abs(num)))
    n = num / Math.pow(10, exp)
  }

  let numStr = n.toFixed(7)
  numStr = parseFloat(numStr).toString()
  if (!numStr.includes('.')) numStr += '.'

  let expStr = ''
  if (exp !== 0) {
    expStr = (exp >= 0 ? ' ' : '-') + String(Math.abs(exp)).padStart(2, '0')
  } else {
    expStr = '  00'
  }

  let result = numStr.padEnd(9, ' ') + expStr
  return result.padStart(13, ' ')
}

export function formatRegister(val: number): string {
  if (typeof val !== 'number') return '0'
  return String(val)
}

export interface VFDDisplayState {
  power: boolean
  isError: boolean
  mode: string
  pc: number
  programRAM: { code: string }[]
  isEnteringNum: boolean
  inputStr: string
  enteringExp: boolean
  expStr: string
  X: number
}

export function formatVFD(state: VFDDisplayState): string {
  if (!state.power) return '             '
  if (state.isError) return '       ЕГГОГ '

  if (state.mode === 'PRG') {
    const stepStr = String(state.pc).padStart(2, '0')
    const current = state.programRAM[state.pc]
    const next = state.programRAM[(state.pc + 1) % 105]
    return `  ${stepStr}  ${current.code}   ${next.code}`
  }

  if (state.isEnteringNum) {
    let display = state.inputStr
    if (state.enteringExp) {
      display += ' ' + (state.expStr || '0')
    }
    return display.padStart(13, ' ')
  }

  return formatNumber(state.X)
}
