import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://anireserve.com'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/dashboard/',
                    '/api/',
                    '/email-preview/',
                    '/secret-admin-login/',
                    '/reset-password/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
