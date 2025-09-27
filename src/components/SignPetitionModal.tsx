import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import { useModal } from '@/contexts/ModalContext'
import { useUserSignatures } from '@/hooks/useUserSignatures'
import { signatureApi, ApiError } from '@/services/api'
import type { PetitionWithDetails } from '@/types/api'

interface SignPetitionModalProps {
  petition: PetitionWithDetails
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface SignForm {
  comment: string
  anonymous: boolean
}

export default function SignPetitionModal({
  petition,
  isOpen,
  onClose,
  onSuccess,
}: SignPetitionModalProps) {
  const { session, status } = useAuth()
  const { showSignInModal } = useModal()
  const { hasSignedPetition, addSignedPetition } = useUserSignatures()
  const [signForm, setSignForm] = useState<SignForm>({
    comment: '',
    anonymous: false,
  })
  const [signErrors, setSignErrors] = useState<Record<string, string>>({})
  const [signing, setSigning] = useState(false)

  // Check if user has already signed this petition
  const alreadySigned = hasSignedPetition(petition.id)

  const validateSignForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (status !== 'authenticated' || !session) {
      errors.auth = 'Please sign in to sign this petition'
    }

    setSignErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateSignForm()) {
      if (status !== 'authenticated') {
        showSignInModal({
          title: 'Sign In to Sign Petition',
          subtitle: 'Sign in to add your signature to this petition'
        })
      }
      return
    }

    setSigning(true)

    try {
      // Create signature using authenticated user
      await signatureApi.create({
        petition_id: petition.id,
        user_id: session!.user.id, // Now TEXT, not INTEGER
        comment: signForm.comment.trim() || undefined,
        anonymous: signForm.anonymous,
        ip_address: undefined, // Would be set server-side in real app
      })

      // Optimistically update the signed petitions list
      addSignedPetition(petition.id)

      // Reset form
      setSignForm({
        comment: '',
        anonymous: false,
      })

      // Close modal and notify parent of success
      onClose()
      onSuccess()
    } catch (err) {
      console.error('Error signing petition:', err)
      if (err instanceof ApiError && err.status === 409) {
        setSignErrors({ general: 'You have already signed this petition.' })
      } else {
        setSignErrors({ general: 'Failed to sign petition. Please try again.' })
      }
    } finally {
      setSigning(false)
    }
  }


  if (!isOpen) {
    return null
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white shadow-xl border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-gray-900">Sign This Petition</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSign} className="space-y-4">
              {signErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {signErrors.general}
                </div>
              )}

              {status === 'authenticated' && session && (
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                  <p className="text-green-800 text-sm font-medium mb-1">Signing as:</p>
                  <div className="flex items-center gap-2">
                    {session.user.image && (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-green-700 font-medium">
                      {session.user.name || session.user.email}
                    </span>
                  </div>
                </div>
              )}

              {status !== 'authenticated' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                  <p className="text-yellow-800 text-sm">
                    Please sign in to add your signature to this petition.
                  </p>
                </div>
              )}

              {status === 'authenticated' && alreadySigned && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-blue-800 text-sm font-medium">
                      You have already signed this petition
                    </p>
                  </div>
                </div>
              )}

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Comment (optional)
              </label>
              <Textarea
                rows={3}
                value={signForm.comment}
                onChange={e => setSignForm({ ...signForm, comment: e.target.value })}
                placeholder="Why are you signing this petition?"
                maxLength={500}
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">{signForm.comment.length}/500</p>
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={signForm.anonymous}
                onChange={e => setSignForm({ ...signForm, anonymous: e.target.checked })}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700">
                Sign anonymously (your name won't be displayed publicly)
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={signing}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>

              {status === 'authenticated' ? (
                <Button
                  type="submit"
                  disabled={signing || alreadySigned}
                  className={`flex-1 ${
                    alreadySigned 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {signing ? 'Signing...' : alreadySigned ? 'Already Signed' : 'Sign Petition'}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => showSignInModal({
                    title: 'Sign In to Sign Petition',
                    subtitle: 'Sign in to add your signature to this petition'
                  })}
                  disabled={status === 'loading'}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {status === 'loading' ? 'Loading...' : 'Sign In to Sign'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    </>
  )
}
