import type { CreatePetitionInput } from '../../src/db/schemas/types'
import type { Env, EventContext } from '../_shared/types'
import { 
  handleCORS, 
  createSuccessResponse, 
  createCachedResponse,
  createCachedErrorResponse,
  getDbService 
} from '../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request, context.env)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    const url = new URL(context.request.url)
    
    if (context.request.method === 'POST') {
      const petitionData: CreatePetitionInput = await context.request.json()
      const petition = await db.createPetition(petitionData)
      return createSuccessResponse(petition)
    }

    if (context.request.method === 'GET') {
      const type = url.searchParams.get('type') as 'local' | 'national' | undefined
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const offset = parseInt(url.searchParams.get('offset') || '0')
      const userId = url.searchParams.get('userId')

      // If userId is provided, get petitions for specific user
      if (userId) {
        const petitions = await db.getUserPetitions(userId)
        // Cache user petitions for 2 minutes (they change less frequently)
        return createCachedResponse(petitions, context.request, context.env, 120)
      }

      // Otherwise get all petitions
      const petitions = await db.getAllPetitions(limit, offset, type)
      // Cache all petitions for 5 minutes
      return createCachedResponse(petitions, context.request, context.env, 300)
    }

    return createCachedErrorResponse('Method not allowed', context.request, context.env, 405)
  } catch (error) {
    console.error('Petitions API Error:', error)
    return createCachedErrorResponse(error, context.request, context.env)
  }
}