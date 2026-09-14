export default function TextInput({ value, onChange }: { value: string, onChange: any }) {
  return (
    <textarea 
      rows={4} 
      className="w-full p-4 border rounded-lg focus:ring-2 outline-none"
      placeholder="Describe a real world scenario..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}