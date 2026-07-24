import { useCalculatorStore } from '../store/calculatorStore'
import { lessons } from '../data/lessons'

export function SidePanel() {
  const currentTab = useCalculatorStore((s) => s.currentTab)
  const setTab = useCalculatorStore((s) => s.setTab)
  const currentLessonIdx = useCalculatorStore((s) => s.currentLessonIdx)
  const setLesson = useCalculatorStore((s) => s.setLesson)
  const nextLesson = useCalculatorStore((s) => s.nextLesson)
  const prevLesson = useCalculatorStore((s) => s.prevLesson)
  const runAutoDemo = useCalculatorStore((s) => s.runAutoDemo)

  const X = useCalculatorStore((s) => s.X)
  const Y = useCalculatorStore((s) => s.Y)
  const Z = useCalculatorStore((s) => s.Z)
  const T = useCalculatorStore((s) => s.T)
  const X1 = useCalculatorStore((s) => s.X1)
  const pc = useCalculatorStore((s) => s.pc)
  const memory = useCalculatorStore((s) => s.memory)
  const programRAM = useCalculatorStore((s) => s.programRAM)
  const isError = useCalculatorStore((s) => s.isError)
  const errorType = useCalculatorStore((s) => s.errorType)

  const lesson = lessons[currentLessonIdx]

  const tabClasses = (tab: string) =>
    `flex-1 py-2 rounded-lg transition flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold ${
      currentTab === tab
        ? 'bg-cyan-600 text-white shadow'
        : 'text-slate-400 hover:text-slate-200'
    }`

  const tabContentClasses = (tab: string) =>
    currentTab === tab ? 'flex' : 'hidden'

  return (
    <section className="lg:col-span-7 flex flex-col gap-4">
      <div className="flex border-b border-slate-800 bg-slate-900/60 p-1 rounded-xl">
        <button
          onClick={() => setTab('course')}
          className={tabClasses('course')}
        >
          <i className="fa-solid fa-graduation-cap"></i> Интерактивный Курс
        </button>
        <button
          id="tab-btn-stack"
          onClick={() => setTab('stack')}
          className={tabClasses('stack')}
        >
          <i className="fa-solid fa-layer-group"></i> Стек и Память
        </button>
        <button
          onClick={() => setTab('program')}
          className={tabClasses('program')}
        >
          <i className="fa-solid fa-code"></i> ОЗУ Программы (105)
        </button>
      </div>

      {/* Tab 1: Course */}
      <div
        className={`${tabContentClasses('course')} bg-slate-900/80 rounded-2xl p-5 border border-slate-800 flex-col gap-4 flex-grow shadow-xl`}
      >
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">
              Модуль Обучения
            </span>
            <h2 className="text-lg font-bold text-slate-100">{lesson?.title}</h2>
          </div>
          <div className="flex gap-1">
            <button
              onClick={prevLesson}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <span className="px-3 py-1.5 text-xs font-mono bg-slate-950 rounded-lg text-slate-400 border border-slate-800 flex items-center" id="lesson-indicator">
              {currentLessonIdx + 1} / {lessons.length}
            </span>
            <button
              onClick={nextLesson}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div
          className="text-sm text-slate-300 space-y-3 leading-relaxed overflow-y-auto max-h-[380px] pr-2"
          dangerouslySetInnerHTML={{ __html: lesson?.text || '' }}
        />

        <div className="mt-auto bg-slate-950/80 rounded-xl p-4 border border-cyan-900/40 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-1.5">
              <i className="fa-solid fa-bullseye"></i> Практическое задание
            </span>
            <button
              onClick={runAutoDemo}
              className="text-[11px] px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 transition"
            >
              <i className="fa-solid fa-play text-[9px]"></i> Показать решение
            </button>
          </div>
          <div className="text-xs font-mono text-slate-200">
            {lesson?.task}
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">
              Статус:{' '}
              <strong
                id="task-status"
                className={
                  lesson?.check({ X, Y, Z, T, X1, pc, memory, programRAM, isError, errorType } as any)
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }
              >
                {lesson?.check({ X, Y, Z, T, X1, pc, memory, programRAM, isError, errorType } as any)
                  ? '✓ Выполнено!'
                  : 'Ожидает выполнения'}
              </strong>
            </span>
            <span className="text-slate-400 italic text-[11px]">
              {lesson?.hint}
            </span>
          </div>
        </div>
      </div>

      {/* Tab 2: Stack & Memory */}
      <div
        className={`${tabContentClasses('stack')} bg-slate-900/80 rounded-2xl p-5 border border-slate-800 flex-col gap-4 flex-grow shadow-xl`}
      >
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <i className="fa-solid fa-layer-group text-cyan-400"></i> Монитор Регистров и Стека
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {[
            { label: 'Регистр T (Вершина)', value: T, extra: '' },
            { label: 'Регистр Z', value: Z, extra: '' },
            { label: 'Регистр Y', value: Y, extra: '' },
            { label: 'Регистр X (Экран)', value: X, extra: 'border-cyan-500/40 bg-cyan-950/10' },
            { label: 'Регистр X1 (Отмена)', value: X1, extra: '' },
          ].map((reg) => (
            <div
              key={reg.label}
              className={`bg-slate-950 p-3 rounded-xl border border-slate-800 text-center ${reg.extra}`}
            >
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                {reg.label}
              </span>
              <span className="vfd-font text-cyan-400 text-xl font-bold block mt-1">
                {reg.value}
              </span>
            </div>
          ))}
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Адресуемая память (15 Регистров: 0 - E)
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs code-font">
            {memory.map((val, i) => (
              <div
                key={i}
                className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-between items-center"
              >
                <span className="text-slate-500 font-bold">
                  {['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E'][i]}:
                </span>
                <span className="text-cyan-400 font-mono font-bold">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab 3: Program Memory */}
      <div
        className={`${tabContentClasses('program')} bg-slate-900/80 rounded-2xl p-5 border border-slate-800 flex-col gap-3 flex-grow shadow-xl`}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <i className="fa-solid fa-microchip text-cyan-400"></i> Память Программы (105 шагов)
          </h3>
          <div className="text-xs font-mono text-cyan-400">
            Указатель (PC):{' '}
            <span className="font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800">
              {String(pc).padStart(2, '0')}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Переключите слайдер калькулятора в режим{' '}
          <strong className="text-amber-400">ПРГ</strong> для записи нажатий клавиш в виде байт-кодов.
        </p>

        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex-grow max-h-[360px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs code-font">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0">
              <tr>
                <th className="p-2 text-center w-16">Адрес</th>
                <th className="p-2 text-center w-20">Код</th>
                <th className="p-2">Мнемоника / Команда</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {programRAM.slice(0, 15).map((step, i) => (
                <tr
                  key={i}
                  className={
                    i === pc
                      ? 'bg-cyan-950/40 text-cyan-300 font-bold'
                      : 'hover:bg-slate-900'
                  }
                >
                  <td className="p-2 text-center border-r border-slate-800">
                    {String(i).padStart(2, '0')}
                  </td>
                  <td className="p-2 text-center border-r border-slate-800 text-amber-400">
                    {step.code}
                  </td>
                  <td className="p-2">{step.mnemonic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}