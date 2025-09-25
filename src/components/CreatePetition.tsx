import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { petitionApi, categoryApi, userApi, ApiError } from '../services/api'
import type { Category } from '../types/api'

interface CreatePetitionFormData {
  title: string
  description: string
  type: 'local' | 'national'
  location: string
  targetCount: number
  imageUrl: string
  categories: number[]
}

export default function CreatePetition() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<CreatePetitionFormData>({
    title: '',
    description: '',
    type: 'local',
    location: '',
    targetCount: 1000,
    imageUrl: '',
    categories: [],
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [errors, setErrors] = useState<Partial<CreatePetitionFormData>>({})
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
    const newErrors: Partial<CreatePetitionFormData> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters long'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters long'
    }

    if (formData.type === 'local' && !formData.location.trim()) {
      newErrors.location = 'Location is required for local petitions'
    }

    if (formData.targetCount < 1) {
      newErrors.targetCount = 'Target signature count must be at least 1'
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid image URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleInputChange = (
    field: keyof CreatePetitionFormData,
    value: string | number | string[]
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

  const handleCategoryToggle = (categoryId: number) => {
    const updatedCategories = formData.categories.includes(categoryId)
      ? formData.categories.filter(id => id !== categoryId)
      : [...formData.categories, categoryId]

    handleInputChange('categories', updatedCategories)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Create or find user first (simplified - in real app, you'd have authentication)
      // For demo purposes, we'll create a demo user
      const demoUser = {
        first_name: 'Demo',
        last_name: 'User',
        email: 'demo@example.com',
        anonymous: false,
      }

      let userId = 1 // Fallback to user ID 1
      try {
        const user = await userApi.create(demoUser)
        userId = user.id
      } catch (error) {
        // User might already exist, use fallback
        console.warn('Could not create demo user, using fallback ID:', error)
      }

      // Create petition
      const petitionData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        location: formData.type === 'local' ? formData.location : undefined,
        target_count: formData.targetCount,
        image_url: formData.imageUrl || undefined,
        created_by: userId,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
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
              <p className="text-sm leading-5 text-gray-500">
                Choose whether your petition addresses local or national issues
              </p>
              <fieldset className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="local"
                      name="petition-type"
                      type="radio"
                      checked={formData.type === 'local'}
                      onChange={() => handleInputChange('type', 'local')}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="local" className="ml-3 block text-sm font-medium text-gray-700">
                      Local Petition
                    </label>
                  </div>
                  <p className="ml-7 text-sm text-gray-500">
                    Address issues in your city, county, or state
                  </p>

                  <div className="flex items-center">
                    <input
                      id="national"
                      name="petition-type"
                      type="radio"
                      checked={formData.type === 'national'}
                      onChange={() => handleInputChange('type', 'national')}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="national"
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      National Petition
                    </label>
                  </div>
                  <p className="ml-7 text-sm text-gray-500">
                    Address issues that affect the entire country
                  </p>
                </div>
              </fieldset>
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Petition Description *
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Explain the issue, why it matters, and what action you want taken
              </p>
              <Textarea
                id="description"
                rows={8}
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Describe your petition in detail. Include background information, why this issue is important, and what specific action you're requesting..."
                className={errors.description ? 'border-red-300' : ''}
                maxLength={2000}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                <p className="text-xs text-gray-500 ml-auto">{formData.description.length}/2000</p>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                Image URL (optional)
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Add an image to make your petition more compelling
              </p>
              <Input
                type="url"
                id="imageUrl"
                value={formData.imageUrl}
                onChange={e => handleInputChange('imageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className={errors.imageUrl ? 'border-red-300' : ''}
              />
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
                Categories (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-4">
                {categories.map(category => (
                  <div key={category.id} className="flex items-start">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={formData.categories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        {category.name}
                      </label>
                      {category.description && (
                        <p className="text-xs text-gray-500">{category.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
