import crypto from 'node:crypto'
import { Resend } from 'resend'
import { jsonOk, readJson, withErrorHandling, ApiError } from '@/lib/http'
import { messageInputSchema } from '@/lib/validation'
import { assertTrustedMutationRequest, enforceIdentifierRateLimit, enforceRateLimit } from '@/lib/security'
import { assertRequestBodySize, assertRequestContentType } from '@/lib/request-guards'
import { writeAuditLog } from '@/lib/audit'
import { submitContactMessage } from '@/lib/message-service'

const CONTACT_REQUEST_MAX_BYTES = 8 * 1024

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildReference() {
  return crypto.randomUUID().split('-')[0]?.toUpperCase() || 'TLP'
}

function buildMailHtml(payload: { name: string; phone: string; email: string; subject: string; message: string }, reference: string) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 16px;">Yeni Teklif / İletişim Talebi</h2>
      <p><strong>Talep Referansı:</strong> ${escapeHtml(reference)}</p>
      <p><strong>Ad Soyad:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>Telefon:</strong> ${escapeHtml(payload.phone || '-')}</p>
      <p><strong>E-posta:</strong> ${escapeHtml(payload.email || '-')}</p>
      <p><strong>İş Kapsamı:</strong> ${escapeHtml(payload.subject)}</p>
      <p><strong>Saha Bilgisi:</strong></p>
      <div style="white-space: pre-wrap; border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px;">${escapeHtml(payload.message)}</div>
    </div>
  `
}

function buildMailText(payload: { name: string; phone: string; email: string; subject: string; message: string }, reference: string) {
  return [
    'Yeni Teklif / İletişim Talebi',
    `Talep Referansı: ${reference}`,
    `Ad Soyad: ${payload.name}`,
    `Telefon: ${payload.phone || '-'}`,
    `E-posta: ${payload.email || '-'}`,
    `İş Kapsamı: ${payload.subject}`,
    'Saha Bilgisi:',
    payload.message,
  ].join('\n')
}

async function sendContactMail(payload: { name: string; phone: string; email: string; subject: string; message: string }, reference: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim()

  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[mock-contact-email]', { to: 'teklif@zgrupinsaat.com', reference, payload })
      return
    }

    throw new ApiError(500, 'E-posta servisi şu anda yapılandırılmamış.')
  }

  const resend = new Resend(apiKey)
  await resend.emails.send({
    from: process.env.RESEND_FROM?.trim() || 'onboarding@resend.dev',
    to: ['teklif@zgrupinsaat.com'],
    subject: `Yeni Talep: ${payload.subject}`,
    html: buildMailHtml(payload, reference),
    text: buildMailText(payload, reference),
    replyTo: payload.email || undefined,
  })
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    assertTrustedMutationRequest(request)
    assertRequestContentType(request, ['application/json'])
    assertRequestBodySize(request, CONTACT_REQUEST_MAX_BYTES)
    const ip = await enforceRateLimit(request, 'contact', 6, 15 * 60 * 1000)
    const payload = await readJson(request, messageInputSchema, CONTACT_REQUEST_MAX_BYTES)

    if (payload.email) {
      await enforceIdentifierRateLimit(payload.email, 'contact:email', 4, 30 * 60 * 1000)
    }
    if (payload.phone) {
      await enforceIdentifierRateLimit(payload.phone, 'contact:phone', 4, 30 * 60 * 1000)
    }
    await enforceIdentifierRateLimit(`${payload.subject}|${payload.message.slice(0, 160)}`, 'contact:message', 3, 30 * 60 * 1000)

    let reference = buildReference()
    let target = reference

    try {
      const item = await submitContactMessage(payload)
      reference = item.reference || reference
      target = item.id
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        throw error
      }

      console.error('[contact-storage-warning]', error)
    }

    await sendContactMail(payload, reference)
    await writeAuditLog({ action: 'contact.submit', status: 'success', ip, target })

    return jsonOk(
      {
        success: true,
        message: 'Talebiniz başarıyla iletildi. En kısa sürede sizinle iletişime geçeceğiz.',
        reference,
      },
      { status: 201 },
    )
  })
}
