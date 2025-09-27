import type { CreatePetitionInput } from '../../src/db/schemas/types'
import type { Env, EventContext } from '../_shared/types'
import { 
  handleCORS, 
  createSuccessResponse, 
  createCachedResponse,
  createCachedErrorResponse,
  getDbService,
  generateCacheKey,
  getOrSetCache,
  invalidateCachePattern
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
      
      // Invalidate petition caches when a new petition is created
      console.log(`🆕 New petition created - invalidating all petition caches`)
      await invalidateCachePattern('petitions:', context.env.CACHE)
      
      return createSuccessResponse(petition)
    }

    if (context.request.method === 'GET') {
      const type = url.searchParams.get('type') as 'local' | 'national' | undefined
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const offset = parseInt(url.searchParams.get('offset') || '0')
      const userId = url.searchParams.get('userId')

      // Generate cache key for this request
      const cacheKey = generateCacheKey(context.request, 'petitions')

      // If userId is provided, get petitions for specific user
      if (userId) {
        const petitions = await getOrSetCache(
          cacheKey,
          context.env.CACHE,
          () => db.getUserPetitions(userId),
          5 * 60 // Cache for 5 minutes
        )
        return createCachedResponse(petitions, context.request, context.env, 5 * 60)
      }

      // Otherwise get all petitions
      const petitions = await getOrSetCache(
        cacheKey,
        context.env.CACHE,
        () => db.getAllPetitions(limit, offset, type),
        5 * 60 // Cache for 5 minutes
      )
      return createCachedResponse(petitions, context.request, context.env, 5 * 60)
    }

    return createCachedErrorResponse('Method not allowed', context.request, context.env, 405)
  } catch (error) {
    console.error('Petitions API Error:', error)
    return createCachedErrorResponse(error, context.request, context.env)
  }
}