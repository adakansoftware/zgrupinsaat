import crypto from 'crypto'
import { z } from 'zod'

type SessionPayload = {
  sub: 'admin'
  exp: number
  iat: number
}

const sessionPayloadSchema = z.object({
  sub: z.literal('admin'),
  exp: z.number().int().positive(),
  iat: z.number().int().nonnegative(),
})

const MAX_SESSION_TOKEN_LENGTH = 512
const MAX_SESSION_PAYLOAD_LENGTH = 384
const SESSION_SIGNATURE_LENGTH = 43
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/
const MAX_SESSION_AGE_SECONDS = 24 * 60 * 60

function base64UrlEncode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function sign(value: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url')
}

export function createSignedAdminSessionToken(secret: string, maxAgeSeconds: number) {
  if (!Number.isInteger(maxAgeSeconds) || maxAgeSeconds <= 0 || maxAgeSeconds > MAX_SESSION_AGE_SECONDS) {
    throw new RangeError('Invalid session lifetime.')
  }

  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    sub: 'admin',
    iat: now,
    exp: now + maxAgeSeconds,
  }

  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  return `${encodedPayload}.${sign(encodedPayload, secret)}`
}

export function isValidSignedAdminSessionToken(token: string | undefined, secret: string) {
  if (!token) return false
  if (token.length > MAX_SESSION_TOKEN_LENGTH) return false

  const segments = token.split('.')
  if (segments.length !== 2) return false

  const [encodedPayload, signature] = segments
  if (!encodedPayload || !signature) return false
  if (encodedPayload.length > MAX_SESSION_PAYLOAD_LENGTH) return false
  if (signature.length !== SESSION_SIGNATURE_LENGTH) return false
  if (!BASE64URL_PATTERN.test(encodedPayload) || !BASE64URL_PATTERN.test(signature)) return false
  if (!safeEqual(sign(encodedPayload, secret), signature)) return false

  try {
    const payload = sessionPayloadSchema.parse(JSON.parse(base64UrlDecode(encodedPayload))) as SessionPayload
    const now = Math.floor(Date.now() / 1000)
    return payload.sub === 'admin' && payload.iat <= now && payload.exp > now
  } catch {
    return false
  }
}
