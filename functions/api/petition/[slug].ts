import { Env, EventContext } from '../../_shared/types'
import { handleCORS, createErrorResponse, createSuccessResponse, createNotFoundResponse, getDbService } from '../../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    const slug = context.params.slug
    
    if (!slug || slug.trim() === '') {
      return createErrorResponse('Invalid petition slug', 400)
    }

    if (context.request.method === 'GET') {
      const petition = await db.getPetitionBySlug(slug)
      if (!petition) {
        return createNotFoundResponse('Petition not found')
      }
      return createSuccessResponse(petition)
    }

    return createErrorResponse('Method not allowed', 405)
  } catch (error) {
    console.error('Petition by slug API Error:', error)
    return createErrorResponse(error)
  }
}
