 'use client'
import { useState } from 'react';
import CodeBlock from './CodeBlock';
import Visualizer from './Visualizer';
import type { AlgorithmOption, AnalyzeResult } from '../../utils/api';

type Language = 'JavaScript' | 'Python' | 'C++'

function codeForLanguage(result: AnalyzeResult, language: Language) {
  const algorithm = result.algorithm_name || ''
  if (language === 'JavaScript') return result.code_snippet || '// No code snippet available'
  if (algorithm.includes('Binary Search')) {
    return language === 'Python'
      ? `def binary_search(values, target):\n    left, right = 0, len(values) - 1\n    while left <= right:\n        middle = (left + right) // 2\n        if values[middle] == target:\n            return middle\n        if values[middle] < target:\n            left = middle + 1\n        else:\n            right = middle - 1\n    return -1`
      : `int binarySearch(vector<int>& values, int target) {\n    int left = 0, right = values.size() - 1;\n    while (left <= right) {\n        int middle = left + (right - left) / 2;\n        if (values[middle] == target) return middle;\n        if (values[middle] < target) left = middle + 1;\n        else right = middle - 1;\n    }\n    return -1;\n}`
  }
  if (algorithm.includes('Two Sum')) {
    return language === 'Python'
      ? `def two_sum(numbers, target):\n    seen = {}\n    for index, value in enumerate(numbers):\n        complement = target - value\n        if complement in seen:\n            return [seen[complement], index]\n        seen[value] = index\n    return []`
      : `vector<int> twoSum(vector<int>& numbers, int target) {\n    unordered_map<int, int> seen;\n    for (int index = 0; index < numbers.size(); index++) {\n        int complement = target - numbers[index];\n        if (seen.count(complement)) return {seen[complement], index};\n        seen[numbers[index]] = index;\n    }\n    return {};\n}`
  }
  return language === 'Python'
    ? `# ${algorithm || 'Recommended algorithm'}\n# Translate the JavaScript example above while preserving its complexity.\n\nsolution = []`
    : `// ${algorithm || 'Recommended algorithm'}\n// Translate the JavaScript example above while preserving its complexity.\n\nvector<int> solution;`
}

export default function ResultsCard({ result, viewMode }: { result: AnalyzeResult | null, viewMode: string }) {
  const [language, setLanguage] = useState<Language>('JavaScript')
  if (!result) return null;
  const algorithm = result.algorithm_name || 'the recommended approach'
  const why = algorithm.includes('Dijkstra')
    ? 'Edge weights are non-negative, so repeatedly choosing the nearest unsettled node gives the shortest known route.'
    : algorithm.includes('Binary Search')
      ? 'The data is ordered, allowing half of the remaining search space to be discarded after every comparison.'
      : algorithm.includes('Two Sum')
        ? 'A hash map remembers earlier values, so each complement can be checked in constant average time.'
        : algorithm.includes('Sort')
          ? 'The input must be ordered; this approach keeps predictable performance while dividing the work into smaller parts.'
          : result.explanation
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
          <p className="mt-3 text-sm"><strong>Why this algorithm:</strong> {why}</p>
          <p className="text-sm"><strong>Prerequisite:</strong> {result.prerequisites}</p>
          <p className="text-sm"><strong>Limitation:</strong> {result.limitation}</p>
          <Visualizer steps={result.steps} />
          {result.alternatives && result.alternatives.length > 0 && <div className="mt-5 overflow-x-auto"><h3 className="mb-2 font-bold text-slate-900">Compare approaches</h3><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-emerald-200 text-xs uppercase text-slate-500"><th className="p-2">Algorithm</th><th className="p-2">Time</th><th className="p-2">Space</th><th className="p-2">Best when</th></tr></thead><tbody>{result.alternatives.map((option: AlgorithmOption) => <tr key={option.name} className="border-b border-emerald-100"><td className="p-2 font-semibold">{option.name}</td><td className="p-2">{option.time_complexity}</td><td className="p-2">{option.space_complexity}</td><td className="p-2">{option.reason}</td></tr>)}</tbody></table></div>}
        </div>
      )}
      {result.is_computational && viewMode === 'coder' && <div><div className="mb-3 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs uppercase text-slate-500">Estimated time</p><p className="font-bold">{result.time_complexity}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs uppercase text-slate-500">Auxiliary space</p><p className="font-bold">{result.space_complexity}</p></div></div><p className="mb-2 text-sm text-slate-600">Optimization hint: {result.alternatives?.[0]?.reason || 'Choose a data structure that matches the access pattern.'}</p><div className="mb-3 flex flex-wrap gap-2" aria-label="Generated code language"><span className="self-center text-xs font-bold uppercase tracking-wide text-slate-500">Generate in</span>{(['JavaScript', 'Python', 'C++'] as Language[]).map((option) => <button key={option} type="button" onClick={() => setLanguage(option)} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${language === option ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{option}</button>)}</div><CodeBlock code={codeForLanguage(result, language)} /></div>}
    </div>
  );
}