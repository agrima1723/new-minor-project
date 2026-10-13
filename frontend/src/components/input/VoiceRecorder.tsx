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
  const recognitionRef = useRef<any>(null)

  const getRecordingFormat = () => {
    const formats = [
      { mime: 'audio/webm;codecs=opus', extension: 'webm' },
      { mime: 'audio/mp4', extension: 'mp4' },
      { mime: 'audio/ogg;codecs=opus', extension: 'ogg' },
    ]
    return formats.find(({ mime }) => MediaRecorder.isTypeSupported(mime)) || { mime: '', extension: 'webm' }
  }

  const handleTranscript = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) {
      setStatus('No speech detected. Try again with a clear sample.')
      return
    }
    onTranscript(trimmed)
    setStatus('Transcript captured successfully')
  }

  const startSpeechRecognition = () => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionCtor) {
      return false
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript ?? '')
        .join(' ')
        .trim()

      if (transcript) {
        handleTranscript(transcript)
      }
    }

    recognition.onerror = (event: any) => {
      const supportedError = event?.error === 'not-allowed' || event?.error === 'service-not-allowed'
      setStatus(supportedError ? 'Microphone permission is blocked. Allow access and try again.' : 'Speech recognition failed. Use the text box below.')
      setRecording(false)
    }

    recognition.onend = () => {
      recognitionRef.current = null
      setRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setRecording(true)
    setStatus('Listening... say your scenario')
    return true
  }

  const toggleRecording = async () => {
    if (recording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        setStatus('Stopping voice capture...')
        return
      }

      if (recorderRef.current) {
        recorderRef.current.stop()
        setRecording(false)
        setStatus('Transcribing locally...')
      }
      return
    }

    if (startSpeechRecognition()) {
      return
    }

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setStatus('Audio recording is not supported in this browser. Use the text box below.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const format = getRecordingFormat()
      const recorder = new MediaRecorder(stream, format.mime ? { mimeType: format.mime } : undefined)
      streamRef.current = stream
      recorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data) }
      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        recorderRef.current = null

        try {
          const audio = new Blob(chunksRef.current, { type: recorder.mimeType || format.mime || 'audio/webm' })
          const text = await transcribeAudio(audio, `voice.${format.extension}`)
          handleTranscript(text)
        } catch (error) {
          const message = error instanceof Error ? error.message : ''
          setStatus(message.includes('Whisper') ? 'Speech model is unavailable. Start the backend and try again.' : 'Transcription failed. Check the backend and try again.')
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
      <p className="mt-1 text-xs text-slate-500">Audio is captured in the browser and transcribed locally when speech recognition is available.</p>
      <textarea onChange={(event) => onTranscript(event.target.value)} rows={2} placeholder="Mic unavailable? Type your scenario here..." className="mt-5 w-full rounded-lg border border-slate-200 bg-white p-3 text-left text-sm outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )
}
