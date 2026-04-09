/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ye Vercel ko strict ESLint warnings ignore karne ko bolega
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ye Vercel ko strict TypeScript checking ignore karne ko bolega
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig

