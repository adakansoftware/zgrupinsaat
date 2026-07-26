import path from 'path'

export function isCleanPublicPathUrl(fileUrl: string, rootSegment: 'images' | 'uploads') {
  if (fileUrl.length > 500) return false

  let decodedUrl: string
  try {
    decodedUrl = decodeURIComponent(fileUrl)
  } catch {
    return false
  }

  if (decodedUrl.includes('\\') || decodedUrl.includes('\0')) return false
  if (!decodedUrl.startsWith(`/${rootSegment}/`)) return false

  const segments = decodedUrl.split('/').filter(Boolean)
  return segments[0] === rootSegment && !segments.some((segment) => segment === '.' || segment === '..')
}

export function isPathInside(parent: string, child: string) {
  const relative = path.relative(parent, child)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}
