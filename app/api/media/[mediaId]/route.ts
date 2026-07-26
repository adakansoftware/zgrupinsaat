import { jsonError, jsonOk, readJson, withErrorHandling } from '@/lib/http'
import { mediaUpdateSchema } from '@/lib/validation'
import { assertAdminRequest, enforceRateLimit } from '@/lib/security'
import { assertRequestBodySize, assertRequestContentType } from '@/lib/request-guards'
import { writeAuditLog } from '@/lib/audit'
import { isValidUuidRouteParam } from '@/lib/route-params-core'
import { deleteProjectMedia, updateProjectMedia } from '@/lib/project-service'

type Params = { params: Promise<{ mediaId: string }> }
const MEDIA_UPDATE_MAX_BYTES = 4 * 1024

export async function DELETE(request: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const ip = await enforceRateLimit(request, 'admin:media:delete', 30, 10 * 60 * 1000)
    await assertAdminRequest(request)

    const { mediaId } = await params
    if (!isValidUuidRouteParam(mediaId)) return jsonError(400, 'Gecersiz medya kimligi.')
    const deleted = await deleteProjectMedia(mediaId)

    if (!deleted) {
      return jsonError(404, 'Medya bulunamadı.')
    }

    await writeAuditLog({ action: 'media.delete', status: 'success', ip, target: mediaId })
    return jsonOk({ success: true })
  })
}

export async function PATCH(request: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const ip = await enforceRateLimit(request, 'admin:media:update', 40, 10 * 60 * 1000)
    await assertAdminRequest(request)
    assertRequestContentType(request, ['application/json'])
    assertRequestBodySize(request, MEDIA_UPDATE_MAX_BYTES)

    const { mediaId } = await params
    if (!isValidUuidRouteParam(mediaId)) return jsonError(400, 'Gecersiz medya kimligi.')
    const payload = await readJson(request, mediaUpdateSchema, MEDIA_UPDATE_MAX_BYTES)
    const updated = await updateProjectMedia(mediaId, payload)

    if (!updated) {
      return jsonError(404, 'Medya bulunamadı.')
    }

    await writeAuditLog({ action: 'media.update', status: 'success', ip, target: mediaId })
    return jsonOk(updated)
  })
}
