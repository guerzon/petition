import { Auth } from "@auth/core"
import { createAuthConfig } from "./config"
import type { EventContext } from "../_shared/types"
import type { Env } from "../_shared/types"

export async function onRequest(context: EventContext<Env>): Promise<Response> {
  const { request, env } = context

  try {
    const url = new URL(request.url)
    console.log('Auth request URL:', url.pathname, url.search)

    return await Auth(request, createAuthConfig(env))
  } catch (error) {
    console.error("Auth error:", error)

    // If it's an UnknownAction error, redirect to error page
    if (error instanceof Error && error.message.includes('UnknownAction')) {
      const errorUrl = new URL('/auth/error', request.url)
      errorUrl.searchParams.set('error', 'Configuration')
      return Response.redirect(errorUrl.toString(), 302)
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