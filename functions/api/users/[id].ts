import { Env, EventContext } from '../../_shared/types'
import {
  handleCORS,
  createErrorResponse,
  createSuccessResponse,
  createNotFoundResponse,
  getDbService,
} from '../../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    const userId = parseInt(context.params.id)

    if (isNaN(userId)) {
      return createErrorResponse('Invalid user ID', 400)
    }

    if (context.request.method === 'GET') {
      const user = await db.getUserById(userId)
      if (!user) {
        return createNotFoundResponse('User not found')
      }
      return createSuccessResponse(user)
    }

    return createErrorResponse('Method not allowed', 405)
  } catch (error) {
    console.error('User by ID API Error:', error)
    return createErrorResponse(error)
  }
}
