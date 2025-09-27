import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { petitionApi } from '@/services/api'
import { useUserSignatures } from '@/hooks/useUserSignatures'
import type { PetitionWithDetails } from '@/types/api'

export default function AllPetitions() {
  const { hasSignedPetition, isAuthenticated } = useUserSignatures()
  const [petitions, setPetitions] = useState<PetitionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [filter, setFilter] = useState<'all' | 'local' | 'national'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const PETITIONS_PER_PAGE = 12

  const fetchPetitions = useCallback(
    async (reset = false) => {
      try {
        if (reset) {
          setLoading(true)
          setPage(1)
        }

        const currentPage = reset ? 1 : page
        const offset = (currentPage - 1) * PETITIONS_PER_PAGE

        const data = await petitionApi.getAll({
          limit: PETITIONS_PER_PAGE,
          offset,
          type: filter === 'all' ? undefined : filter,
        })

        if (reset) {
          setPetitions(data)
        } else {
          setPetitions(prev => [...prev, ...data])
        }

        setHasMore(data.length === PETITIONS_PER_PAGE)
      } catch (err) {
        console.error('Failed to fetch petitions:', err)
        setError('Failed to load petitions. Please try again later.')
      } finally {
        setLoading(false)
      }
    },
    [filter, page]
  )

  useEffect(() => {
    fetchPetitions(true) // Reset when filters change
  }, [filter, fetchPetitions])

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
    fetchPetitions(false)
  }

  const calculateDaysLeft = (createdAt: string): number => {
    const created = new Date(createdAt)
    const now = new Date()
    const daysSinceCreated = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, 60 - daysSinceCreated)
  }

  const filteredPetitions = petitions.filter(
    petition =>
      petition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      petition.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      petition.categories.some(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <>
      <title>All Petitions | Petition by BetterGov.ph</title>
      <meta
        name="description"
        content="Browse and support petitions that matter to you. Discover local and national campaigns for social change, community activism, and civic engagement."
      />
      <meta
        name="keywords"
        content="browse petitions, find petitions, social change campaigns, community activism, civic engagement, local petitions, national petitions, advocacy"
      />
      <meta name="author" content="Petition by BetterGov.ph" />
      <meta property="og:title" content="All Petitions | Petition by BetterGov.ph" />
      <meta
        property="og:description"
        content="Browse and support petitions that matter to you. Discover local and national campaigns for change."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://petition.example.com/petitions" />
      <meta property="og:image" content="https://petition.example.com/og-image.jpg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="All Petitions | Petition by BetterGov.ph" />
      <meta
        name="twitter:description"
        content="Browse and support petitions that matter to you. Discover local and national campaigns for change."
      />
      <meta name="twitter:image" content="https://petition.example.com/og-image.jpg" />
      <link rel="canonical" href="https://petition.example.com/petitions" />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">All Petitions</h1>
            <p className="text-lg text-gray-600 mb-6">
              Browse and support petitions that matter to you
            </p>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search petitions..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'local' ? 'default' : 'outline'}
                  onClick={() => setFilter('local')}
                >
                  Local
                </Button>
                <Button
                  variant={filter === 'national' ? 'default' : 'outline'}
                  onClick={() => setFilter('national')}
                >
                  National
                </Button>
              </div>
            </div>
          </div>

          {loading && petitions.length === 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-lg text-red-600">{error}</p>
              <Button onClick={() => fetchPetitions(true)} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : filteredPetitions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'No petitions match your search.' : 'No petitions found.'}
              </p>
              <Link to="/create">
                <Button>Create the First Petition</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPetitions.map(petition => {
                  const progressPercentage = Math.round(
                    (petition.current_count / petition.target_count) * 100
                  )
                  const daysLeft = calculateDaysLeft(petition.created_at)
                  const primaryCategory = petition.categories[0]?.name || 'General'

                  return (
                    <Card key={petition.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-1 flex-wrap">
                            <Badge variant="secondary">{primaryCategory}</Badge>
                            <Badge variant={petition.type === 'local' ? 'outline' : 'default'}>
                              {petition.type}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">{daysLeft} days left</span>
                        </div>
                        <CardTitle className="text-xl font-semibold line-clamp-2">
                          <Link
                            to={`/petition/${petition.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {petition.title}
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-800 mb-4 line-clamp-3">{petition.description}</p>

                        {petition.type === 'local' && petition.location && (
                          <p className="text-sm text-blue-600 mb-2">📍 {petition.location}</p>
                        )}

                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>{petition.current_count.toLocaleString()} signatures</span>
                            <span>{petition.target_count.toLocaleString()} target</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            />
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {progressPercentage}% complete
                          </div>
                        </div>

                        {isAuthenticated && hasSignedPetition(petition.id) ? (
                          <div className="flex items-center justify-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200 mb-3">
                            <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-green-800">You signed this</span>
                          </div>
                        ) : null}

                        <Link to={`/petition/${petition.slug}`}>
                          <Button className="w-full">
                            {isAuthenticated && hasSignedPetition(petition.id) ? 'View Petition' : 'View & Sign Petition'}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Load More Button */}
              {hasMore && !searchQuery && (
                <div className="text-center mt-8">
                  <Button onClick={handleLoadMore} disabled={loading} variant="outline" size="lg">
                    {loading ? 'Loading...' : 'Load More Petitions'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
