import { useCalculatorStore } from '../store/calculatorStore'
import { formatVFD } from '../vm'

interface KeyDef {
  top: string
  key: string
  label: string
  cls: string
  bottom: string
  topColors?: string[]
}

const keys: KeyDef[][] = [
  [
    { top: '', key: 'F', label: 'F', cls: 'btn-yellow', bottom: '' },
    { top: 'x<0', key: 'STEP_BACK', label: 'ШГ', cls: 'btn-black', bottom: '' },
    { top: 'x=0', key: 'STEP_FWD', label: 'ШГ', cls: 'btn-black', bottom: '' },
    { top: 'x≥0', key: 'VO', label: 'В/О', cls: 'btn-black', bottom: '' },
    { top: 'x≠0', key: 'SP', label: 'С/П', cls: 'btn-black', bottom: '' },
  ],
  [
    { top: '', key: 'K', label: 'К', cls: 'btn-blue', bottom: '' },
    { top: 'L0', key: 'IP', label: 'П→Х', cls: 'btn-black', bottom: '' },
    { top: 'L1', key: 'P', label: 'Х→П', cls: 'btn-black', bottom: '' },
    { top: 'L2', key: 'BP', label: 'БП', cls: 'btn-black', bottom: '' },
    { top: 'L3', key: 'PP', label: 'ПП', cls: 'btn-black', bottom: '' },
  ],
  [
    { top: 'sin [x]', key: '7', label: '7', cls: 'btn-grey', bottom: '', topColors: ['text-amber-300', 'text-sky-300'] },
    { top: 'cos {x}', key: '8', label: '8', cls: 'btn-grey', bottom: '', topColors: ['text-amber-300', 'text-sky-300'] },
    { top: 'tg max', key: '9', label: '9', cls: 'btn-grey', bottom: '', topColors: ['text-amber-300', 'text-sky-300'] },
    { top: '√', key: '-', label: '−', cls: 'btn-black', bottom: '', topColors: ['text-amber-300'] },
    { top: '1/x', key: '/', label: '÷', cls: 'btn-black', bottom: '', topColors: ['text-amber-300'] },
  ],
  [
    { top: 'sin⁻¹ |x|', key: '4', label: '4', cls: 'btn-grey', bottom: '', topColors: ['text-amber-300', 'text-sky-300'] },
    { top: 'cos⁻¹ ЗН', key: '5', label: '5', cls: 'btn-grey', bottom: '', topColors: ['text-amber-300', 'text-sky-300'] },
    { top: 'tg⁻¹', key: '6', label: '6', cls: 'btn-grey', bottom: '', topColors: ['text-amber-300'] },
    { top: 'π', key: '+', label: '+', cls: 'btn-black', bottom: '', topColors: ['text-amber-300'] },
    { top: 'x²', key: '*', label: '×', cls: 'btn-black', bottom: '', topColors: ['text-amber-300'] },
  ],
  [
    { top: 'eˣ', key: '1', label: '1', cls: 'btn-grey', bottom: '', topColors: ['text-amber-300'] },
    { top: 'lg', key: '2', label: '2', cls: 'btn-grey', bottom: '', topColors: ['text-amber-300'] },
    { top: 'ln', key: '3', label: '3', cls: 'btn-grey', bottom: '', topColors: ['text-amber-300'] },
    { top: 'xʸ', key: 'SWAP', label: '↔', cls: 'btn-black', bottom: '', topColors: ['text-amber-300'] },
    { top: 'Bx СЧ', key: 'ENTER', label: 'В↑', cls: 'btn-black', bottom: 'e', topColors: ['text-amber-300', 'text-sky-300'] },
  ],
  [
    { top: '10ˣ НОП', key: '0', label: '0', cls: 'btn-grey', bottom: 'a', topColors: ['text-amber-300', 'text-sky-300'] },
    { top: '⊝ ∧', key: 'DOT', label: '•', cls: 'btn-grey', bottom: 'b', topColors: ['text-amber-300', 'text-sky-300'] },
    { top: 'АВТ ∨', key: 'CHS', label: '/-/', cls: 'btn-grey', bottom: 'c', topColors: ['text-amber-300', 'text-sky-300'] },
    { top: 'ПРГ ⊕', key: 'VP', label: 'ВП', cls: 'btn-black', bottom: 'd', topColors: ['text-amber-300', 'text-sky-300'] },
    { top: 'CF ИНВ', key: 'CX', label: 'СХ', cls: 'btn-red', bottom: '', topColors: ['text-amber-300', 'text-sky-300'] },
  ],
]

export function Calculator() {
  const handleKey = useCalculatorStore((s) => s.handleKey)
  const power = useCalculatorStore((s) => s.power)
  const togglePower = useCalculatorStore((s) => s.togglePower)
  const toggleAngle = useCalculatorStore((s) => s.toggleAngle)
  const mode = useCalculatorStore((s) => s.mode)
  const angleUnit = useCalculatorStore((s) => s.angleUnit)
  const modifier = useCalculatorStore((s) => s.modifier)
  const pc = useCalculatorStore((s) => s.pc)
  const programRAM = useCalculatorStore((s) => s.programRAM)
  const isError = useCalculatorStore((s) => s.isError)
  const isEnteringNum = useCalculatorStore((s) => s.isEnteringNum)
  const inputStr = useCalculatorStore((s) => s.inputStr)
  const enteringExp = useCalculatorStore((s) => s.enteringExp)
  const expStr = useCalculatorStore((s) => s.expStr)
  const X = useCalculatorStore((s) => s.X)

  const vfdText = formatVFD({
    power, isError, mode, pc, programRAM,
    isEnteringNum, inputStr, enteringExp, expStr, X,
  })

  return (
    <div className="mk61-case w-full max-w-[380px] p-4 rounded-xl flex flex-col gap-3 relative shadow-2xl">
      {/* VFD Display */}
      <div className="vfd-filter p-2 rounded-lg border border-slate-700/80">
        <div className="vfd-screen rounded-md p-2.5 flex flex-col justify-between h-20">
          <div className="flex justify-between items-center text-[10px] vfd-text font-mono opacity-80 border-b border-cyan-950/60 pb-0.5">
            <span className="font-bold text-amber-300">{modifier ? `[ ${modifier} ]` : ''}</span>
            <span className="text-[9px]">{angleUnit}</span>
            <span className={`text-[9px] ${mode === 'PRG' ? '' : 'hidden'}`}>
              ШАГ: {String(pc).padStart(2, '0')}
            </span>
          </div>
          <div className="flex justify-between items-baseline vfd-font text-3xl font-bold tracking-wider leading-none my-auto">
            <span className="vfd-text w-full text-right">{vfdText}</span>
          </div>
          <div className="text-[8px] vfd-dim vfd-font flex justify-between tracking-widest select-none">
            <span>8.8.8.8.8.8.8.8.</span>
            <span>8.8.</span>
          </div>
        </div>
      </div>

      <div className="mk61-visor h-10 rounded-sm w-full flex items-center justify-center" />

      <div className="flex flex-col gap-2 pt-1">
        <div className="text-center font-extrabold tracking-widest text-slate-100 text-sm">
          ЭЛЕКТРОНИКА МК 61
        </div>

        <div className="flex justify-between items-center px-4 py-1 text-[10px] font-bold text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">|</span>
            <button
              onClick={togglePower}
              className="w-9 h-4 bg-slate-900 rounded-sm p-0.5 border border-slate-700 relative"
            >
              <div
                className="w-3.5 h-3 bg-slate-300 rounded-sm transition-transform"
                style={{ transform: power ? 'translateX(24px)' : 'translateX(0px)' }}
              />
            </button>
            <span className="text-slate-200">Вкл</span>
          </div>

          <div className="flex items-center gap-1">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                power
                  ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                  : 'bg-slate-700'
              }`}
            />
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-amber-300/90 -mb-0.5">ГРД</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-200 font-bold text-[11px]">Р</span>
              <button
                id="switch-angle"
                onClick={toggleAngle}
                className="w-10 h-4 bg-slate-900 rounded-sm p-0.5 border border-slate-700 relative"
              >
                <div
                  className="w-3 h-3 bg-slate-300 rounded-sm transition-transform"
                  style={{
                    transform:
                      angleUnit === 'RAD'
                        ? 'translateX(0px)'
                        : angleUnit === 'DEG'
                          ? 'translateX(12px)'
                          : 'translateX(24px)',
                  }}
                />
              </button>
              <span className="text-slate-200 font-bold text-[11px]">Г</span>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard */}
      <div className="grid grid-cols-5 gap-x-1.5 gap-y-1.5 pt-1 text-xs">
        {keys.map((row, ri) =>
          row.map((k, ki) => {
            const topLabels = k.top.split(' ')
            return (
              <div key={`${ri}-${ki}`} className="flex flex-col items-center">
                <div className={`h-5 flex items-end justify-center ${k.topColors ? 'gap-1' : ''} text-[11px] font-extrabold tracking-tight`}>
                  {k.topColors
                    ? k.top.split(' ').map((part, pi) => (
                        <span key={pi} className={k.topColors![pi] || ''}>
                          {part}
                        </span>
                      ))
                    : k.top && <span className="text-amber-300">{k.top}</span>}
                </div>
                <button
                  data-key={k.key}
                  onClick={() => handleKey(k.key)}
                  className={`btn-mk ${k.cls} w-full h-8 flex items-center justify-center ${
                    ['F', 'K', '↔'].includes(k.label) ? 'text-sm font-black' : ''
                  } ${['В↑', 'В/О', 'С/П', '/-/', 'ВП', 'СХ'].includes(k.label) ? 'text-xs font-bold' : 'text-base'}`}
                >
                  {k.key === 'SP' ? (
                    <span className="text-emerald-400">{k.label}</span>
                  ) : (
                    k.label
                  )}
                </button>
                <div className={`h-3 flex items-start justify-center ${k.bottom ? 'text-[11px] text-slate-400 font-bold' : ''}`}>
                  {k.bottom || ''}
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="text-[10px] text-slate-400 text-center mt-1">
        Подсказка: <span className="text-amber-300 font-bold">F</span> или{' '}
        <span className="text-sky-400 font-bold">К</span> активирует надписи над кнопками.{' '}
        <br />
        Режим <strong>ПРГ</strong>: <span className="text-amber-300">F</span> +{' '}
        <span className="text-slate-200">ВП</span> | Режим{' '}
        <strong>АВТ</strong>: <span className="text-amber-300">F</span> +{' '}
        <span className="text-slate-200">/-/</span>
      </div>
    </div>
  )
}