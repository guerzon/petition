import { DatabaseService } from '../../src/db/service'
import type { Env, EventContext } from './types'

// CORS configuration with environment-aware origin validation
export function getCorsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin')
  
  // Define allowed origins based on environment
  const productionOrigins = [
    'https://petition.ph',
    'https://www.petition.ph'
  ]
  
  const developmentOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', // Vite default
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080'
  ]
  
  // Determine if we're in production (check for production environment variable)
  const isProduction = env.ENVIRONMENT === 'production' || env.NODE_ENV === 'production'
  
  // In production, only allow production origins
  // In development, allow both production and development origins
  const allowedOrigins = isProduction 
    ? productionOrigins 
    : [...productionOrigins, ...developmentOrigins]
  
  // Check if the origin is allowed
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : null
  
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  }
  
  // Only set Access-Control-Allow-Origin if origin is allowed
  if (allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin
  }
  
  return headers
}

// Legacy corsHeaders for backward compatibility (deprecated)
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function handleCORS(request: Request, env: Env): Response | null {
  if (request.method === 'OPTIONS') {
    const corsHeaders = getCorsHeaders(request, env)
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }
  return null
}

// New CORS-aware response functions
export function createErrorResponseWithCors(error: unknown, request: Request, env: Env, status: number = 500): Response {
  const message = error instanceof Error ? error.message : 'Unknown error'
  const corsHeaders = getCorsHeaders(request, env)
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function createSuccessResponseWithCors(data: unknown, request: Request, env: Env): Response {
  const corsHeaders = getCorsHeaders(request, env)
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function createNotFoundResponseWithCors(request: Request, env: Env, message: string = 'Not found'): Response {
  const corsHeaders = getCorsHeaders(request, env)
  return new Response(message, { 
    status: 404, 
    headers: corsHeaders 
  })
}

// Backward-compatible functions (deprecated - use WithCors versions)
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
    headers: corsHeaders 
  })
}

export function getDbService(context: EventContext<Env>): DatabaseService {
  return new DatabaseService(context.env.DB)
}

// ETag and caching utilities
export function generateETag(data: unknown): string {
  // Simple hash function for ETag generation
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `"${Math.abs(hash).toString(36)}"`
}

export function createCachedResponse(
  data: unknown, 
  request: Request, 
  env: Env,
  cacheMaxAge: number = 300 // 5 minutes default
): Response {
  const corsHeaders = getCorsHeaders(request, env)
  const etag = generateETag(data)
  
  // Check if client has matching ETag
  const clientETag = request.headers.get('If-None-Match')
  if (clientETag === etag) {
    return new Response(null, {
      status: 304, // Not Modified
      headers: {
        ...corsHeaders,
        'ETag': etag,
        'Cache-Control': `public, max-age=${cacheMaxAge}`,
      }
    })
  }
  
  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'ETag': etag,
      'Cache-Control': `public, max-age=${cacheMaxAge}`,
      'Last-Modified': new Date().toUTCString(),
    },
  })
}

export function createCachedErrorResponse(
  error: unknown, 
  request: Request, 
  env: Env, 
  status: number = 500
): Response {
  const message = error instanceof Error ? error.message : 'Unknown error'
  const corsHeaders = getCorsHeaders(request, env)
  
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}