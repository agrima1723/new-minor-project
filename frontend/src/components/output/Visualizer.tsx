 'use client'
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { AlgorithmStep } from '../../utils/api'

export default function Visualizer({ steps = [] }: { steps?: AlgorithmStep[] }) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const current = steps[step]

  useEffect(() => {
    if (!playing || steps.length < 2) return
    const timer = window.setInterval(() => setStep((value) => value >= steps.length - 1 ? 0 : value + 1), 1800 / speed)
    return () => window.clearInterval(timer)
  }, [playing, speed, steps.length])

  if (!current) return <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Visualization steps will appear after analysis.</div>

  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Step {step + 1} of {steps.length}</p><h3 className="text-lg font-bold text-slate-900">{current.label}</h3><p className="text-sm text-slate-600">{current.detail}</p></div>
        <div className="flex items-center gap-1">
          <button type="button" title="Reset" onClick={() => { setStep(0); setPlaying(false) }} className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><RotateCcw size={16} /></button>
          <button type="button" title="Previous step" onClick={() => setStep((value) => Math.max(0, value - 1))} className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><SkipBack size={16} /></button>
          <button type="button" title={playing ? 'Pause' : 'Play'} onClick={() => setPlaying((value) => !value)} className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700">{playing ? <Pause size={16} /> : <Play size={16} />}</button>
          <button type="button" title="Next step" onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))} className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><SkipForward size={16} /></button>
        </div>
      </div>
      <div className="mt-5 flex min-h-24 items-center justify-center gap-2 rounded-lg bg-slate-50 p-4">
        {current.values?.map((value, index) => <div key={`${value}-${index}`} className={`flex h-12 w-12 items-center justify-center rounded-md border-2 text-sm font-bold transition ${current.active?.includes(index) ? 'border-blue-600 bg-blue-100 text-blue-800' : 'border-slate-200 bg-white text-slate-700'}`}>{value}</div>)}
        {current.visited && <div className="flex gap-2">{['A', 'B', 'C', 'D'].map((node) => <div key={node} className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${current.visited?.includes(node) ? 'border-emerald-600 bg-emerald-100 text-emerald-800' : 'border-slate-300 bg-white text-slate-500'}`}>{node}</div>)}</div>}
      </div>
      {current.queue && <p className="mt-3 text-sm text-slate-600"><span className="font-semibold text-slate-900">Queue:</span> {current.queue.join(' -> ')}</p>}
      <label className="mt-4 flex items-center gap-3 text-xs font-semibold text-slate-500">Speed <input type="range" min="0.5" max="2" step="0.5" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /></label>
    </div>
  );
}