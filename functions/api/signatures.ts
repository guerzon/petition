import type { CreateSignatureInput } from '../../src/db/schemas/types'
import type { Env, EventContext } from '../_shared/types'
import { 
  handleCORS, 
  createErrorResponse, 
  createSuccessResponse, 
  getDbService,
  invalidateCachePattern 
} from '../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request, context.env)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    
    if (context.request.method === 'POST') {
      const signatureData: CreateSignatureInput = await context.request.json()
      const signature = await db.createSignature(signatureData)
      
      // Invalidate petition caches when a new signature is created
      // This ensures petition counts are updated immediately
      console.log(`✍️ New signature created for petition ${signatureData.petition_id} - invalidating petition caches`)
      await invalidateCachePattern('petitions:', context.env.CACHE)
      
      return createSuccessResponse(signature)
    }

    return createErrorResponse('Method not allowed', 405)
  } catch (error) {
    console.error('Signatures API Error:', error)
    return createErrorResponse(error)
  }
}