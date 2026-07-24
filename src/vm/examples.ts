import type { ExampleProgram, ProgramStep } from './types'
import { codeToMnemonic } from './opcodes'

export const EXAMPLE_PROGRAMS: ExampleProgram[] = [
  {
    name: '5+3 × 4 = 32',
    description: 'Простое вычисление: (5+3)×4',
    codes: '05 0E 03 17 04 19 14',
  },
  {
    name: 'Проверка x≥0',
    description: 'Если R0 ≥ 0, X=1; иначе X=0',
    codes: '11 00 1D 15 00 05 01 14 00 14',
  },
  {
    name: 'Факториал 5! = 120',
    description: 'Вычисление 5! через цикл с условным переходом',
    codes: [
      '05', '10', '00',
      '01', '10', '01',
      '11', '00',
      '01', '18',
      '10', '00',
      '1D', '1B', '00', '0F',
      '11', '00',
      '11', '01',
      '19',
      '10', '01',
      '12', '00', '06',
      '11', '01',
      '14',
    ].join(' '),
  },
]

export function exportToText(programRAM: ProgramStep[]): string {
  const lines: string[] = []
  let i = 0
  while (i < 105) {
    const step = programRAM[i]
    if (step.code !== '00') {
      lines.push(`${step.code}  ; ${step.mnemonic} (шаг ${String(i).padStart(2, '0')})`)
    }
    i++
  }
  return lines.join('\n')
}

export function parseProgram(text: string): ProgramStep[] | null {
  const codes = text
    .split(/[\s,;]+/)
    .map(c => c.trim())
    .filter(c => /^[0-9A-Fa-f]{2}$/.test(c))
  if (codes.length === 0) return null

  return Array.from({ length: 105 }, (_, i) => {
    const code = i < codes.length ? codes[i].toUpperCase() : '00'
    return { code, mnemonic: codeToMnemonic(code) }
  })
}
