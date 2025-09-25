import { CreatePetitionInput } from '../../src/db/schemas/types'
import { Env, EventContext } from '../_shared/types'
import { handleCORS, createErrorResponse, createSuccessResponse, getDbService } from '../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request)
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

      const petitions = await db.getAllPetitions(limit, offset, type)
      return createSuccessResponse(petitions)
    }

    return createErrorResponse('Method not allowed', 405)
  } catch (error) {
    console.error('Petitions API Error:', error)
    return createErrorResponse(error)
  }
}