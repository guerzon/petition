import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { signatureApi } from '../services/api'

export function useUserSignatures() {
  const { session, status } = useAuth()
  const [signedPetitionIds, setSignedPetitionIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadUserSignatures = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user?.id) {
      setSignedPetitionIds(new Set())
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const userId = session.user.id
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID')
      }

      const petitionIds = await signatureApi.getUserSignedPetitionIds(userId)
      setSignedPetitionIds(new Set(petitionIds))
    } catch (err) {
      console.error('Failed to load user signatures:', err)
      setError(err instanceof Error ? err.message : 'Failed to load signatures')
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id, status])

  // Load signatures when user authentication status changes
  useEffect(() => {
    loadUserSignatures()
  }, [loadUserSignatures])

  // Check if user has signed a specific petition
  const hasSignedPetition = useCallback((petitionId: number): boolean => {
    return signedPetitionIds.has(petitionId)
  }, [signedPetitionIds])

  // Add a petition to the signed list (for optimistic updates)
  const addSignedPetition = useCallback((petitionId: number) => {
    setSignedPetitionIds(prev => new Set([...prev, petitionId]))
  }, [])

  // Remove a petition from the signed list (if unsigning is implemented)
  const removeSignedPetition = useCallback((petitionId: number) => {
    setSignedPetitionIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(petitionId)
      return newSet
    })
  }, [])

  // Refresh signatures (useful after signing a petition)
  const refreshSignatures = useCallback(() => {
    loadUserSignatures()
  }, [loadUserSignatures])

  return {
    signedPetitionIds: Array.from(signedPetitionIds),
    hasSignedPetition,
    addSignedPetition,
    removeSignedPetition,
    refreshSignatures,
    loading,
    error,
    isAuthenticated: status === 'authenticated'
  }
}
