import { Env, EventContext } from '../_shared/types'
import { createSuccessResponse } from '../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  return createSuccessResponse({ message: 'Functions are working!' })
}