'use client'
import { useState } from 'react';
import Header from '../components/layout/Header';
import ModeToggle from '../components/layout/ModeToggle';
import TextInput from '../components/input/TextInput';
import VoiceRecorder from '../components/input/VoiceRecorder';
import ImageUpload from '../components/input/ImageUpload';
import ResultsCard from '../components/output/ResultsCard';
import { analyzeText, type AnalyzeResult } from '../utils/api';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [viewMode, setViewMode] = useState<'realWorld'|'coder'>('realWorld');
  const [inputMode, setInputMode] = useState<'text'|'voice'|'image'>('text');
  const [codeInput, setCodeInput] = useState('');
  const [codeAnalysis, setCodeAnalysis] = useState<{ time: string; space: string; notes: string[] } | null>(null);

  const handleAnalyze = async () => {
    try {
      const data = await analyzeText(inputText);
      setResult(data);
    } catch {
      alert('Analysis failed');
    }
  };

  const handleCodeAnalysis = () => {
    const nestedLoops = (codeInput.match(/\b(for|while)\b/g) || []).length > 1;
    const hasRecursion = /\bfunction\s+(\w+)[\s\S]*\1\s*\(/.test(codeInput);
    setCodeAnalysis({
      time: hasRecursion ? 'O(2ⁿ) or problem-dependent' : nestedLoops ? 'O(n²) estimated' : 'O(n) estimated',
      space: hasRecursion ? 'O(n) call stack' : 'O(1) auxiliary',
      notes: [
        nestedLoops ? 'Nested loops detected. Consider indexing or a hash map.' : 'No nested loop pattern detected.',
        hasRecursion ? 'Recursive calls detected. Check the base case and stack depth.' : 'No direct recursion detected.',
      ],
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <Header />
      <div className="mx-auto max-w-5xl px-4">
        
        <div className="flex justify-between items-center mb-4">
            <div className="flex rounded-lg bg-white p-1 shadow-sm">
              {(['text', 'voice', 'image'] as const).map((mode) => <button key={mode} onClick={() => setInputMode(mode)} className={`rounded-md px-3 py-1.5 text-sm font-semibold capitalize ${inputMode === mode ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>{mode}</button>)}
           </div>
           <ModeToggle mode={viewMode} setMode={setViewMode} />
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          {inputMode === 'text' && <TextInput value={inputText} onChange={setInputText} />}
          {inputMode === 'voice' && <VoiceRecorder onTranscript={setInputText} />}
          {inputMode === 'image' && <ImageUpload onExtract={setInputText} />}
          
          <button onClick={handleAnalyze} className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Map Scenario
          </button>
        </div>

        {viewMode === 'coder' && <section className="mt-6 rounded-xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Code lab</p><h2 className="text-xl font-bold text-slate-900">Analyze your implementation</h2></div><button type="button" onClick={handleCodeAnalysis} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Analyze code</button></div><textarea value={codeInput} onChange={(event) => setCodeInput(event.target.value)} rows={7} placeholder="Paste a function to estimate time and auxiliary space..." className="mt-4 w-full rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-sm text-emerald-300 outline-none focus:ring-2 focus:ring-blue-500" />{codeAnalysis && <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-blue-50 p-3"><p className="text-xs uppercase text-slate-500">Time complexity</p><p className="font-bold text-blue-900">{codeAnalysis.time}</p></div><div className="rounded-lg bg-emerald-50 p-3"><p className="text-xs uppercase text-slate-500">Auxiliary space</p><p className="font-bold text-emerald-900">{codeAnalysis.space}</p></div><div className="sm:col-span-2">{codeAnalysis.notes.map((note) => <p key={note} className="text-sm text-slate-600">• {note}</p>)}</div></div>}</section>}

        <ResultsCard result={result} viewMode={viewMode} />
      </div>
    </div>
  );
}