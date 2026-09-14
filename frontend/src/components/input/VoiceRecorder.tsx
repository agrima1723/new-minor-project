'use client'

import { Mic, MicOff } from 'lucide-react'
import { useRef, useState } from 'react'
import { transcribeAudio } from '../../utils/api'

type Props = { onTranscript: (text: string) => void }

export default function VoiceRecorder({ onTranscript }: Props) {
  const [recording, setRecording] = useState(false)
  const [status, setStatus] = useState('Tap to record locally')
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const toggleRecording = async () => {
    if (recording && recorderRef.current) {
      recorderRef.current.stop()
      setRecording(false)
      setStatus('Transcribing locally...')
      return
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setStatus('Audio recording is not supported. Use the text box below.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType })
      streamRef.current = stream
      recorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data) }
      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach((track) => track.stop())
        try {
          const text = await transcribeAudio(new Blob(chunksRef.current, { type: mimeType }))
          if (!text) {
            setStatus('No speech detected. Hold the mic for 2-3 seconds while speaking.')
            return
          }
          onTranscript(text)
          setStatus('Transcript captured locally')
        } catch {
          setStatus('Local transcription failed. Check the backend and try again.')
        }
      }
      recorder.start(1000)
      setRecording(true)
      setStatus('Recording... tap again to transcribe')
    } catch {
      setStatus('Microphone permission denied. Use the text box below.')
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <button type="button" onClick={toggleRecording} aria-label={recording ? 'Stop recording' : 'Start voice input'} className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${recording ? 'bg-red-600 text-white' : 'bg-white text-red-600 shadow-sm'}`}>
        {recording ? <MicOff /> : <Mic />}
      </button>
      <p className="mt-3 text-sm font-medium text-slate-700">{status}</p>
      <p className="mt-1 text-xs text-slate-500">Audio is recorded in the browser and transcribed by the local backend.</p>
      <textarea onChange={(event) => onTranscript(event.target.value)} rows={2} placeholder="Mic unavailable? Type your scenario here..." className="mt-5 w-full rounded-lg border border-slate-200 bg-white p-3 text-left text-sm outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )
}
