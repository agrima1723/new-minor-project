 'use client'
import { Image as ImageIcon, Upload } from 'lucide-react';
import { useState } from 'react';
import { createWorker } from 'tesseract.js';

type Props = { onExtract: (text: string) => void }

export default function ImageUpload({ onExtract }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [status, setStatus] = useState('OCR will extract visible problem text')
  const [extractedText, setExtractedText] = useState('')

  const normalizeImage = (file: File) => new Promise<Blob>((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const scale = Math.min(2, 2400 / Math.max(image.naturalWidth, image.naturalHeight))
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('image processing is unavailable'))
        URL.revokeObjectURL(objectUrl)
        return
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
      for (let index = 0; index < pixels.data.length; index += 4) {
        const gray = Math.round(pixels.data[index] * 0.299 + pixels.data[index + 1] * 0.587 + pixels.data[index + 2] * 0.114)
        const contrast = gray > 180 ? 255 : gray < 100 ? 0 : gray
        pixels.data[index] = contrast
        pixels.data[index + 1] = contrast
        pixels.data[index + 2] = contrast
      }
      context.putImageData(pixels, 0, 0)
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('image conversion failed')), 'image/png')
      URL.revokeObjectURL(objectUrl)
    }
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('image load failed')) }
    image.src = objectUrl
  })

  const buildImageInsight = (text: string) => {
    const normalized = text.trim().toLowerCase()
    const hasRouteWords = /(map|route|road|street|traffic|path|distance|travel|shortest|from|to|destination|source)/.test(normalized)
    const locations = [
      'school',
      'home',
      'private house',
      'hospital',
      'bank',
      'park',
      'market',
      'office',
      'hotel',
      'station',
      'airport',
      'library',
      'church',
    ]
    const foundPlaces = locations.filter((place) => normalized.includes(place))
    const hasMultiplePlaces = new Set(foundPlaces).size >= 2

    if ((hasRouteWords && foundPlaces.length > 0) || hasMultiplePlaces) {
      const placeSummary = [...new Set(foundPlaces)].slice(0, 4).join(', ')
      return `Map route problem: this image shows locations such as ${placeSummary} connected by roads. Model places as graph nodes and roads as edges. Determine the shortest path from a selected start to the destination. Use BFS if all roads have equal cost; use Dijkstra's algorithm when road distances or travel times differ.`
    }

    return text || 'Map image uploaded. Describe the route, destination, and travel constraints for analysis.'
  }

  const handleFile = async (file?: File) => {
    if (!file) return
    setFileName(file.name)
    setPreview(URL.createObjectURL(file))
    setExtractedText('')
    setStatus('Extracting text...')
    let worker: Awaited<ReturnType<typeof createWorker>> | null = null
    try {
      worker = await createWorker('eng')
      const normalizedImage = await normalizeImage(file)
      const { data } = await worker.recognize(normalizedImage)
      const text = data.text.trim()
      const parsedText = buildImageInsight(text)
      setExtractedText(parsedText)
      onExtract(parsedText)
      const isMapScenario = parsedText.startsWith('Map route problem:')
      setStatus(isMapScenario ? 'Multiple labeled places detected. Review the route scenario below, then analyze.' : text ? 'Text extracted. Review it below, then analyze.' : 'No text found; describe the image or type the problem below')
    } catch {
      setStatus('OCR failed. Type or paste the problem text below.')
    } finally {
      await worker?.terminate()
    }
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <label htmlFor="problem-image-upload" className="block cursor-pointer hover:border-blue-400">
      {preview ? <img src={preview} alt="Uploaded problem preview" className="mx-auto mb-4 max-h-40 rounded-lg object-contain" /> : <ImageIcon className="mx-auto h-10 w-10 text-blue-600" />}
      <span className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-slate-800"><Upload className="h-4 w-4" /> {fileName || 'Upload a screenshot or problem image'}</span>
      <span className="mt-1 block text-xs text-slate-500">{status}</span>
      </label>
      <textarea value={extractedText} onChange={(event) => { setExtractedText(event.target.value); onExtract(event.target.value) }} rows={5} placeholder="Extracted problem text will appear here for review..." className="mt-4 w-full rounded-lg border border-slate-200 bg-white p-3 text-left text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" />
      <input id="problem-image-upload" type="file" accept="image/*" className="sr-only" onChange={(event) => handleFile(event.target.files?.[0])} />
    </div>
  );
}