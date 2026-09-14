import { SearchCode } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center justify-center py-6 border-b bg-white shadow-sm mb-6">
      <SearchCode className="w-8 h-8 text-blue-600 mr-3" />
      <h1 className="text-3xl font-bold">AlgoLens</h1>
    </header>
  );
}