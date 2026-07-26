import { jsonError, jsonOk, readJson, withErrorHandling } from '@/lib/http'
import { messageStateSchema } from '@/lib/validation'
import { assertAdminRequest, enforceRateLimit } from '@/lib/security'
import { assertRequestBodySize, assertRequestContentType } from '@/lib/request-guards'
import { writeAuditLog } from '@/lib/audit'
import { isValidUuidRouteParam } from '@/lib/route-params-core'
import { deleteMessage, updateMessageReadState } from '@/lib/message-service'

type Params = { params: Promise<{ id: string }> }
const MESSAGE_UPDATE_MAX_BYTES = 1024

export async function PATCH(request: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const ip = await enforceRateLimit(request, 'admin:messages:update', 50, 10 * 60 * 1000)
    await assertAdminRequest(request)
    assertRequestContentType(request, ['application/json'])
    assertRequestBodySize(request, MESSAGE_UPDATE_MAX_BYTES)

    const { id } = await params
    if (!isValidUuidRouteParam(id)) return jsonError(400, 'Gecersiz mesaj kimligi.')
    const payload = await readJson(request, messageStateSchema, MESSAGE_UPDATE_MAX_BYTES)
    const message = await updateMessageReadState(id, payload.isRead)

    if (!message) {
      return jsonError(404, 'Mesaj bulunamadı.')
    }

    await writeAuditLog({ action: 'message.update', status: 'success', ip, target: id })
    return jsonOk(message)
  })
}

export async function DELETE(request: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const ip = await enforceRateLimit(request, 'admin:messages:delete', 30, 10 * 60 * 1000)
    await assertAdminRequest(request)

    const { id } = await params
    if (!isValidUuidRouteParam(id)) return jsonError(400, 'Gecersiz mesaj kimligi.')
    const deleted = await deleteMessage(id)

    if (!deleted) {
      return jsonError(404, 'Mesaj bulunamadı.')
    }

    await writeAuditLog({ action: 'message.delete', status: 'success', ip, target: id })
    return jsonOk({ success: true })
  })
}
