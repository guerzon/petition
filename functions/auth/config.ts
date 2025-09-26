import { D1Adapter } from "@auth/d1-adapter"
import type { AuthConfig } from "@auth/core"
import Google from "@auth/core/providers/google"
import Facebook from "@auth/core/providers/facebook"
import type { Env } from "../_shared/types"

export function createAuthConfig(env: Env): AuthConfig {
  return {
    adapter: D1Adapter(env.DB),
    providers: [
      Google({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }),
      Facebook({
        clientId: env.FACEBOOK_CLIENT_ID,
        clientSecret: env.FACEBOOK_CLIENT_SECRET,
      }),
    ],
    callbacks: {
      async signIn({ user, account, profile }) {
        // Allow sign in for Google and Facebook providers
        if (account?.provider === "google" || account?.provider === "facebook") {
          return true
        }
        return false
      },
      async session({ session, user }) {
        // Add user ID to session
        if (session?.user && user?.id) {
          session.user.id = user.id
        }
        return session
      },
      async jwt({ token, user, account }) {
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
  }
}