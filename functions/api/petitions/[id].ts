import type { CreatePetitionInput } from '../../../src/db/schemas/types'
import type { Env, EventContext } from '../../_shared/types'
import { handleCORS, createErrorResponse, createSuccessResponse, getDbService } from '../../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request, context.env)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    const petitionId = parseInt(context.params.id as string)

    if (isNaN(petitionId)) {
      return createErrorResponse('Invalid petition ID', 400)
    }

    if (context.request.method === 'GET') {
      const petition = await db.getPetitionById(petitionId)
      if (!petition) {
        return createErrorResponse('Petition not found', 404)
      }
      return createSuccessResponse(petition)
    }

    if (context.request.method === 'PUT') {
      const petitionData: Partial<CreatePetitionInput> = await context.request.json()
      const updatedPetition = await db.updatePetition(petitionId, petitionData)
      return createSuccessResponse(updatedPetition)
    }

    return createErrorResponse('Method not allowed', 405)
  } catch (error) {
    console.error('Petition API Error:', error)
    return createErrorResponse(error)
  }
}