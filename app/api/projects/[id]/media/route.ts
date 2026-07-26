import { jsonError, jsonOk, readJson, withErrorHandling } from '@/lib/http'
import { mediaInputSchema } from '@/lib/validation'
import { assertAdminRequest, enforceRateLimit } from '@/lib/security'
import { assertRequestBodySize, assertRequestContentType } from '@/lib/request-guards'
import { writeAuditLog } from '@/lib/audit'
import { isValidUuidRouteParam } from '@/lib/route-params-core'
import { attachMediaToProject } from '@/lib/project-service'

type Params = { params: Promise<{ id: string }> }
const MEDIA_MUTATION_MAX_BYTES = 8 * 1024

export async function POST(request: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const ip = await enforceRateLimit(request, 'admin:media:create', 30, 10 * 60 * 1000)
    await assertAdminRequest(request)
    assertRequestContentType(request, ['application/json'])
    assertRequestBodySize(request, MEDIA_MUTATION_MAX_BYTES)

    const { id } = await params
    if (!isValidUuidRouteParam(id)) return jsonError(400, 'Gecersiz proje kimligi.')
    const payload = await readJson(request, mediaInputSchema, MEDIA_MUTATION_MAX_BYTES)
    const media = await attachMediaToProject(id, payload)
    if (!media) return jsonError(404, 'Proje bulunamadı.')

    await writeAuditLog({ action: 'media.attach', status: 'success', ip, target: id, detail: media.id })
    return jsonOk(media, { status: 201 })
  })
}
