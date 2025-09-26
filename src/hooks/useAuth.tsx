import { useState, useEffect, createContext, useContext } from 'react'
import type { ReactNode } from 'react'

export interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

export interface Session {
  user: User
  expires: string
}

interface AuthContextType {
  session: Session | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  signIn: (provider: 'google' | 'facebook') => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')

  useEffect(() => {
    // Check for existing session on mount
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/auth/session')
      if (response.ok) {
        const sessionData = await response.json()
        if (sessionData?.user) {
          setSession(sessionData)
          setStatus('authenticated')
        } else {
          setStatus('unauthenticated')
        }
      } else {
        setStatus('unauthenticated')
      }
    } catch (error) {
      console.error('Session check failed:', error)
      setStatus('unauthenticated')
    }
  }

  const signIn = async (provider: 'google' | 'facebook') => {
    try {
      // Redirect to Auth.js provider sign-in
      window.location.href = `/auth/signin/${provider}`
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  const signOut = async () => {
    try {
      await fetch('/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      setSession(null)
      setStatus('unauthenticated')
      // Redirect to home page
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ session, status, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}