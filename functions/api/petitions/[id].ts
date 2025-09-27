import type { CreatePetitionInput } from '../../../src/db/schemas/types'
import type { Env, EventContext } from '../../_shared/types'
import { 
  handleCORS, 
  createSuccessResponse, 
  createCachedResponse,
  createCachedErrorResponse,
  getDbService 
} from '../../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request, context.env)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    const petitionId = parseInt(context.params.id as string)

    if (isNaN(petitionId)) {
      return createCachedErrorResponse('Invalid petition ID', context.request, context.env, 400)
    }

    if (context.request.method === 'GET') {
      const petition = await db.getPetitionById(petitionId)
      if (!petition) {
        return createCachedErrorResponse('Petition not found', context.request, context.env, 404)
      }
      // Cache individual petition for 10 minutes (they don't change often)
      return createCachedResponse(petition, context.request, context.env, 600)
    }

    if (context.request.method === 'PUT') {
      const petitionData: Partial<CreatePetitionInput> = await context.request.json()
      const updatedPetition = await db.updatePetition(petitionId, petitionData)
      // Don't cache PUT responses as they represent fresh updates
      return createSuccessResponse(updatedPetition)
    }

    return createCachedErrorResponse('Method not allowed', context.request, context.env, 405)
  } catch (error) {
    console.error('Petition API Error:', error)
    return createCachedErrorResponse(error, context.request, context.env)
  }
}