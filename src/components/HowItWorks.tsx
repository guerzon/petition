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
import { useTranslation } from 'react-i18next'

export default function HowItWorks() {
  const { t } = useTranslation('common')

  const steps = [
    {
      step: 1,
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
      image: "https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      details: [
        t('howItWorks.step1.detail1'),
        t('howItWorks.step1.detail2'),
        t('howItWorks.step1.detail3'),
        t('howItWorks.step1.detail4'),
        t('howItWorks.step1.detail5')
      ]
    },
    {
      step: 2,
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
      image: "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      details: [
        t('howItWorks.step2.detail1'),
        t('howItWorks.step2.detail2'),
        t('howItWorks.step2.detail3'),
        t('howItWorks.step2.detail4'),
        t('howItWorks.step2.detail5')
      ]
    },
    {
      step: 3,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
      image: "https://images.pexels.com/photos/1708936/pexels-photo-1708936.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      details: [
        t('howItWorks.step3.detail1'),
        t('howItWorks.step3.detail2'),
        t('howItWorks.step3.detail3'),
        t('howItWorks.step3.detail4'),
        t('howItWorks.step3.detail5')
      ]
    },
    {
      step: 4,
      title: t('howItWorks.step4.title'),
      description: t('howItWorks.step4.description'),
      image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      details: [
        t('howItWorks.step4.detail1'),
        t('howItWorks.step4.detail2'),
        t('howItWorks.step4.detail3'),
        t('howItWorks.step4.detail4'),
        t('howItWorks.step4.detail5')
      ]
    }
  ]

  const features = [
    {
      icon: Globe,
      title: t('howItWorks.feature1.title'),
      description: t('howItWorks.feature1.description')
    },
    {
      icon: Shield,
      title: t('howItWorks.feature2.title'),
      description: t('howItWorks.feature2.description')
    },
    {
      icon: Clock,
      title: t('howItWorks.feature3.title'),
      description: t('howItWorks.feature3.description')
    },
    {
      icon: TrendingUp,
      title: t('howItWorks.feature4.title'),
      description: t('howItWorks.feature4.description')
    }
  ]

  const petitionTypes = [
    {
      type: t('howItWorks.localPetitions'),
      icon: MapPin,
      description: t('howItWorks.localDescription'),
      examples: [
        t('howItWorks.localExample1'),
        t('howItWorks.localExample2'),
        t('howItWorks.localExample3'),
        t('howItWorks.localExample4'),
        t('howItWorks.localExample5')
      ],
      color: "bg-green-50 border-green-200 text-green-800"
    },
    {
      type: t('howItWorks.nationalPetitions'),
      icon: Globe,
      description: t('howItWorks.nationalDescription'),
      examples: [
        t('howItWorks.nationalExample1'),
        t('howItWorks.nationalExample2'),
        t('howItWorks.nationalExample3'),
        t('howItWorks.nationalExample4'),
        t('howItWorks.nationalExample5')
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
              {t('howItWorks.title')}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              {t('howItWorks.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create">
                <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg">
                  {t('howItWorks.startPetition')}
                </Button>
              </Link>
              <Link to="/petitions">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg">
                  {t('howItWorks.browsePetitions')}
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
              {t('howItWorks.stepsTitle')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('howItWorks.stepsSubtitle')}
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
              {t('howItWorks.typesTitle')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('howItWorks.typesSubtitle')}
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
                    <h4 className="font-semibold text-gray-900 mb-3">{t('howItWorks.popularExamples')}</h4>
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
              {t('howItWorks.featuresTitle')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('howItWorks.featuresSubtitle')}
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
                {t('howItWorks.tipsTitle')}
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('howItWorks.creatingTitle')}</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{t('howItWorks.tip1')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{t('howItWorks.tip2')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{t('howItWorks.tip3')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{t('howItWorks.tip4')}</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('howItWorks.promotingTitle')}</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{t('howItWorks.tip5')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{t('howItWorks.tip6')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{t('howItWorks.tip7')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{t('howItWorks.tip8')}</span>
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
              {t('howItWorks.ctaTitle')}
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('howItWorks.ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  {t('howItWorks.createYourPetition')}
                </Button>
              </Link>
              <Link to="/petitions">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg">
                  {t('howItWorks.exploreExistingPetitions')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}