// Main Cloudflare Worker entry point - routes to individual functions
import { Env, EventContext } from './_shared/types'

// Import individual function handlers
import { onRequest as testHandler } from './api/test'
import { onRequest as usersHandler } from './api/users'
import { onRequest as userByIdHandler } from './api/users/[id]'
import { onRequest as petitionsHandler } from './api/petitions'
import { onRequest as petitionByIdHandler } from './api/petitions/[id]'
import { onRequest as petitionBySlugHandler } from './api/petition/[slug]'
import { onRequest as petitionSignaturesHandler } from './api/petitions/[id]/signatures'
import { onRequest as signaturesHandler } from './api/signatures'
import { onRequest as categoriesHandler } from './api/categories'

function createContext(request: Request, env: Env, params: Record<string, string> = {}): EventContext<Env> {
  return {
    request,
    env,
    params,
    waitUntil: () => {}, // Simplified for now
    next: async () => new Response('Not implemented', { status: 501 }),
    data: {},
  }
}

function parsePathParams(path: string, pattern: string): Record<string, string> {
  const pathParts = path.split('/').filter(p => p)
  const patternParts = pattern.split('/').filter(p => p)
  const params: Record<string, string> = {}
  
  for (let i = 0; i < patternParts.length; i++) {
    const part = patternParts[i]
    if (part.startsWith('[') && part.endsWith(']')) {
      const paramName = part.slice(1, -1)
      params[paramName] = pathParts[i] || ''
    }
  }
  
  return params
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    try {
      // Route to appropriate function handler
      if (path === '/api/test') {
        return await testHandler(createContext(request, env))
      }
      
      if (path === '/api/users') {
        return await usersHandler(createContext(request, env))
      }
      
      if (path.match(/^\/api\/users\/\d+$/)) {
        const params = parsePathParams(path, '/api/users/[id]')
        return await userByIdHandler(createContext(request, env, params))
      }
      
      if (path === '/api/petitions') {
        return await petitionsHandler(createContext(request, env))
      }
      
      if (path.match(/^\/api\/petition\/[^/]+$/)) {
        const params = parsePathParams(path, '/api/petition/[slug]')
        return await petitionBySlugHandler(createContext(request, env, params))
      }
      
      if (path.match(/^\/api\/petitions\/\d+\/signatures$/)) {
        const params = parsePathParams(path, '/api/petitions/[id]/signatures')
        return await petitionSignaturesHandler(createContext(request, env, params))
      }
      
      if (path.match(/^\/api\/petitions\/\d+$/)) {
        const params = parsePathParams(path, '/api/petitions/[id]')
        return await petitionByIdHandler(createContext(request, env, params))
      }
      
      if (path === '/api/signatures') {
        return await signaturesHandler(createContext(request, env))
      }
      
      if (path === '/api/categories') {
        return await categoriesHandler(createContext(request, env))
      }

      // 404 for unmatched routes
      return new Response('Not Found', { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      })

    } catch (error: unknown) {
      console.error('Router Error:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }
  },
}