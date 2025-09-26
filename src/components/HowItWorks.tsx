import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import {
  CheckCircle,
  Globe,
  MapPin,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      step: 1,
      title: "Create Your Petition",
      description: "Sign in and create a compelling petition with a clear title, detailed description, and supporting images.",
      image: "https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      details: [
        "Choose between local or national petition",
        "Add rich markdown descriptions",
        "Upload supporting images",
        "Select relevant categories",
        "Set your signature goal"
      ]
    },
    {
      step: 2,
      title: "Share & Promote",
      description: "Share your petition across social media, email, and other channels to reach supporters.",
      image: "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      details: [
        "Share on Facebook, Twitter, WhatsApp",
        "Copy direct links to share anywhere",
        "Email friends and family",
        "Post in relevant online communities",
        "Share in local groups and organizations"
      ]
    },
    {
      step: 3,
      title: "Gather Support",
      description: "Watch as people sign your petition and add their voices to your cause.",
      image: "https://images.pexels.com/photos/1708936/pexels-photo-1708936.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      details: [
        "Supporters can sign with or without comments",
        "Anonymous signing option available",
        "Real-time signature count updates",
        "See supporter comments and engagement",
        "Track progress toward your goal"
      ]
    },
    {
      step: 4,
      title: "Make an Impact",
      description: "Use your petition signatures to approach decision-makers and create change.",
      image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      details: [
        "Present signatures to relevant authorities",
        "Use public support to gain media attention",
        "Organize follow-up actions and events",
        "Keep supporters updated on progress",
        "Celebrate victories and milestones"
      ]
    }
  ]

  const features = [
    {
      icon: Globe,
      title: "National & Local Campaigns",
      description: "Create petitions for issues affecting your neighborhood or the entire country."
    },
    {
      icon: Shield,
      title: "Verified & Secure",
      description: "All petition creators are verified through secure sign-in, ensuring authentic campaigns."
    },
    {
      icon: Clock,
      title: "60-Day Window",
      description: "Petitions remain active for 60 days, creating urgency and focused action periods."
    },
    {
      icon: TrendingUp,
      title: "Real-Time Progress",
      description: "Track signatures, engagement, and momentum with live updates and progress bars."
    }
  ]

  const petitionTypes = [
    {
      type: "Local Petitions",
      icon: MapPin,
      description: "Address issues in your city, county, or state",
      examples: [
        "Save a local park from development",
        "Improve school bus safety in your district",
        "Fund community programs",
        "Fix local infrastructure issues",
        "Change local government policies"
      ],
      color: "bg-green-50 border-green-200 text-green-800"
    },
    {
      type: "National Petitions",
      icon: Globe,
      description: "Tackle issues that affect the entire country",
      examples: [
        "Healthcare reform and access",
        "Environmental protection laws",
        "Education policy changes",
        "Economic and social justice",
        "Technology and digital rights"
      ],
      color: "bg-blue-50 border-blue-200 text-blue-800"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How Petitions Work
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Learn how to create, promote, and use petitions to drive real change in your community and beyond
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create">
                <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg">
                  Start a Petition
                </Button>
              </Link>
              <Link to="/petitions">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg">
                  Browse Petitions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Steps Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              4 Simple Steps to Create Change
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From idea to impact, here's how petitions work on our platform
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={step.step} className="flex flex-col lg:flex-row items-center gap-8">
                <div className={`flex-shrink-0 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="w-80 h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl overflow-hidden">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className={`flex-1 ${index % 2 === 1 ? 'lg:order-1 lg:text-right' : ''}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                      {step.step}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                  </div>

                  <p className="text-lg text-gray-600 mb-6">{step.description}</p>

                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Petition Types Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Types of Petitions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether your issue is local or national, we've got you covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {petitionTypes.map((type) => (
              <Card key={type.type} className="overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${type.color}`}>
                      <type.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{type.type}</h3>
                  </div>

                  <p className="text-gray-600 mb-6">{type.description}</p>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Popular Examples:</h4>
                    <ul className="space-y-2">
                      {type.examples.map((example, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span className="text-gray-700">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Platform Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built-in tools to maximize your petition's impact and reach
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center p-6">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tips Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                Tips for Success
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Creating Your Petition</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Write a clear, compelling title that summarizes your cause</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Include specific details about the problem and solution</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Add photos or images to make your petition more engaging</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Set a realistic but ambitious signature goal</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Promoting Your Petition</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Share on all your social media platforms</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Email friends, family, and colleagues personally</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Reach out to local media and community groups</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Post updates to keep momentum going</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Your Petition?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of people who are using petitions to create positive change in their communities and beyond.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  Create Your Petition
                </Button>
              </Link>
              <Link to="/petitions">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg">
                  Explore Existing Petitions
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}