import { Env, EventContext } from '../_shared/types'
import {
  handleCORS,
  createErrorResponse,
  createSuccessResponse,
  getDbService,
} from '../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)

    if (context.request.method === 'GET') {
      const categories = await db.getAllCategories()
      return createSuccessResponse(categories)
    }

    if (context.request.method === 'POST') {
      const { name, description } = (await context.request.json()) as {
        name: string
        description: string
      }
      if (!name) {
        return createErrorResponse('Category name is required', 400)
      }
      const category = await db.createCategory(name, description)
      return createSuccessResponse(category)
    }

    return createErrorResponse('Method not allowed', 405)
  } catch (error) {
    console.error('Categories API Error:', error)
    return createErrorResponse(error)
  }
}
