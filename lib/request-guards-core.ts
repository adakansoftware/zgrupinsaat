export function getComparableOrigin(value: string | null) {
  if (!value) return null

  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export function hasMatchingOrigin(origin: string | null, allowedOrigin: string) {
  return !origin || origin === allowedOrigin
}

export function isTrustedOriginRequest(request: Request, allowedOrigin: string | null) {
  if (!allowedOrigin) return false

  const fetchSite = request.headers.get('sec-fetch-site')?.toLowerCase()
  if (fetchSite && !['same-origin', 'same-site', 'none'].includes(fetchSite)) {
    return false
  }

  const requestOrigin = getComparableOrigin(request.headers.get('origin'))
  const refererOrigin = getComparableOrigin(request.headers.get('referer'))

  if (!requestOrigin && !refererOrigin) {
    return false
  }

  return hasMatchingOrigin(requestOrigin, allowedOrigin) && hasMatchingOrigin(refererOrigin, allowedOrigin)
}

export function isAllowedRequestContentType(request: Request, allowedContentTypes: string[]) {
  const mediaType = request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() || ''
  return allowedContentTypes.some((value) => mediaType === value.toLowerCase())
}

export function isRequestBodyWithinLimit(request: Request, maxBytes: number) {
  const rawContentLength = request.headers.get('content-length')
  if (!rawContentLength) return true

  const contentLength = Number(rawContentLength)
  return Number.isFinite(contentLength) && contentLength >= 0 && contentLength <= maxBytes
}
