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
        console.log('SignIn callback full data:', {
          user,
          account: account?.provider,
          profile
        })

        // Allow sign in for Google and Facebook providers
        if (account?.provider === "google" || account?.provider === "facebook") {
          // Ensure user image is set from profile (Google uses 'picture' field)
          if (profile && !user?.image) {
            const profileImage = profile.picture || profile.image || profile.avatar_url
            if (profileImage) {
              console.log('Setting user image from profile:', profileImage)
              user.image = profileImage
            }
          }
          return true
        }
        return false
      },
      async session({ session, user }) {
        console.log('Session callback:', {
          hasSession: !!session,
          hasUser: !!user,
          userImage: user?.image,
          sessionUserImage: session?.user?.image
        })
        // Add user data to session
        if (session?.user && user) {
          session.user.id = user.id
          session.user.name = user.name
          session.user.email = user.email
          session.user.image = user.image
        }
        return session
      },
      async jwt({ token, user, account }) {
        console.log('JWT callback:', { hasToken: !!token, hasUser: !!user, userImage: user?.image })
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