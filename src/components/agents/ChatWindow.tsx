import { Compass, Mic, Paperclip, Send, Square, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { MessageBubble } from '@/components/agents/MessageBubble'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  AGENT_CHAT_EMPTY_ICON,
  AGENT_CHAT_EMPTY_SURFACE,
} from '@/constants/agentHubVisual'
import {
  filePickerAccept,
  fileToAttachment,
  MAX_ATTACHMENTS_PER_MESSAGE,
  blobToAttachment,
} from '@/lib/chatAttachments'
import { cn } from '@/lib/utils'
import type { AgentType } from '@/types'
import type { ChatAttachmentPayload } from '@/types/chatAttachments'
import type { MessageRow } from '@/types/database'

interface ChatWindowProps {
  messages: MessageRow[]
  sending: boolean
  error: string | null
  onSend: (
    text: string,
    attachments?: ChatAttachmentPayload[]
  ) => Promise<boolean>
  projectId: string
  agentType: AgentType
  onInsightSaved?: () => void
  inputPlaceholder?: string
}

function pickAudioMime(): string | undefined {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ]
  for (const t of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
      return t
    }
  }
  return undefined
}

export function ChatWindow({
  messages,
  sending,
  error,
  onSend,
  projectId,
  agentType,
  onInsightSaved,
  inputPlaceholder = 'Escreva sua mensagem…',
}: ChatWindowProps) {
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState<ChatAttachmentPayload[]>([])
  const [localError, setLocalError] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [recordSecs, setRecordSecs] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordMimeRef = useRef<string>('audio/webm')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const audioSupported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined' &&
    !!pickAudioMime()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    const rec = mediaRecorderRef.current
    mediaRecorderRef.current = null
    if (rec && rec.state !== 'inactive') {
      rec.stop()
    } else {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setRecording(false)
    setRecordSecs(0)
  }, [])

  async function startRecording() {
    setLocalError(null)
    const mime = pickAudioMime()
    if (!mime || !navigator.mediaDevices?.getUserMedia) {
      setLocalError('Gravação de áudio não disponível neste navegador.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      recordMimeRef.current = mime
      const rec = new MediaRecorder(stream, { mimeType: mime })
      mediaRecorderRef.current = rec
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      rec.onerror = () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        setLocalError('Erro ao gravar áudio.')
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        mediaRecorderRef.current = null
        setRecording(false)
        setRecordSecs(0)
      }
      rec.onstop = async () => {
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        const blob = new Blob(chunksRef.current, { type: recordMimeRef.current })
        chunksRef.current = []
        if (blob.size < 200) return
        try {
          const ext =
            recordMimeRef.current.includes('webm') ? 'webm' : 'm4a'
          const att = await blobToAttachment(
            blob,
            `gravacao-${Date.now()}.${ext}`,
            recordMimeRef.current
          )
          setPending((p) => {
            if (p.length >= MAX_ATTACHMENTS_PER_MESSAGE) return p
            return [...p, att]
          })
        } catch (e: unknown) {
          setLocalError(
            e instanceof Error ? e.message : 'Não foi possível usar o áudio.'
          )
        }
      }
      rec.start(200)
      setRecording(true)
      setRecordSecs(0)
      timerRef.current = setInterval(() => {
        setRecordSecs((s) => s + 1)
      }, 1000)
    } catch {
      setLocalError(
        'Não foi possível aceder ao microfone. Verifique as permissões.'
      )
    }
  }

  function handleToggleRecord() {
    if (recording) {
      stopRecording()
      return
    }
    void startRecording()
  }

  async function onFilesSelected(files: FileList | null) {
    if (!files?.length) return
    setLocalError(null)
    const next: ChatAttachmentPayload[] = [...pending]
    for (let i = 0; i < files.length; i++) {
      if (next.length >= MAX_ATTACHMENTS_PER_MESSAGE) {
        setLocalError(`No máximo ${MAX_ATTACHMENTS_PER_MESSAGE} anexos.`)
        break
      }
      try {
        next.push(await fileToAttachment(files[i]!))
      } catch (e: unknown) {
        setLocalError(e instanceof Error ? e.message : 'Ficheiro inválido.')
      }
    }
    setPending(next)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function submit() {
    const t = draft.trim()
    if ((!t && pending.length === 0) || sending) return
    setLocalError(null)
    const ok = await onSend(t, pending.length > 0 ? pending : undefined)
    if (ok) {
      setDraft('')
      setPending([])
    }
  }

  const canSend =
    (draft.trim().length > 0 || pending.length > 0) && !sending && !recording

  const fmtTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="flex h-[min(70vh,560px)] min-h-[360px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-none">
      <ScrollArea className="min-h-0 flex-1 px-4 py-4">
        <div className="space-y-4 pr-2">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center px-2 py-14 text-center">
              <div
                className={cn(
                  'mb-5 flex size-[88px] items-center justify-center rounded-2xl',
                  AGENT_CHAT_EMPTY_SURFACE
                )}
                aria-hidden
              >
                <Compass
                  className={cn('size-11', AGENT_CHAT_EMPTY_ICON)}
                  strokeWidth={1.15}
                />
              </div>
              <p className="text-[17px] font-semibold text-[#070F26]">
                Inicie a conversa
              </p>
              <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-slate-600">
                O agente já recebe o contexto do projeto. Escreva, envie imagens,
                PDFs ou áudio gravado aqui.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              id={m.id}
              role={m.role}
              content={m.content}
              created_at={m.created_at}
              projectId={projectId}
              agentType={agentType}
              onInsightSaved={onInsightSaved}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {(error || localError) && (
        <div className="px-4 text-sm text-[#E42600]" role="alert">
          {localError ?? error}
        </div>
      )}

      {pending.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-2">
          {pending.map((a, i) => (
            <span
              key={`${a.filename ?? 'f'}-${i}`}
              className="inline-flex max-w-[200px] items-center gap-1 rounded-full border border-slate-200 bg-white py-1 pl-2.5 pr-1 text-[11px] text-slate-700"
              title={a.filename}
            >
              <span className="truncate">{a.filename ?? 'Anexo'}</span>
              <button
                type="button"
                className="rounded-full p-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                onClick={() =>
                  setPending((p) => p.filter((_, j) => j !== i))
                }
                aria-label="Remover anexo"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {recording && (
        <div className="flex items-center justify-center gap-2 border-t border-red-100 bg-red-50/90 px-4 py-2 text-sm font-medium text-red-800">
          <span className="inline-flex size-2 animate-pulse rounded-full bg-red-500" />
          Gravando {fmtTime(recordSecs)}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="ml-2 h-8 border-red-200 bg-white"
            onClick={() => stopRecording()}
          >
            <Square className="mr-1 size-3 fill-current" />
            Parar e anexar
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2 border-t border-slate-200 bg-[#F8F9FA] p-3 sm:p-4">
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept={filePickerAccept()}
          multiple
          onChange={(e) => void onFilesSelected(e.target.files)}
        />
        <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 rounded-full text-slate-600 hover:bg-white hover:text-primary"
            disabled={sending || pending.length >= MAX_ATTACHMENTS_PER_MESSAGE}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Anexar ficheiros"
            title="Imagens, PDF, texto ou áudio"
          >
            <Paperclip className="size-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'size-10 rounded-full',
              recording
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'text-slate-600 hover:bg-white hover:text-primary'
            )}
            disabled={
              sending ||
              !audioSupported ||
              pending.length >= MAX_ATTACHMENTS_PER_MESSAGE
            }
            onClick={() => handleToggleRecord()}
            aria-label={recording ? 'Parar gravação' : 'Gravar áudio'}
            title={
              audioSupported
                ? recording
                  ? 'Parar'
                  : 'Gravar nota de voz'
                : 'Áudio não suportado neste navegador'
            }
          >
            {recording ? <Square className="size-5 fill-current" /> : <Mic className="size-5" />}
          </Button>
        </div>

        <div className="focus-within:border-primary/45 focus-within:ring-primary/15 flex min-h-[48px] min-w-0 flex-1 items-center rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm ring-0 transition-[border-color,box-shadow] focus-within:ring-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={inputPlaceholder}
            rows={1}
            className="max-h-32 min-h-[28px] resize-none border-0 bg-transparent px-0 py-1.5 text-[13px] shadow-none placeholder:text-slate-400 focus-visible:ring-0"
            disabled={sending || recording}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void submit()
              }
            }}
          />
        </div>
        <Button
          type="button"
          size="icon"
          className="size-11 shrink-0 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary-dark disabled:opacity-50"
          disabled={!canSend}
          onClick={() => void submit()}
          aria-label={sending ? 'Enviando' : 'Enviar mensagem'}
        >
          <Send className="size-5" />
        </Button>
      </div>
    </div>
  )
}
