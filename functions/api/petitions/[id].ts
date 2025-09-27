import type { CreatePetitionInput } from '../../../src/db/schemas/types'
import type { Env, EventContext } from '../../_shared/types'
import { 
  handleCORS, 
  createSuccessResponse, 
  createCachedResponse,
  createCachedErrorResponse,
  getDbService,
  invalidateCachePattern,
  generateCacheKey,
  getOrSetCache
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
      // Generate cache key for this specific petition
      const cacheKey = generateCacheKey(context.request, 'petition')
      
      const petition = await getOrSetCache(
        cacheKey,
        context.env.CACHE,
        async () => {
          const result = await db.getPetitionById(petitionId)
          if (!result) {
            throw new Error('Petition not found')
          }
          return result
        },
        10 * 60 // Cache for 10 minutes
      )
      
      return createCachedResponse(petition, context.request, context.env, 10 * 60)
    }

    if (context.request.method === 'PUT') {
      const petitionData: Partial<CreatePetitionInput> = await context.request.json()
      const updatedPetition = await db.updatePetition(petitionId, petitionData)
      
      // Invalidate all petition caches when a petition is updated
      console.log(`📝 Petition ${petitionId} updated - invalidating petition caches`)
      await invalidateCachePattern('petitions:', context.env.CACHE)
      await invalidateCachePattern('petition:', context.env.CACHE)
      
      return createSuccessResponse(updatedPetition)
    }

    return createCachedErrorResponse('Method not allowed', context.request, context.env, 405)
  } catch (error) {
    console.error('Petition API Error:', error)
    return createCachedErrorResponse(error, context.request, context.env)
  }
}