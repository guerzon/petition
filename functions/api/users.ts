import type { CreateUserInput } from '../../src/db/schemas/types'
import type { Env, EventContext } from '../_shared/types'
import { handleCORS, createErrorResponse, createSuccessResponse, getDbService } from '../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request, context.env)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    
    if (context.request.method === 'POST') {
      const userData: CreateUserInput = await context.request.json()
      const user = await db.createUser(userData)
      return createSuccessResponse(user)
    }

    return createErrorResponse('Method not allowed', 405)
  } catch (error) {
    console.error('User API Error:', error)
    return createErrorResponse(error)
  }
}