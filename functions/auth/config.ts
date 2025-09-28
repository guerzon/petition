import type { AuthConfig } from '@auth/core'
import Google from '@auth/core/providers/google'
import Facebook from '@auth/core/providers/facebook'
import type { Env } from '../_shared/types'
import { EncryptedD1Adapter } from './encrypted-d1-adapter'

export function createAuthConfig(env: Env): AuthConfig {
  const providers = []

  // Only add Google provider if credentials are properly configured
  if (
    env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_SECRET &&
    !env.GOOGLE_CLIENT_ID.includes('your-google') &&
    !env.GOOGLE_CLIENT_SECRET.includes('your-google')
  ) {
    providers.push(
      Google({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      })
    )
  }

  // Only add Facebook provider if credentials are properly configured
  if (
    env.FACEBOOK_CLIENT_ID &&
    env.FACEBOOK_CLIENT_SECRET &&
    !env.FACEBOOK_CLIENT_ID.includes('your-facebook') &&
    !env.FACEBOOK_CLIENT_SECRET.includes('your-facebook')
  ) {
    providers.push(
      Facebook({
        clientId: env.FACEBOOK_CLIENT_ID,
        clientSecret: env.FACEBOOK_CLIENT_SECRET,
      })
    )
  }

  const config: AuthConfig = {
    adapter: EncryptedD1Adapter(env.DB, env),
    providers,
    callbacks: {
      async signIn({ user, account, profile }) {
        // Allow sign in for Google and Facebook providers
        if (account?.provider === 'google' || account?.provider === 'facebook') {
          // Ensure user image is set from profile (Google uses 'picture' field)
          if (profile && !user?.image) {
            const profileImage = profile.picture || profile.image || profile.avatar_url
            if (profileImage) {
              user.image = profileImage
            }
          }
          return true
        }
        return false
      },
      async session({ session, user }) {
        // Add user data to session
        if (session?.user && user) {
          session.user.id = user.id
          session.user.name = user.name
          // Note: user.email is already decrypted by our EncryptedD1Adapter
          session.user.email = obfuscateEmail(user.email)
          session.user.image = user.image
        }
        return session
      },
      async jwt({ token, user }) {
        // Add user ID to JWT token
        if (user?.id) {
          token.id = user.id
        }
        return token
      },
    },
    pages: {
      signIn: '/auth/signin',
      signOut: '/',
      error: '/auth/error',
    },
    session: {
      strategy: 'database',
    },
    secret: env.AUTH_SECRET,
    trustHost: true,
    debug: true,
    // Ensure all auth actions are enabled
    events: {
      async signOut(message) {
        console.log('User signed out:', message)
      },
    },
  }

  return config
}

function obfuscateEmail(email: string): string {
  const [local, domain] = email.split('@')
  const obfuscatedLocal = local.slice(0, 3) + '*'.repeat(local.length - 3)
  return `${obfuscatedLocal}@${domain}`
}
