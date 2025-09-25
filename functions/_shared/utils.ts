import { DatabaseService } from '../../src/db/service'
import { Env, EventContext } from './types'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function handleCORS(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  return null
}

export function createErrorResponse(error: unknown, status: number = 500): Response {
  const message = error instanceof Error ? error.message : 'Unknown error'
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function createSuccessResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function createNotFoundResponse(message: string = 'Not found'): Response {
  return new Response(message, {
    status: 404,
    headers: corsHeaders,
  })
}

export function getDbService(context: EventContext<Env>): DatabaseService {
  return new DatabaseService(context.env.DB)
}
