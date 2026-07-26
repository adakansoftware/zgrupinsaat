import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api-error'
import { readRequestTextWithinLimit } from '@/lib/request-body-core'

export { getClientIp } from '@/lib/client-ip'

export function jsonOk<T>(data: T, init?: ResponseInit) {
  const headers = new Headers(init?.headers)
  // API responses can contain account- or workflow-specific state. Never allow an
  // intermediary cache to serve one request's response to another visitor.
  headers.set('Cache-Control', 'no-store, max-age=0')
  return NextResponse.json(data, { ...init, headers })
}

export function jsonNoStore<T>(data: T, init?: ResponseInit) {
  const headers = new Headers(init?.headers)
  headers.set('Cache-Control', 'no-store, max-age=0')
  return NextResponse.json(data, { ...init, headers })
}

export function jsonError(status: number, message: string, init?: ResponseInit) {
  const headers = new Headers(init?.headers)
  headers.set('Cache-Control', 'no-store, max-age=0')
  return NextResponse.json({ message }, { status, ...init, headers })
}

export async function readJson<T>(request: Request, parser: { parse: (value: unknown) => T }, maxBytes?: number): Promise<T> {
  const contentType = request.headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new ApiError(415, 'Istek icerigi JSON olmali.')
  }

  let rawBody: string
  try {
    rawBody = await readRequestTextWithinLimit(request, maxBytes)
  } catch (error) {
    if (error instanceof RangeError) {
      throw new ApiError(413, 'Istek boyutu siniri asildi.')
    }
    throw new ApiError(400, 'Gecersiz istek verisi.')
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody || 'null')
  } catch {
    throw new ApiError(400, 'Gecersiz istek verisi.')
  }

  try {
    return parser.parse(body)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ApiError(400, 'Gecersiz istek verisi.')
    }
    if (error instanceof ZodError) {
      throw new ApiError(400, error.issues[0]?.message || 'Girilen veriler gecersiz.')
    }
    throw error
  }
}

export function withErrorHandling(handler: () => Promise<NextResponse>) {
  return handler().catch((error) => {
    if (error instanceof ApiError) {
      return jsonError(error.status, error.exposeMessage)
    }

    return jsonError(500, 'Islem su anda tamamlanamadi.')
  })
}

export { ApiError }
