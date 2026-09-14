export default function ModeToggle({ mode, setMode }: { mode: 'realWorld'|'coder', setMode: any }) {
  return (
    <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
      <button onClick={() => setMode('realWorld')} className={`px-4 py-1 rounded ${mode === 'realWorld' ? 'bg-white shadow font-bold text-blue-600' : 'text-gray-500'}`}>Real World</button>
      <button onClick={() => setMode('coder')} className={`px-4 py-1 rounded ${mode === 'coder' ? 'bg-white shadow font-bold text-blue-600' : 'text-gray-500'}`}>Coder Mode</button>
    </div>
  );
}