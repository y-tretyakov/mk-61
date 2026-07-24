import { useCalculatorStore } from '../store/calculatorStore'

const memLabels = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E']

export function MemoryGrid() {
  const memory = useCalculatorStore((s) => s.memory)

  return (
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
            <span className="text-slate-500 font-bold">{memLabels[i]}:</span>
            <span className="text-cyan-400 font-mono font-bold">{val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}