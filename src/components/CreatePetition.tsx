import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { petitionApi, categoryApi, ApiError } from '../services/api'
import type { Category } from '../types/api'
import MDEditor from '@uiw/react-md-editor'
import { useAuth } from '../hooks/useAuth'

interface CreatePetitionFormData {
  title: string
  description: string
  type: 'local' | 'national'
  location: string
  targetCount: number
  imageUrl: string
  imageFile: File | null
  categories: number[]
}

export default function CreatePetition() {
  const navigate = useNavigate()
  const { session, status, signIn } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<CreatePetitionFormData>({
    title: '',
    description: '',
    type: 'local',
    location: '',
    targetCount: 1000,
    imageUrl: '',
    imageFile: null,
    categories: [],
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [errors, setErrors] = useState<Partial<Record<keyof CreatePetitionFormData, string>>>({})
  const [submitError, setSubmitError] = useState<string>('')

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await categoryApi.getAll()
        setCategories(fetchedCategories)
      } catch (error) {
        console.error('Failed to load categories:', error)
        // Fallback to hardcoded categories if API fails
        setCategories([
          {
            id: 1,
            name: 'Environment',
            description: 'Environmental protection and sustainability',
            created_at: '',
          },
          {
            id: 2,
            name: 'Education',
            description: 'Educational policies and reforms',
            created_at: '',
          },
          {
            id: 3,
            name: 'Healthcare',
            description: 'Healthcare access and policies',
            created_at: '',
          },
          {
            id: 4,
            name: 'Social Justice',
            description: 'Social equality and justice',
            created_at: '',
          },
          {
            id: 5,
            name: 'Transportation',
            description: 'Public transportation and infrastructure',
            created_at: '',
          },
          {
            id: 6,
            name: 'Local Government',
            description: 'Local government policies',
            created_at: '',
          },
          {
            id: 7,
            name: 'Animal Rights',
            description: 'Animal welfare and protection',
            created_at: '',
          },
          {
            id: 8,
            name: 'Technology',
            description: 'Technology policies and digital rights',
            created_at: '',
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreatePetitionFormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters long'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 100) {
      newErrors.description = 'Description must be at least 100 characters long'
    }

    if (formData.type === 'local' && !formData.location.trim()) {
      newErrors.location = 'Location is required for local petitions'
    }

    if (formData.targetCount < 1) {
      newErrors.targetCount = 'Target signature count must be at least 1'
    }

    // Image validation is handled during file upload

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Removed unused isValidUrl function

  const handleInputChange = (
    field: keyof CreatePetitionFormData,
    value: string | number | string[] | File | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, imageUrl: 'Image size must be less than 5MB' }))
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, imageUrl: 'Please select a valid image file' }))
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64String = event.target?.result as string
      handleInputChange('imageUrl', base64String)
      handleInputChange('imageFile', file)
    }
    reader.readAsDataURL(file)
  }

  const handleCategoryToggle = (categoryId: number) => {
    const updatedCategories = formData.categories.includes(categoryId)
      ? formData.categories.filter(id => id !== categoryId)
      : [...formData.categories, categoryId]

    handleInputChange('categories', updatedCategories.map(String))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check authentication before submitting
    if (status !== 'authenticated' || !session) {
      // This shouldn't happen as the form is only shown to authenticated users
      console.error('Attempt to submit petition without authentication')
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Create petition using authenticated user
      const petitionData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        location: formData.type === 'local' ? formData.location : undefined,
        target_count: formData.targetCount,
        image_url: formData.imageUrl || undefined,
        created_by: session.user.id,
        category_ids: formData.categories,
      }

      const petition = await petitionApi.create(petitionData)

      // Navigate to petition detail page or success page
      navigate(`/?created=${petition.id}`)
    } catch (error) {
      console.error('Error creating petition:', error)
      if (error instanceof ApiError) {
        setSubmitError(`Failed to create petition: ${error.message}`)
      } else {
        setSubmitError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }


  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {status === 'loading' ? 'Checking authentication...' : 'Loading form...'}
          </p>
        </div>
      </div>
    )
  }

  // Show sign-in prompt if not authenticated
  if (status !== 'authenticated' || !session) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Start a Petition</h1>
            <p className="text-lg text-gray-600 mb-8">
              Create a petition to bring about the change you want to see
            </p>

            <Card className="max-w-md mx-auto p-8">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In to Continue</h2>
                  <p className="text-gray-600 text-sm">
                    Sign in to create your petition and help bring about change
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => signIn('google')}
                    disabled={status === 'loading'}
                    className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-3 h-12"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>

                  <Button
                    onClick={() => signIn('facebook')}
                    disabled={status === 'loading'}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3 h-12"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Continue with Facebook
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="w-full text-gray-600 hover:text-gray-800"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Start a Petition</h1>
          <p className="mt-2 text-lg text-gray-600">
            Create a petition to bring about the change you want to see
          </p>
        </div>

        <Card className="p-8">
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Petition Type Selection */}
            <div>
              <label className="text-base font-medium text-gray-900">
                What type of petition is this?
              </label>
              <p className="text-sm leading-5 text-gray-500 mb-4">
                Choose whether your petition addresses local or national issues
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    formData.type === 'local'
                      ? 'border-2 border-blue-500 bg-blue-50'
                      : 'border border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleInputChange('type', 'local')}
                >
                  <div className="p-6">
                    <div className="flex items-center">
                      <input
                        id="local"
                        name="petition-type"
                        type="radio"
                        checked={formData.type === 'local'}
                        onChange={() => handleInputChange('type', 'local')}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="local" className="ml-3 text-lg font-medium text-gray-900">
                        Local Petition
                      </label>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Address issues in your city, county, or state
                    </p>
                  </div>
                </Card>

                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    formData.type === 'national'
                      ? 'border-2 border-blue-500 bg-blue-50'
                      : 'border border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleInputChange('type', 'national')}
                >
                  <div className="p-6">
                    <div className="flex items-center">
                      <input
                        id="national"
                        name="petition-type"
                        type="radio"
                        checked={formData.type === 'national'}
                        onChange={() => handleInputChange('type', 'national')}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="national" className="ml-3 text-lg font-medium text-gray-900">
                        National Petition
                      </label>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Address issues that affect the entire country
                    </p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Location field for local petitions */}
            {formData.type === 'local' && (
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location *
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Specify the city, county, or state this petition addresses
                </p>
                <Input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Springfield, MA or Riverside County, CA"
                  className={errors.location ? 'border-red-300' : ''}
                />
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Petition Title *
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Create a clear, compelling title that summarizes your petition
              </p>
              <Input
                type="text"
                id="title"
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                placeholder="e.g., Save Our Local Park from Development"
                className={errors.title ? 'border-red-300' : ''}
                maxLength={150}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                <p className="text-xs text-gray-500 ml-auto">{formData.title.length}/150</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Petition Description *
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Explain the issue, why it matters, and what action you want taken. You can use markdown formatting for better presentation.
              </p>
              <div className={`rounded-md overflow-hidden ${errors.description ? 'ring-2 ring-red-500' : ''}`}>
                <MDEditor
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value || '')}
                  preview="edit"
                  hideToolbar={false}
                  visibleDragbar={false}
                  textareaProps={{
                    placeholder: 'Describe your petition in detail. Include:\n\n- Background information about the issue\n- Why this issue is important to you and others\n- What specific action you\'re requesting\n- Any supporting evidence or examples\n\nYou can use **bold**, *italic*, lists, and other markdown formatting to make your petition more engaging.',
                    style: { minHeight: '200px' },
                  }}
                  height={300}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                <p className="text-xs text-gray-500 ml-auto">{formData.description.length} characters</p>
              </div>

              <div className="mt-2 text-xs text-gray-500">
                <p className="font-medium mb-1">Markdown formatting tips:</p>
                <div className="grid grid-cols-2 gap-2">
                  <span>**Bold text**</span>
                  <span>*Italic text*</span>
                  <span>- Bullet points</span>
                  <span>1. Numbered lists</span>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Petition Image (optional)
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Add an image to make your petition more compelling (Max 5MB)
              </p>

              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {formData.imageUrl ? (
                        <div className="text-center">
                          <p className="text-sm text-green-600 font-medium">✓ Image uploaded</p>
                          <p className="text-xs text-gray-500">{formData.imageFile?.name}</p>
                        </div>
                      ) : (
                        <>
                          <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </>
                      )}
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                {formData.imageUrl && (
                  <div className="relative">
                    <img
                      src={formData.imageUrl}
                      alt="Petition preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('imageUrl', '')
                        handleInputChange('imageFile', null)
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>}
            </div>

            {/* Target Count */}
            <div>
              <label htmlFor="targetCount" className="block text-sm font-medium text-gray-700">
                Target Signatures
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Set a goal for how many signatures you want to collect
              </p>
              <Input
                type="number"
                id="targetCount"
                value={formData.targetCount}
                onChange={e => handleInputChange('targetCount', parseInt(e.target.value) || 0)}
                min="1"
                max="1000000"
                className={errors.targetCount ? 'border-red-300' : ''}
              />
              {errors.targetCount && (
                <p className="mt-1 text-sm text-red-600">{errors.targetCount}</p>
              )}
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Select categories that best describe your petition
              </p>

              {/* Category Dropdown */}
              <div className="relative">
                <select
                  onChange={(e) => {
                    const categoryId = parseInt(e.target.value)
                    if (categoryId && !formData.categories.includes(categoryId)) {
                      handleCategoryToggle(categoryId)
                    }
                    e.target.value = '' // Reset selection
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a category to add...</option>
                  {categories
                    .filter(category => !formData.categories.includes(category.id))
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  }
                </select>
              </div>

              {/* Selected Categories as Tags */}
              {formData.categories.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.categories.map(categoryId => {
                      const category = categories.find(c => c.id === categoryId)
                      return category ? (
                        <Badge
                          key={categoryId}
                          variant="secondary"
                          className="flex items-center gap-1 px-3 py-1"
                        >
                          {category.name}
                          <button
                            type="button"
                            onClick={() => handleCategoryToggle(categoryId)}
                            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* User Info Display */}
            {session && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">Creating petition as:</h3>
                <div className="flex items-center gap-3">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-green-900">
                      {session.user.name || session.user.email}
                    </p>
                    {session.user.name && session.user.email && (
                      <p className="text-sm text-green-700">{session.user.email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? 'Creating...' : 'Create Petition'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
