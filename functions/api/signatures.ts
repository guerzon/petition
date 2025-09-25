import { CreateSignatureInput } from '../../src/db/schemas/types'
import { Env, EventContext } from '../_shared/types'
import { handleCORS, createErrorResponse, createSuccessResponse, getDbService } from '../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    
    if (context.request.method === 'POST') {
      const signatureData: CreateSignatureInput = await context.request.json()
      const signature = await db.createSignature(signatureData)
      return createSuccessResponse(signature)
    }

    return createErrorResponse('Method not allowed', 405)
  } catch (error) {
    console.error('Signatures API Error:', error)
    return createErrorResponse(error)
  }
}