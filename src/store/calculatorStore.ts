import { create } from 'zustand'
import { getInitialState } from './initialState'
import type { CalculatorStore, ProgramStep } from './types'
import { lessons, type Lesson } from '../data/lessons'
import {
  pushStack,
  popStack,
  triggerError,
  executeFFunction,
  executeKFunction,
  executeOneStep,
  OPCODE_TABLE,
  EXAMPLE_PROGRAMS,
  exportToText,
  parseProgram,
} from '../vm'

let audioCtx: AudioContext | null = null

function playKeyClick(enabled: boolean) {
  if (!enabled) return
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, audioCtx.currentTime)
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.03)
  } catch { /* ignore audio errors */ }
}

function recordProgramStep(s: CalculatorStore, mod: string | null, key: string) {
  const step = OPCODE_TABLE[key]
  if (!step) return

  const prefixCode = mod === 'K' ? '1E' : '1D'
  if (mod) {
    s.programRAM[s.pc] = { code: prefixCode, mnemonic: mod }
    s.pc = (s.pc + 1) % 105
    s.programRAM[s.pc] = { code: step.code, mnemonic: `${mod} ${step.mnemonic}` }
    s.pc = (s.pc + 1) % 105
  } else {
    s.programRAM[s.pc] = { code: step.code, mnemonic: step.mnemonic }
    s.pc = (s.pc + 1) % 105
  }
}

function executeProgram(get: () => CalculatorStore, set: (partial: Partial<CalculatorStore>) => void) {
  const s = get()
  s.isProgramRunning = true
  set({ isProgramRunning: true })

  let steps = 0
  const MAX_STEPS = 10000

  function step() {
    const current = get()
    if (!current.isProgramRunning) return

    const shouldContinue = executeOneStep(current)
    set({ ...current })

    if (shouldContinue) {
      steps++
      if (steps < MAX_STEPS) {
        setTimeout(step, 1)
      } else {
        set({ isProgramRunning: false })
      }
    } else {
      set({ isProgramRunning: false })
    }
  }

  step()
}

function checkLessonProgress(s: CalculatorStore) {
  const lesson = lessons[s.currentLessonIdx]
  return lesson?.check ? lesson.check(s) : false
}

const STORAGE_KEY = 'mk61-save'

function saveToDisk(get: () => CalculatorStore) {
  try {
    const s = get()
    const data = {
      programRAM: s.programRAM,
      memory: s.memory,
      pc: s.pc,
      mode: s.mode,
      angleUnit: s.angleUnit,
      X: s.X, Y: s.Y, Z: s.Z, T: s.T, X1: s.X1,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* storage unavailable */ }
}

function loadFromDisk(set: (partial: Partial<CalculatorStore>) => void) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    if (data.programRAM) {
      const fullRam = Array.from({ length: 105 }, (_, i) =>
        data.programRAM[i] || { code: '00', mnemonic: 'НОП' }
      )
      set({
        programRAM: fullRam,
        memory: data.memory || new Array(15).fill(0),
        pc: data.pc ?? 0,
        mode: data.mode || 'AVT',
        angleUnit: data.angleUnit || 'RAD',
        X: data.X ?? 0, Y: data.Y ?? 0, Z: data.Z ?? 0,
        T: data.T ?? 0, X1: data.X1 ?? 0,
      })
    }
  } catch { /* ignore corrupt data */ }
}

export const useCalculatorStore = create<CalculatorStore>((set, get) => {
  const init = getInitialState()
  loadFromDisk(set)
  return {
  ...init,

  setTab(tab) {
    set({ currentTab: tab })
  },

  setLesson(idx: number) {
    set({ currentLessonIdx: idx })
  },

  togglePower() {
    const s = get()
    set({ power: !s.power })
  },

  toggleAngle() {
    const s = get()
    const next = s.angleUnit === 'RAD' ? 'DEG' : s.angleUnit === 'DEG' ? 'GRAD' : 'RAD'
    set({ angleUnit: next })
  },

  toggleSound() {
    const s = get()
    set({ soundEnabled: !s.soundEnabled })
  },

  resetCalculator() {
    set({
      X: 0, Y: 0, Z: 0, T: 0, X1: 0,
      inputStr: '0', isEnteringNum: false, isError: false, errorType: null,
      memory: new Array(15).fill(0),
      pendingMemoryOp: null,
      expectingOperand: null,
      operandDigits: 0,
      isProgramRunning: false,
      returnAddr: null,
    })
  },

  nextLesson() {
    const s = get()
    if (s.currentLessonIdx < lessons.length - 1) {
      set({ currentLessonIdx: s.currentLessonIdx + 1 })
    }
  },

  prevLesson() {
    const s = get()
    if (s.currentLessonIdx > 0) {
      set({ currentLessonIdx: s.currentLessonIdx - 1 })
    }
  },

  runAutoDemo() {
    const s = get()
    const idx = s.currentLessonIdx
    const demo = autoDemos[idx]
    if (demo) {
      demo(get, set)
    }
  },

  handleKey(key: string) {
    const s = get()
    if (!s.power) return

    playKeyClick(s.soundEnabled)

    if (s.isError && key !== 'CX') return

    if (s.isProgramRunning) {
      if (key === 'SP') {
        set({ isProgramRunning: false })
      }
      return
    }

    if (key === 'F') {
      set({ modifier: s.modifier === 'F' ? null : 'F' })
      return
    }
    if (key === 'K') {
      set({ modifier: s.modifier === 'K' ? null : 'K' })
      return
    }

    const mod = s.modifier
    set({ modifier: null })

    if (mod === 'F' && key === 'VP') { set({ mode: 'PRG' }); return }
    if (mod === 'F' && key === 'CHS') { set({ mode: 'AVT' }); return }

    if (s.mode === 'PRG') {
      const next = { ...s, modifier: null }

      if (mod && (key === 'STEP_BACK' || key === 'STEP_FWD' || key === 'VO' || key === 'SP')) {
        recordProgramStep(next, mod, key)
        next.expectingOperand = 'address'
        next.operandDigits = 2
        set(next)
        return
      }

      if (!mod && key === 'VO') {
        next.pc = 0
        next.expectingOperand = null
        next.operandDigits = 0
        set(next)
        return
      }

      if (!mod && (key === 'STEP_FWD' || key === 'STEP_BACK')) {
        next.pc = key === 'STEP_FWD'
          ? (next.pc + 1) % 105
          : (next.pc - 1 + 105) % 105
        next.expectingOperand = null
        next.operandDigits = 0
        set(next)
        return
      }

      if (next.expectingOperand) {
        if (key >= '0' && key <= '9') {
          const info = OPCODE_TABLE[key]
          next.programRAM[next.pc] = { code: info.code, mnemonic: key }
          next.pc = (next.pc + 1) % 105
          next.operandDigits--
          if (next.operandDigits <= 0) next.expectingOperand = null
          set(next)
          return
        }
        next.expectingOperand = null
        next.operandDigits = 0
      }

      if (!mod) {
        if (key === 'P' || key === 'IP') {
          const info = OPCODE_TABLE[key]
          next.programRAM[next.pc] = { code: info.code, mnemonic: info.mnemonic }
          next.pc = (next.pc + 1) % 105
          next.expectingOperand = 'register'
          next.operandDigits = 1
          set(next)
          return
        }
        if (key === 'BP' || key === 'PP') {
          const info = OPCODE_TABLE[key]
          next.programRAM[next.pc] = { code: info.code, mnemonic: info.mnemonic }
          next.pc = (next.pc + 1) % 105
          next.expectingOperand = 'address'
          next.operandDigits = 2
          set(next)
          return
        }
      }

      recordProgramStep(next, mod, key)
      set(next)
      return
    }

    if (key === 'STEP_FWD') {
      const current = get()
      if (!current.isError) {
        executeOneStep(current)
        set({ ...current })
      }
      return
    }
    if (key === 'STEP_BACK') { set({ pc: (s.pc - 1 + 105) % 105 }); return }

    if (key === 'SP') {
      executeProgram(get, set)
      return
    }

    set((state) => {
      const next = { ...state }

      if (!mod && key >= '0' && key <= '9') {
        if (next.pendingMemoryOp === 'P') {
          const regIdx = parseInt(key)
          next.memory = [...next.memory]
          next.memory[regIdx] = next.X
          next.pendingMemoryOp = null
          return next
        }
        if (next.pendingMemoryOp === 'IP') {
          const regIdx = parseInt(key)
          next.X = next.memory[regIdx] || 0
          next.pendingMemoryOp = null
          next.isEnteringNum = false
          return next
        }
        if (next.enteringExp) {
          if (next.expStr.length < 2) {
            next.expStr += key
          }
          next.X = parseFloat(next.inputStr) * Math.pow(10, parseFloat(next.expStr) || 0)
          return next
        }
        if (!next.isEnteringNum) {
          pushStack(next)
          next.inputStr = key
          next.isEnteringNum = true
          next.hasDot = false
          next.enteringExp = false
        } else {
          if (next.inputStr.replace(/[^0-9]/g, '').length < 8) {
            next.inputStr += key
          }
        }
        next.X = parseFloat(next.inputStr)
        return next
      }

      if (!mod && key === 'DOT') {
        if (!next.isEnteringNum) {
          pushStack(next)
          next.inputStr = '0.'
          next.isEnteringNum = true
          next.hasDot = true
        } else if (!next.hasDot) {
          next.inputStr += '.'
          next.hasDot = true
        }
        next.X = parseFloat(next.inputStr)
        return next
      }

      if (!mod && key === 'VP') {
        next.X1 = next.X
        if (!next.isEnteringNum) {
          pushStack(next)
          next.inputStr = '1'
          next.isEnteringNum = true
          next.hasDot = false
        }
        next.enteringExp = true
        next.expStr = ''
        return next
      }

      if (!mod && key === 'CHS') {
        if (next.enteringExp) {
          next.expStr = next.expStr.startsWith('-') ? next.expStr.slice(1) : '-' + next.expStr
          next.X = parseFloat(next.inputStr) * Math.pow(10, parseFloat(next.expStr) || 0)
        } else if (next.isEnteringNum) {
          next.inputStr = next.inputStr.startsWith('-')
            ? next.inputStr.substring(1)
            : '-' + next.inputStr
          next.X = parseFloat(next.inputStr)
        } else {
          next.X = -next.X
        }
        return next
      }

      if (!mod && key === 'ENTER') {
        next.T = next.Z
        next.Z = next.Y
        next.Y = next.X
        next.isEnteringNum = false
        return next
      }

      if (!mod && key === 'CX') {
        next.inputStr = '0'
        next.X = 0
        next.isEnteringNum = false
        next.isError = false
        return next
      }

      if (!mod && key === 'SWAP') {
        const temp = next.X
        next.X = next.Y
        next.Y = temp
        next.isEnteringNum = false
        return next
      }

      next.X1 = next.X
      next.isEnteringNum = false

      if (mod === 'F') {
        executeFFunction(next, key)
        return next
      }

      if (mod === 'K') {
        if (next.pendingMemoryOp === 'P' && key >= '0' && key <= '4') {
          const idx = 10 + parseInt(key)
          next.memory = [...next.memory]
          next.memory[idx] = next.X
          next.pendingMemoryOp = null
          return next
        }
        if (next.pendingMemoryOp === 'IP' && key >= '0' && key <= '4') {
          const idx = 10 + parseInt(key)
          next.X = next.memory[idx] || 0
          next.pendingMemoryOp = null
          next.isEnteringNum = false
          return next
        }
        executeKFunction(next, key)
        return next
      }

      if (key === '+') { const b = next.X; popStack(next); next.X = next.X + b }
      else if (key === '-') { const b = next.X; popStack(next); next.X = next.X - b }
      else if (key === '*') { const b = next.X; popStack(next); next.X = next.X * b }
      else if (key === '/') {
        const b = next.X; popStack(next)
        if (b === 0) { triggerError(next); return next }
        next.X = next.X / b
      }
      else if (key === 'P') { next.pendingMemoryOp = 'P' }
      else if (key === 'IP') { next.pendingMemoryOp = 'IP' }
      else if (key === 'VO') { next.pc = 0 }

      return next
    })
  },

  exportProgram(): string {
    return exportToText(get().programRAM)
  },

  importProgram(text: string) {
    const ram = parseProgram(text)
    if (!ram) return
    set({ programRAM: ram, pc: 0, returnAddr: null, isProgramRunning: false, isError: false })
  },

  loadExample(index: number) {
    const example = EXAMPLE_PROGRAMS[index]
    if (!example) return
    const ram = parseProgram(example.codes)
    if (!ram) return
    set({ programRAM: ram, pc: 0, returnAddr: null, isProgramRunning: false, isError: false, mode: 'AVT' })
  },

  updateUI() {
    // UI is reactive via Zustand subscriptions
  },
  }
})

const store = useCalculatorStore
store.subscribe(() => saveToDisk(store.getState))

const autoDemos: Record<number, (get: () => CalculatorStore, set: (partial: Partial<CalculatorStore>) => void) => void> = {
  0: (get, set) => {
    const h = (k: string) => get().handleKey(k)
    h('5'); h('ENTER'); h('3'); h('+'); h('4'); h('*')
  },
  1: (get, set) => {
    const h = (k: string) => get().handleKey(k)
    h('1'); h('0'); h('ENTER'); h('2'); h('0'); h('SWAP')
  },
  2: (get, set) => {
    const h = (k: string) => get().handleKey(k)
    h('4'); h('2'); h('P'); h('1')
  },
  3: (get, set) => {
    set({ mode: 'AVT' })
  },
  4: (get, set) => {
    const h = (k: string) => get().handleKey(k)
    h('5'); h('ENTER'); h('0'); h('/')
  },
  5: (get, set) => {
    set({ angleUnit: 'DEG' })
    const h = (k: string) => get().handleKey(k)
    h('3'); h('0'); h('F'); h('7')
  },
  6: (get, set) => {
    const h = (k: string) => get().handleKey(k)
    h('1'); h('0'); h('0'); h('F'); h('2')
  },
  7: (get, set) => {
    const h = (k: string) => get().handleKey(k)
    h('2'); h('5'); h('F'); h('-')
  },
  8: (get, set) => {
    const h = (k: string) => get().handleKey(k)
    h('F'); h('+'); h('F'); h('/')
  },
  9: (get, set) => {
    const h = (k: string) => get().handleKey(k)
    h('5'); h('CHS'); h('K'); h('4')
  },
  10: (get, set) => {
    const h = (k: string) => get().handleKey(k)
    h('1'); h('0'); h('0'); h('ENTER'); h('5'); h('0'); h('+'); h('F'); h('ENTER')
  },
  11: (get, set) => {
    const h = (k: string) => get().handleKey(k)
    h('7'); h('ENTER'); h('8'); h('+'); h('9'); h('3'); h('-'); h('*')
  },
}
