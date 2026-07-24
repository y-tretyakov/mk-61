import { useCalculatorStore } from '../store/calculatorStore'

export function ProgramTable() {
  const programRAM = useCalculatorStore((s) => s.programRAM)
  const pc = useCalculatorStore((s) => s.pc)

  return (
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
                  ? "bg-cyan-950/40 text-cyan-300 font-bold"
                  : "hover:bg-slate-900"
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
  )
}