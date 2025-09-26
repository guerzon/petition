import { Auth } from "@auth/core"
import { createAuthConfig } from "./config"
import type { EventContext } from "../_shared/types"
import type { Env } from "../_shared/types"

export async function onRequest(context: EventContext<Env>): Promise<Response> {
  const { request, env } = context

  try {
    const url = new URL(request.url)
    console.log('Auth request URL:', url.pathname, url.search)

    const response = await Auth(request, createAuthConfig(env))

    // Log successful auth responses
    if (response.status === 302) {
      const location = response.headers.get('Location')
      console.log('Auth redirect to:', location)
    }

    return response
  } catch (error) {
    console.error("Auth error:", error)

    // Log UnknownAction errors but don't redirect to avoid loops
    if (error instanceof Error && error.message.includes('UnknownAction')) {
      console.error('Auth UnknownAction error:', error.message)
    }

    return new Response(JSON.stringify({ error: "Authentication error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }
}