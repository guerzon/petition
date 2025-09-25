/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database
}

export interface EventContext<E = unknown> {
  request: Request
  env: E
  params: Record<string, string>
  waitUntil(promise: Promise<unknown>): void
  next(input?: Request | string, init?: RequestInit): Promise<Response>
  data: Record<string, unknown>
}
