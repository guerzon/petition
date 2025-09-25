import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { petitionApi } from '@/services/api'
import type { PetitionWithDetails } from '@/types/api'

export default function PetitionsList() {
  const [petitions, setPetitions] = useState<PetitionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        // Get first 6 petitions for featured section
        const data = await petitionApi.getAll({ limit: 6 })
        setPetitions(data)
      } catch (err) {
        console.error('Failed to fetch petitions:', err)
        setError('Failed to load petitions. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchPetitions()
  }, [])

  const calculateDaysLeft = (createdAt: string): number => {
    const created = new Date(createdAt)
    const now = new Date()
    const daysSinceCreated = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    // Assume petitions are active for 60 days
    return Math.max(0, 60 - daysSinceCreated)
  }

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-[Figtree]">
              Featured Petitions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Loading petitions...
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-[Figtree]">
            Featured Petitions
          </h2>
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </section>
    )
  }
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-[Figtree]">
            Featured Petitions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover petitions that are making a real difference in communities nationwide
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {petitions.map(petition => {
            const progressPercentage = Math.round((petition.current_count / petition.target_count) * 100)
            const daysLeft = calculateDaysLeft(petition.created_at)
            const primaryCategory = petition.categories[0]?.name || 'General'

            return (
              <Card key={petition.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{primaryCategory}</Badge>
                    <span className="text-sm text-gray-500">{daysLeft} days left</span>
                  </div>
                  <CardTitle className="text-xl font-semibold line-clamp-2 font-[Figtree]">
                    <Link to={`/petition/${petition.slug}`} className="hover:text-blue-600 transition-colors">
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
                    <div className="text-sm text-gray-500 mt-1">{progressPercentage}% complete</div>
                  </div>

                  <Link to={`/petition/${petition.slug}`}>
                    <Button className="w-full text-white">View & Sign Petition</Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {petitions.length === 0 && !loading && !error && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">No petitions found. Be the first to create one!</p>
            <Link to="/create">
              <Button>Create a Petition</Button>
            </Link>
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/petitions">
            <Button variant="outline" size="lg">
              View All Petitions
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
