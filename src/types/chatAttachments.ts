/** Parte multimodal enviada ao Gemini (base64 sem prefixo data:). */
export type ChatAttachmentPayload = {
  mimeType: string
  /** Base64 (raw, sem prefixo data:) */
  data: string
  filename?: string
}
