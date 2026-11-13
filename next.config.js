javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Vercel ko strict ESLint aur TypeScript warnings ignore karne ko bolega
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // 2. SEO & Duplicate URL Prevention
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,

  // 3. Fast Image Loading (Core Web Vitals aur Google Ranking ke liye)
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // NOTE: Domain redirect (www vs non-www) Vercel Dashboard se handle hota hai,
  // isliye yahan redirects() nahi lagana hai warna infinite loop banta hai.

  // 4. Security & SEO Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
