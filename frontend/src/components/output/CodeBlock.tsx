export default function CodeBlock({ code }: { code: string }) {
  return (
    <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto font-mono text-sm mt-4">
      <pre><code>{code}</code></pre>
    </div>
  );
}