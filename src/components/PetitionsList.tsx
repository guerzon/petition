import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const mockPetitions = [
  {
    id: 1,
    title: 'Increase Funding for Public Education',
    description:
      'We demand increased funding for public schools to ensure quality education for all children.',
    signatures: 15420,
    target: 25000,
    category: 'Education',
    daysLeft: 23,
  },
  {
    id: 2,
    title: 'Improve Public Transportation Infrastructure',
    description:
      'Expand and modernize public transportation to reduce traffic congestion and carbon emissions.',
    signatures: 8950,
    target: 15000,
    category: 'Transportation',
    daysLeft: 18,
  },
  {
    id: 3,
    title: 'Protect Local Wildlife Habitats',
    description:
      'Preserve critical wildlife habitats from urban development and ensure biodiversity protection.',
    signatures: 22100,
    target: 30000,
    category: 'Environment',
    daysLeft: 31,
  },
]

export default function PetitionsList() {
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
          {mockPetitions.map(petition => {
            const progressPercentage = Math.round((petition.signatures / petition.target) * 100)

            return (
              <Card key={petition.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{petition.category}</Badge>
                    <span className="text-sm text-gray-500">{petition.daysLeft} days left</span>
                  </div>
                  <CardTitle className="text-xl font-semibold line-clamp-2 font-[Figtree]">
                    {petition.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-800 mb-4 line-clamp-3">{petition.description}</p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{petition.signatures.toLocaleString()} signatures</span>
                      <span>{petition.target.toLocaleString()} target</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{progressPercentage}% complete</div>
                  </div>

                  <Button className="w-full text-white">Sign This Petition</Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Petitions
          </Button>
        </div>
      </div>
    </section>
  )
}
