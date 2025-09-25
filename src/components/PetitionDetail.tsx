import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { petitionApi, signatureApi, userApi, ApiError } from '@/services/api'
import type { PetitionWithDetails, Signature } from '@/types/api'

export default function PetitionDetail() {
  const { id } = useParams<{ id: string }>()
  const petitionId = parseInt(id || '0')

  const [petition, setPetition] = useState<PetitionWithDetails | null>(null)
  const [signatures, setSignatures] = useState<Signature[]>([])
  const [loading, setLoading] = useState(true)
  const [signaturesLoading, setSignaturesLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(false)
  const [showSignForm, setShowSignForm] = useState(false)

  // Sign form state
  const [signForm, setSignForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    comment: '',
    anonymous: false,
  })
  const [signErrors, setSignErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (petitionId) {
      fetchPetition()
      fetchSignatures()
    }
  }, [petitionId])

  const fetchPetition = async () => {
    try {
      const data = await petitionApi.getById(petitionId)
      setPetition(data)
    } catch (err) {
      console.error('Failed to fetch petition:', err)
      setError('Failed to load petition. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const fetchSignatures = async () => {
    setSignaturesLoading(true)
    try {
      const data = await petitionApi.getSignatures(petitionId, { limit: 20 })
      setSignatures(data)
    } catch (err) {
      console.error('Failed to fetch signatures:', err)
    } finally {
      setSignaturesLoading(false)
    }
  }

  const calculateDaysLeft = (createdAt: string): number => {
    const created = new Date(createdAt)
    const now = new Date()
    const daysSinceCreated = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, 60 - daysSinceCreated)
  }

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
        petition_id: petitionId,
        user_id: userId,
        comment: signForm.comment.trim() || undefined,
        anonymous: signForm.anonymous,
        ip_address: undefined, // Would be set server-side in real app
      })

      // Update local state
      setSigned(true)
      setShowSignForm(false)
      
      // Refresh petition data to get updated count
      await fetchPetition()
      await fetchSignatures()

      // Reset form
      setSignForm({
        firstName: '',
        lastName: '',
        email: '',
        comment: '',
        anonymous: false,
      })

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !petition) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Petition Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/petitions">
            <Button>Browse All Petitions</Button>
          </Link>
        </div>
      </div>
    )
  }

  const progressPercentage = Math.round((petition.current_count / petition.target_count) * 100)
  const daysLeft = calculateDaysLeft(petition.created_at)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>→</span>
            <Link to="/petitions" className="hover:text-blue-600">Petitions</Link>
            <span>→</span>
            <span className="text-gray-900">{petition.title}</span>
          </div>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              {/* Header */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {petition.categories.map((category) => (
                    <Badge key={category.id} variant="secondary">
                      {category.name}
                    </Badge>
                  ))}
                  <Badge variant={petition.type === 'local' ? 'outline' : 'default'}>
                    {petition.type}
                  </Badge>
                  {petition.status !== 'active' && (
                    <Badge variant="destructive">{petition.status}</Badge>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{petition.title}</h1>

                {petition.type === 'local' && petition.location && (
                  <p className="text-lg text-blue-600 mb-4">📍 {petition.location}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Started by {petition.creator.anonymous ? 'Anonymous' : `${petition.creator.first_name} ${petition.creator.last_name}`}</span>
                  <span>•</span>
                  <span>{new Date(petition.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{daysLeft} days left</span>
                </div>
              </div>

              {/* Image */}
              {petition.image_url && (
                <div className="mb-6">
                  <img
                    src={petition.image_url}
                    alt={petition.title}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Why this petition matters</h2>
                <div className="prose max-w-none">
                  {petition.description.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Signatures */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">
                Recent Signatures ({petition.current_count.toLocaleString()})
              </h2>

              {signaturesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse border-b pb-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : signatures.length === 0 ? (
                <p className="text-gray-600">No signatures yet. Be the first to sign!</p>
              ) : (
                <div className="space-y-4">
                  {signatures.map((signature) => (
                    <div key={signature.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {signature.anonymous ? 'Anonymous' : 'Supporter'}
                          </p>
                          {signature.comment && (
                            <p className="text-gray-700 mt-1 italic">"{signature.comment}"</p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(signature.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span className="font-semibold">{petition.current_count.toLocaleString()} signed</span>
                  <span>{petition.target_count.toLocaleString()} goal</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">{progressPercentage}% complete</p>
              </div>

              {/* Sign Button */}
              {signed ? (
                <div className="text-center p-4 bg-green-50 rounded-lg mb-4">
                  <p className="text-green-800 font-medium">✓ Thank you for signing!</p>
                  <p className="text-sm text-green-600 mt-1">Help spread the word by sharing this petition</p>
                </div>
              ) : petition.status === 'active' ? (
                <Button
                  onClick={() => setShowSignForm(true)}
                  className="w-full mb-4"
                  size="lg"
                >
                  Sign This Petition
                </Button>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg mb-4">
                  <p className="text-gray-600">This petition is no longer active</p>
                </div>
              )}

              {/* Share buttons */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full" size="sm">
                  Share on Social Media
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Copy Link
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sign Form Modal */}
        {showSignForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Sign This Petition</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSign} className="space-y-4">
                  {signErrors.general && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                      {signErrors.general}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name *</label>
                      <Input
                        value={signForm.firstName}
                        onChange={(e) => setSignForm({...signForm, firstName: e.target.value})}
                        className={signErrors.firstName ? 'border-red-300' : ''}
                      />
                      {signErrors.firstName && (
                        <p className="text-red-600 text-xs mt-1">{signErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name *</label>
                      <Input
                        value={signForm.lastName}
                        onChange={(e) => setSignForm({...signForm, lastName: e.target.value})}
                        className={signErrors.lastName ? 'border-red-300' : ''}
                      />
                      {signErrors.lastName && (
                        <p className="text-red-600 text-xs mt-1">{signErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <Input
                      type="email"
                      value={signForm.email}
                      onChange={(e) => setSignForm({...signForm, email: e.target.value})}
                      className={signErrors.email ? 'border-red-300' : ''}
                    />
                    {signErrors.email && (
                      <p className="text-red-600 text-xs mt-1">{signErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Comment (optional)</label>
                    <Textarea
                      rows={3}
                      value={signForm.comment}
                      onChange={(e) => setSignForm({...signForm, comment: e.target.value})}
                      placeholder="Why are you signing this petition?"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">{signForm.comment.length}/500</p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={signForm.anonymous}
                      onChange={(e) => setSignForm({...signForm, anonymous: e.target.checked})}
                      className="mt-1"
                    />
                    <label htmlFor="anonymous" className="text-sm text-gray-700">
                      Sign anonymously (your name won't be displayed publicly)
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSignForm(false)}
                      disabled={signing}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={signing}
                      className="flex-1"
                    >
                      {signing ? 'Signing...' : 'Sign Petition'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}