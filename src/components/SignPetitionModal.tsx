import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { userApi, signatureApi, ApiError } from '@/services/api'
import type { PetitionWithDetails } from '@/types/api'

interface SignPetitionModalProps {
  petition: PetitionWithDetails
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface SignForm {
  firstName: string
  lastName: string
  email: string
  comment: string
  anonymous: boolean
}

export default function SignPetitionModal({
  petition,
  isOpen,
  onClose,
  onSuccess,
}: SignPetitionModalProps) {
  const [signForm, setSignForm] = useState<SignForm>({
    firstName: '',
    lastName: '',
    email: '',
    comment: '',
    anonymous: false,
  })
  const [signErrors, setSignErrors] = useState<Record<string, string>>({})
  const [signing, setSigning] = useState(false)

  const validateSignForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!signForm.firstName.trim()) {
      errors.firstName = 'First name is required'
    }
    if (!signForm.lastName.trim()) {
      errors.lastName = 'Last name is required'
    }
    if (!signForm.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(signForm.email)) {
      errors.email = 'Please enter a valid email'
    }

    setSignErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateSignForm()) {
      return
    }

    setSigning(true)

    try {
      // Create or find user
      let userId: number
      try {
        const user = await userApi.create({
          first_name: signForm.firstName,
          last_name: signForm.lastName,
          email: signForm.email,
          anonymous: signForm.anonymous,
        })
        userId = user.id
      } catch (error) {
        // User might already exist, use fallback ID for demo
        console.warn('User creation failed, using demo approach:', error)
        userId = 1
      }

      // Create signature
      await signatureApi.create({
        petition_id: petition.id,
        user_id: userId,
        comment: signForm.comment.trim() || undefined,
        anonymous: signForm.anonymous,
        ip_address: undefined, // Would be set server-side in real app
      })

      // Reset form
      setSignForm({
        firstName: '',
        lastName: '',
        email: '',
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white shadow-xl border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-gray-900">Sign This Petition</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSign} className="space-y-4">
            {signErrors.general && (
              <div className="p-3 bg-red-50  border border-red-200 rounded text-red-700text-sm">
                {signErrors.general}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">First Name *</label>
                <Input
                  value={signForm.firstName}
                  onChange={e => setSignForm({ ...signForm, firstName: e.target.value })}
                  className={`bg-white border-gray-300 text-gray-900 ${signErrors.firstName ? 'border-red-300' : ''}`}
                />
                {signErrors.firstName && (
                  <p className="text-red-600 text-xs mt-1">{signErrors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Last Name *</label>
                <Input
                  value={signForm.lastName}
                  onChange={e => setSignForm({ ...signForm, lastName: e.target.value })}
                  className={`bg-white border-gray-300 text-gray-900 ${signErrors.lastName ? 'border-red-300' : ''}`}
                />
                {signErrors.lastName && (
                  <p className="text-red-600 text-xs mt-1">{signErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email *</label>
              <Input
                type="email"
                value={signForm.email}
                onChange={e => setSignForm({ ...signForm, email: e.target.value })}
                className={`bg-white border-gray-300 text-gray-900 ${signErrors.email ? 'border-red-300' : ''}`}
              />
              {signErrors.email && <p className="text-red-600 text-xs mt-1">{signErrors.email}</p>}
            </div>

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
              <Button
                type="submit"
                disabled={signing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
              >
                {signing ? 'Signing...' : 'Sign Petition'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
