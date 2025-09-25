import { Env, EventContext } from '../../_shared/types'
import { handleCORS, createErrorResponse, createSuccessResponse, createNotFoundResponse, getDbService } from '../../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    const petitionId = parseInt(context.params.id)
    
    if (isNaN(petitionId)) {
      return createErrorResponse('Invalid petition ID', 400)
    }

    if (context.request.method === 'GET') {
      const petition = await db.getPetitionById(petitionId)
      if (!petition) {
        return createNotFoundResponse('Petition not found')
      }
      return createSuccessResponse(petition)
    }

    return createErrorResponse('Method not allowed', 405)
  } catch (error) {
    console.error('Petition by ID API Error:', error)
    return createErrorResponse(error)
  }
}