import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  structuredData?: object
}

const defaultSEO = {
  title: 'PetitionHub - Start and Support Meaningful Change',
  description: 'Create, sign, and share petitions that matter. Join thousands of advocates making a difference in their communities and beyond. Start your petition today.',
  keywords: 'petition, advocacy, change, community, social impact, democracy, civic engagement, grassroots',
  image: 'https://petition.example.com/og-image.jpg',
  url: 'https://petition.example.com/',
  type: 'website' as const
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  structuredData
}: SEOProps) {
  const seo = {
    title: title ? `${title} | PetitionHub` : defaultSEO.title,
    description: description || defaultSEO.description,
    keywords: keywords || defaultSEO.keywords,
    image: image || defaultSEO.image,
    url: url || defaultSEO.url,
    type
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seo.title}</title>
      <meta name="title" content={seo.title} />
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={seo.type} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={seo.url} />
      <meta property="twitter:title" content={seo.title} />
      <meta property="twitter:description" content={seo.description} />
      <meta property="twitter:image" content={seo.image} />

      {/* Canonical URL */}
      <link rel="canonical" href={seo.url} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  )
}