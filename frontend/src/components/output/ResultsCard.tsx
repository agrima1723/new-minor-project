import CodeBlock from './CodeBlock';
import Visualizer from './Visualizer';
import type { AlgorithmOption, AnalyzeResult } from '../../utils/api';

export default function ResultsCard({ result, viewMode }: { result: AnalyzeResult | null, viewMode: string }) {
  if (!result) return null;
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border mt-6">
      <h2 className="text-xl font-bold mb-4">Analysis Result</h2>
      <div className={`p-4 rounded-lg border-l-4 mb-4 ${result.is_computational ? 'bg-blue-50 border-blue-500' : 'bg-orange-50 border-orange-500'}`}>
        <p><strong>Intent:</strong> {result.is_computational ? 'Computational' : 'Abstract/Emotional'}</p>
      </div>
      <p><strong>Explanation:</strong> {result.explanation}</p>
      
      {result.is_computational && viewMode === 'realWorld' && (
        <div className="mt-4 rounded-lg bg-emerald-50 p-4">
          <div className="grid gap-3 sm:grid-cols-2"><p><strong>Algorithm:</strong> {result.algorithm_name}</p><p><strong>Category:</strong> {result.category}</p><p><strong>Time:</strong> {result.time_complexity}</p><p><strong>Space:</strong> {result.space_complexity}</p></div>
          <p className="mt-3 text-sm"><strong>Prerequisite:</strong> {result.prerequisites}</p>
          <p className="text-sm"><strong>Limitation:</strong> {result.limitation}</p>
          <Visualizer steps={result.steps} />
          {result.alternatives && result.alternatives.length > 0 && <div className="mt-5 overflow-x-auto"><h3 className="mb-2 font-bold text-slate-900">Compare approaches</h3><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-emerald-200 text-xs uppercase text-slate-500"><th className="p-2">Algorithm</th><th className="p-2">Time</th><th className="p-2">Space</th><th className="p-2">Best when</th></tr></thead><tbody>{result.alternatives.map((option: AlgorithmOption) => <tr key={option.name} className="border-b border-emerald-100"><td className="p-2 font-semibold">{option.name}</td><td className="p-2">{option.time_complexity}</td><td className="p-2">{option.space_complexity}</td><td className="p-2">{option.reason}</td></tr>)}</tbody></table></div>}
        </div>
      )}
      {result.is_computational && viewMode === 'coder' && <div><div className="mb-3 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs uppercase text-slate-500">Estimated time</p><p className="font-bold">{result.time_complexity}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs uppercase text-slate-500">Auxiliary space</p><p className="font-bold">{result.space_complexity}</p></div></div><p className="mb-2 text-sm text-slate-600">Optimization hint: {result.alternatives?.[0]?.reason || 'Choose a data structure that matches the access pattern.'}</p><CodeBlock code={result.code_snippet || '// No code snippet available'} /></div>}
    </div>
  );
}