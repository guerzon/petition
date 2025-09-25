import { Button } from '@/components/ui/button'
import { useTranslation  } from 'react-i18next'

export default function Hero() {
  const { t } = useTranslation('home')
  return (
    <section className="bg-linear-to-r from-primary-600 to-primary-700 text-white py-12 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-[Figtree]">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-200">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
              Start a Petition
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
              Browse Petitions
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}