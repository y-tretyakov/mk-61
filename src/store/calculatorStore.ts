import { create } from 'zustand'
import { getInitialState } from './initialState'
import type { CalculatorStore } from './types'
import { lessons, type Lesson } from '../data/lessons'
import { toRad, formatNumber } from '../utils/math'

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

function pushStack(s: CalculatorStore) {
  s.T = s.Z
  s.Z = s.Y
  s.Y = s.X
}

function popStack(s: CalculatorStore) {
  const top = s.X
  s.X = s.Y
  s.Y = s.Z
  s.Z = s.T
  return top
}

function triggerError(s: CalculatorStore, type = 'ЕГГОГ') {
  s.isError = true
  s.errorType = type
}

function recordProgramStep(s: CalculatorStore, mod: string | null, key: string) {
  let opcode = '00'
  let mnemonic = key
  if (mod === 'F') {
    opcode = '15'
    mnemonic = 'F ' + key
  } else {
    opcode = String(10 + (key.charCodeAt(0) % 80)).padStart(2, '0')
  }
  s.programRAM[s.pc] = { code: opcode, mnemonic }
  s.pc = (s.pc + 1) % 105
}

function executeFFunction(s: CalculatorStore, key: string) {
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

function executeKFunction(s: CalculatorStore, key: string) {
  switch (key) {
    case '7': s.X = s.X - Math.floor(s.X); break
    case '8': s.X = Math.trunc(s.X); break
    case '4': s.X = Math.abs(s.X); break
    case '5': s.X = Math.sign(s.X); break
    default:
      if (key >= '0' && key <= '9') {
        s.X = s.memory[parseInt(key)] || 0
      }
      break
  }
}

function fromRad(val: number, unit: string) {
  if (unit === 'DEG') return val * 180 / Math.PI
  if (unit === 'GRAD') return val * 200 / Math.PI
  return val
}

function checkLessonProgress(s: CalculatorStore) {
  const lesson = lessons[s.currentLessonIdx]
  return lesson?.check ? lesson.check(s) : false
}

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  ...getInitialState(),

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

    if (s.mode === 'PRG' && key !== 'VO' && key !== 'BP') {
      const next = { ...s }
      recordProgramStep(next, mod, key)
      set(next)
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

      if (!mod && key === 'CHS') {
        if (next.isEnteringNum) {
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

  updateUI() {
    // UI is reactive via Zustand subscriptions
  },
}))

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