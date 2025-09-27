import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useUserSignatures } from '@/hooks/useUserSignatures'
import type { PetitionWithDetails } from '@/types/api'

interface PetitionCardProps {
  petition: PetitionWithDetails
  showSignedStatus?: boolean
  showTypeBadge?: boolean
}

export default function PetitionCard({ 
  petition, 
  showSignedStatus = false, 
  showTypeBadge = false 
}: PetitionCardProps) {
  const { hasSignedPetition, isAuthenticated } = useUserSignatures()
  
  const progressPercentage = Math.round((petition.current_count / petition.target_count) * 100)
  const primaryCategory = petition.categories[0]?.name || 'General'
  
  // Calculate days left (60 days from creation)
  const calculateDaysLeft = (createdAt: string): number => {
    const created = new Date(createdAt)
    const now = new Date()
    const daysSinceCreated = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, 60 - daysSinceCreated)
  }
  
  const daysLeft = calculateDaysLeft(petition.created_at)
  const hasSigned = isAuthenticated && hasSignedPetition(petition.id)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-1 flex-wrap">
            <Badge variant="secondary">{primaryCategory}</Badge>
            {showTypeBadge && (
              <Badge variant={petition.type === 'local' ? 'outline' : 'default'}>
                {petition.type}
              </Badge>
            )}
          </div>
          {showSignedStatus && hasSigned ? (
            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-medium">Signed</span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">{daysLeft} days left</span>
          )}
        </div>
        <CardTitle className="text-xl font-semibold line-clamp-2 font-[Figtree]">
          <Link to={`/petition/${petition.slug}`} className="hover:text-blue-600 transition-colors">
            {petition.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <p className="text-gray-800 mb-4 line-clamp-3">{petition.description}</p>

        {petition.type === 'local' && petition.location && (
          <p className="text-sm text-blue-600 mb-2">📍 {petition.location}</p>
        )}

        <div className="mb-4 flex-grow">
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

        <Link to={`/petition/${petition.slug}`} className="mt-auto">
          <Button className="w-full text-white">
            {hasSigned ? 'View Petition' : 'View & Sign Petition'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
