import { Auth } from "@auth/core"
import { createAuthConfig } from "./config"
import type { EventContext } from "../_shared/types"
import type { Env } from "../_shared/types"

export async function onRequest(context: EventContext<Env>): Promise<Response> {
  const { request, env } = context

  try {
    return await Auth(request, createAuthConfig(env))
  } catch (error) {
    console.error("Auth error:", error)
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