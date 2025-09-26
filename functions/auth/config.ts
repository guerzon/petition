import { D1Adapter } from "@auth/d1-adapter"
import type { AuthConfig } from "@auth/core"
import Google from "@auth/core/providers/google"
import Facebook from "@auth/core/providers/facebook"
import type { Env } from "../_shared/types"

export function createAuthConfig(env: Env): AuthConfig {
  const providers = []

  // Only add Google provider if credentials are properly configured
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET &&
      !env.GOOGLE_CLIENT_ID.includes('your-google') &&
      !env.GOOGLE_CLIENT_SECRET.includes('your-google')) {
    providers.push(Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }))
  }

  // Only add Facebook provider if credentials are properly configured
  if (env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET &&
      !env.FACEBOOK_CLIENT_ID.includes('your-facebook') &&
      !env.FACEBOOK_CLIENT_SECRET.includes('your-facebook')) {
    providers.push(Facebook({
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
    }))
  }

  const config: AuthConfig = {
    adapter: D1Adapter(env.DB),
    providers,
    callbacks: {
      async signIn({ user, account, profile }) {
        console.log('SignIn callback:', { user, account: account?.provider, profile: !!profile })
        // Allow sign in for Google and Facebook providers
        if (account?.provider === "google" || account?.provider === "facebook") {
          return true
        }
        return false
      },
      async session({ session, user }) {
        console.log('Session callback:', { hasSession: !!session, hasUser: !!user })
        // Add user ID to session
        if (session?.user && user?.id) {
          session.user.id = user.id
        }
        return session
      },
      async jwt({ token, user, account }) {
        console.log('JWT callback:', { hasToken: !!token, hasUser: !!user })
        // Add user ID to JWT token
        if (user?.id) {
          token.id = user.id
        }
        return token
      }
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/error',
    },
    session: {
      strategy: "database",
    },
    secret: env.AUTH_SECRET,
    trustHost: true,
    debug: true,
  }

  console.log('Auth config:', {
    providersCount: config.providers.length,
    hasAdapter: !!config.adapter,
    hasSecret: !!config.secret,
    providersTypes: config.providers.map(p => p.id)
  })

  return config
}