import { useCalculatorStore } from '../store/calculatorStore'

export function Header() {
  const soundEnabled = useCalculatorStore((s) => s.soundEnabled)
  const toggleSound = useCalculatorStore((s) => s.toggleSound)
  const resetCalculator = useCalculatorStore((s) => s.resetCalculator)

  return (
    <header className="max-w-7xl mx-auto w-full mb-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xl">
          МК
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Электроника МК-61
            <span className="text-xs font-normal px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Интерактивный Музей-Тренажёр
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Архитектура ОПН, 105 шагов памяти и легендарная «Еггогология»
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleSound}
          className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-2 transition"
        >
          <i
            className={
              soundEnabled
                ? 'fa-solid fa-volume-high text-cyan-400'
                : 'fa-solid fa-volume-xmark text-slate-500'
            }
          />
          <span>Звук: {soundEnabled ? 'ВКЛ' : 'ВЫКЛ'}</span>
        </button>
        <button
          id="btn-reset-calc"
          onClick={resetCalculator}
          className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-red-950/40 hover:text-red-300 text-slate-300 border border-slate-700 flex items-center gap-2 transition"
        >
          <i className="fa-solid fa-rotate-right"></i> Сброс МК
        </button>
      </div>
    </header>
  )
}