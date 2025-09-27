import Hero from './Hero'
import PetitionsList from './PetitionsList'
import SEO from './SEO'

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PetitionHub",
    "description": "Create, sign, and share petitions that matter. Join thousands of advocates making a difference in their communities and beyond.",
    "url": "https://petition.example.com/",
    "logo": "https://petition.example.com/logo.png",
    "sameAs": [
      "https://twitter.com/petitionhub",
      "https://facebook.com/petitionhub"
    ],
    "founder": {
      "@type": "Organization",
      "name": "PetitionHub Team"
    },
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@petition.example.com"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Petition Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Create Petition",
            "description": "Start your own petition to advocate for change"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Sign Petition",
            "description": "Support causes you care about by signing petitions"
          }
        }
      ]
    }
  }

  return (
    <>
      <SEO
        title="Home"
        description="Create, sign, and share petitions that matter. Join thousands of advocates making a difference in their communities and beyond. Start your petition today and be the change you want to see."
        keywords="start petition, sign petition, advocacy platform, social change, community activism, grassroots movement, civic engagement, democracy"
        url="https://petition.example.com/"
        structuredData={structuredData}
      />
      <Hero />
      <PetitionsList />
    </>
  )
}