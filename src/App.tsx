import { useMemo, useState } from 'react'
import { evaluate } from 'mahoraga-js'
import sampleJson from './sample.json?raw'
import { makeFns } from './fns'
import { sampleMatrix } from './defaultMarix'

export type Row = { name: string; expr: string; output: boolean }

function run(input: Record<string, unknown>, rows: Row[]) {
  const ctx = { ...input, ...makeFns(new Date(String(input.currentDateTime))) }
  // every row's value, visible to later rows as `prev_risks`
  const risks: Record<string, number> = {}
  // only rows marked as output
  const out: Record<string, number> = {}
  const errors: Record<number, string> = {}
  rows.forEach((r, i) => {
    try {
      const v = evaluate(r.expr, { ...ctx, prev_risks: { ...risks } })
      risks[r.name] = v == null ? 0 : Number(v)
    } catch (e) {
      const err = e as Error & { help?: string | null }
      risks[r.name] = 0
      errors[i] = `${err.name}: ${err.message}${err.help ? ` (${err.help})` : ''}`
    }
    if (r.output) out[r.name] = risks[r.name]
  })
  const total = Object.values(out).reduce((a, b) => a + b, 0)
  return { risks, out, errors, total }
}

export default function App() {
  const [json, setJson] = useState(sampleJson)
  const [rows, setRows] = useState(sampleMatrix)

  const parsed = useMemo(() => {
    try {
      return { input: JSON.parse(json), error: null }
    } catch (e) {
      return { input: {}, error: (e as Error).message }
    }
  }, [json])

  const { risks, out, errors, total } = useMemo(() => run(parsed.input, rows), [parsed, rows])

  const update = (i: number, patch: Partial<Row>) =>
    setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  return (
    <div className="grid min-h-screen grid-cols-1 gap-4 bg-slate-50 p-4 text-sm text-slate-800 lg:grid-cols-[2fr_1fr] lg:grid-rows-[auto_24rem]">
      <section className="flex min-h-0 flex-col gap-2 lg:col-span-2">
        <h2 className="font-semibold">Matrix</h2>
        <div className="flex flex-col gap-2">
          {rows.map((r, i) => (
            <div key={i} className="flex items-start gap-3 rounded border border-slate-300 bg-white p-2">
              <div className="flex w-56 shrink-0 flex-col gap-1">
                <input
                  className="rounded border border-slate-300 px-1 py-0.5 font-medium"
                  value={r.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                />
                <span
                  className={`font-mono text-lg ${errors[i] || Number.isNaN(risks[r.name]) ? 'text-red-600' : ''}`}
                >
                  = {String(risks[r.name])}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <textarea
                  className="field-sizing-content min-h-16 w-full resize-y rounded border border-slate-300 p-2 font-mono"
                  value={r.expr}
                  onChange={(e) => update(i, { expr: e.target.value })}
                  spellCheck={false}
                />
                {errors[i] && <p className="mt-1 text-xs text-red-600">{errors[i]}</p>}
              </div>
              <input
                type="checkbox"
                title="Include in output"
                className="mt-1"
                checked={r.output}
                onChange={(e) => update(i, { output: e.target.checked })}
              />
              <button
                className="text-slate-400 hover:text-red-600"
                onClick={() => setRows(rows.filter((_, j) => j !== i))}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          className="self-start rounded bg-slate-800 px-3 py-1 text-white hover:bg-slate-700"
          onClick={() => setRows([...rows, { name: `metric_${rows.length + 1}`, expr: '0', output: true }])}
        >
          Add row
        </button>
      </section>

      <section className="flex min-h-0 flex-col gap-2">
        <h2 className="font-semibold">Input</h2>
        <textarea
          className="min-h-64 flex-1 rounded border border-slate-300 bg-white p-2 font-mono text-xs"
          value={json}
          onChange={(e) => setJson(e.target.value)}
          spellCheck={false}
        />
        {parsed.error && <p className="text-red-600">{parsed.error}</p>}
      </section>

      <section className="flex min-h-0 flex-col gap-2">
        <h2 className="font-semibold">Output</h2>
        <div className="rounded border border-slate-300 bg-white p-3">
          <div className="text-xs text-slate-500">Total risk score</div>
          <div className="text-3xl font-bold">{total.toFixed(2)}</div>
        </div>
        <pre className="flex-1 overflow-auto rounded border border-slate-300 bg-white p-2 font-mono text-xs">
          {JSON.stringify(out, null, 2)}
        </pre>
      </section>
    </div>
  )
}
