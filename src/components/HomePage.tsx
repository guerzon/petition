import Hero from './Hero'
import PetitionsList from './PetitionsList'

export default function HomePage() {
  return (
    <>
      <title>Petitions by BetterGov.ph - Start and Support Meaningful Change</title>
      <meta
        name="description"
        content="Create, sign, and share petitions that matter. Join thousands of advocates making a difference in their communities and beyond. Start your petition today and be the change you want to see."
      />
      <meta
        name="keywords"
        content="start petition, sign petition, advocacy platform, social change, community activism, grassroots movement, civic engagement, democracy"
      />
      <meta name="author" content="BetterGov.ph" />
      <meta
        property="og:title"
        content="Petitions by BetterGov.ph - Start and Support Meaningful Change"
      />
      <meta
        property="og:description"
        content="Create, sign, and share petitions that matter. Join thousands of advocates making a difference in their communities and beyond."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://petition.ph/" />
      <meta property="og:image" content="https://petition.ph/bettergov-og.jpg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content="Petitions by BetterGov.ph - Start and Support Meaningful Change"
      />
      <meta
        name="twitter:description"
        content="Create, sign, and share petitions that matter. Join thousands of advocates making a difference in their communities and beyond."
      />
      <meta name="twitter:image" content="https://petition.ph/bettergov-og.jpg" />
      <link rel="canonical" href="https://petition.ph/" />

      <Hero />
      <PetitionsList />
    </>
  )
}
