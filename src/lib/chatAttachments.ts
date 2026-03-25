import type { ChatAttachmentPayload } from '@/types/chatAttachments'

/** Tamanho máximo por ficheiro antes de base64 (evita corpo JSON enorme). */
export const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024

/** Máximo de anexos por mensagem. */
export const MAX_ATTACHMENTS_PER_MESSAGE = 4

const ACCEPT_INPUT =
  'image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain,audio/mpeg,audio/mp4,audio/webm,audio/wav,audio/x-m4a,audio/aac'

export function filePickerAccept(): string {
  return ACCEPT_INPUT
}

export function isAllowedMime(mime: string): boolean {
  const m = mime.toLowerCase()
  if (m.startsWith('image/')) return true
  if (
    m === 'application/pdf' ||
    m === 'text/plain' ||
    m.startsWith('audio/')
  ) {
    return true
  }
  return false
}

export async function fileToAttachment(file: File): Promise<ChatAttachmentPayload> {
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error(
      `O ficheiro "${file.name}" excede ${MAX_ATTACHMENT_BYTES / (1024 * 1024)} MB.`
    )
  }
  const mimeType = file.type || 'application/octet-stream'
  if (!isAllowedMime(mimeType)) {
    throw new Error(
      `Tipo não suportado: ${mimeType}. Use imagem, PDF, texto ou áudio.`
    )
  }
  const buf = await file.arrayBuffer()
  return { mimeType, data: bufferToBase64(buf), filename: file.name }
}

export async function blobToAttachment(
  blob: Blob,
  filename: string,
  mimeType: string
): Promise<ChatAttachmentPayload> {
  if (blob.size > MAX_ATTACHMENT_BYTES) {
    throw new Error(
      `O áudio excede ${MAX_ATTACHMENT_BYTES / (1024 * 1024)} MB. Grave um trecho mais curto.`
    )
  }
  const buf = await blob.arrayBuffer()
  return { mimeType, data: bufferToBase64(buf), filename }
}

function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

/** Texto persistido na thread (histórico legível) + texto enviado ao modelo. */
export function formatUserMessageForStorage(
  text: string,
  attachments: Pick<ChatAttachmentPayload, 'filename'>[]
): string {
  const t = text.trim()
  if (attachments.length === 0) return t
  const names = attachments.map((a) => a.filename ?? 'anexo').join(', ')
  const header = `[Anexos: ${names}]\n\n`
  return header + (t || '(Ver anexos.)')
}
