/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Build errors ignore karne ke liye (Aapki existing settings)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // 2. SEO & Duplicate URL Prevention (/about aur /about/ ko ek hi maanega)
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,

  // 3. Fast Image Loading (Core Web Vitals aur Google Ranking ke liye)
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Sabhi external book covers aur blog images allow karega
      },
    ],
  },

  // 4. Redirect Error Fix (www.vedoxa.shop ko seedha vedoxa.shop par bhejega)
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.vedoxa.shop',
          },
        ],
        destination: 'https://vedoxa.shop/:path*',
        permanent: true,
      },
    ]
  },

  // 5. Security & SEO Headers (Google Trust Score badhane ke liye)
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
