// Main Cloudflare Worker entry point
import { DatabaseService } from '../src/db/service'
import { CreateUserInput, CreatePetitionInput, CreateSignatureInput } from '../src/db/schemas/types'

export interface Env {
  DB: D1Database
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    const db = new DatabaseService(env.DB)

    // Enable CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      // Test endpoint
      if (path === '/api/test') {
        return new Response(JSON.stringify({ message: 'Worker is running!' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Users endpoints
      if (path === '/api/users' && method === 'POST') {
        const userData: CreateUserInput = await request.json()
        const user = await db.createUser(userData)
        return new Response(JSON.stringify(user), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (path.startsWith('/api/users/') && method === 'GET') {
        const userId = parseInt(path.split('/')[3])
        const user = await db.getUserById(userId)
        if (!user) {
          return new Response('User not found', { status: 404, headers: corsHeaders })
        }
        return new Response(JSON.stringify(user), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Petitions endpoints
      if (path === '/api/petitions' && method === 'POST') {
        const petitionData: CreatePetitionInput = await request.json()
        const petition = await db.createPetition(petitionData)
        return new Response(JSON.stringify(petition), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (path === '/api/petitions' && method === 'GET') {
        const type = url.searchParams.get('type') as 'local' | 'national' | undefined
        const limit = parseInt(url.searchParams.get('limit') || '50')
        const offset = parseInt(url.searchParams.get('offset') || '0')

        const petitions = await db.getAllPetitions(limit, offset, type)
        return new Response(JSON.stringify(petitions), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (path.startsWith('/api/petitions/') && method === 'GET') {
        const pathParts = path.split('/')
        const petitionId = parseInt(pathParts[3])
        
        // Handle /api/petitions/:id/signatures
        if (pathParts[4] === 'signatures') {
          const limit = parseInt(url.searchParams.get('limit') || '50')
          const offset = parseInt(url.searchParams.get('offset') || '0')
          const signatures = await db.getPetitionSignatures(petitionId, limit, offset)
          return new Response(JSON.stringify(signatures), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        
        // Handle /api/petitions/:id
        const petition = await db.getPetitionById(petitionId)
        if (!petition) {
          return new Response('Petition not found', { status: 404, headers: corsHeaders })
        }
        return new Response(JSON.stringify(petition), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Signatures endpoints
      if (path === '/api/signatures' && method === 'POST') {
        const signatureData: CreateSignatureInput = await request.json()
        const signature = await db.createSignature(signatureData)
        return new Response(JSON.stringify(signature), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Categories endpoints
      if (path === '/api/categories' && method === 'GET') {
        const categories = await db.getAllCategories()
        return new Response(JSON.stringify(categories), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (path === '/api/categories' && method === 'POST') {
        const { name, description } = await request.json()
        const category = await db.createCategory(name, description)
        return new Response(JSON.stringify(category), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders })

    } catch (error: unknown) {
      console.error('API Error:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  },
}