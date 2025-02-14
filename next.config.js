/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ui-avatars.com'],
  },
  eslint: {
    // Warning: Bu seçenek production'da ESLint kontrolünü devre dışı bırakır
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: Bu seçenek production'da type checking'i devre dışı bırakır
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 