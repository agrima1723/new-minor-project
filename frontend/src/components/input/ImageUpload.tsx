 'use client'
import { Image as ImageIcon, Upload } from 'lucide-react';
import { useState } from 'react';
import { createWorker } from 'tesseract.js';

type Props = { onExtract: (text: string) => void }

export default function ImageUpload({ onExtract }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [status, setStatus] = useState('OCR will extract visible problem text')

  const normalizeImage = (file: File) => new Promise<Blob>((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      canvas.getContext('2d')?.drawImage(image, 0, 0)
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('image conversion failed')), 'image/png')
      URL.revokeObjectURL(objectUrl)
    }
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('image load failed')) }
    image.src = objectUrl
  })

  const handleFile = async (file?: File) => {
    if (!file) return
    setFileName(file.name)
    setPreview(URL.createObjectURL(file))
    setStatus('Extracting text...')
    try {
      const worker = await createWorker('eng')
      const normalizedImage = await normalizeImage(file)
      const { data } = await worker.recognize(normalizedImage)
      await worker.terminate()
      onExtract(data.text.trim() || `Problem shown in uploaded image: ${file.name}. Please analyze the algorithmic task.`)
      setStatus(data.text.trim() ? 'Text extracted and ready to analyze' : 'No text found; add context manually')
    } catch {
      onExtract(`Uploaded problem image: ${file.name}. OCR was unavailable, so analyze the visible algorithmic problem from this image.`)
      setStatus('OCR unavailable, but image context is ready. Click Map Scenario.')
    }
  }

  return (
    <label className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-blue-400">
      {preview ? <img src={preview} alt="Uploaded problem preview" className="mx-auto mb-4 max-h-40 rounded-lg object-contain" /> : <ImageIcon className="mx-auto h-10 w-10 text-blue-600" />}
      <span className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-slate-800"><Upload className="h-4 w-4" /> {fileName || 'Upload a screenshot or problem image'}</span>
      <span className="mt-1 block text-xs text-slate-500">{status}</span>
      <input type="file" accept="image/*" className="sr-only" onChange={(event) => handleFile(event.target.files?.[0])} />
    </label>
  );
}