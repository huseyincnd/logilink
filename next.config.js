/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ui-avatars.com'],
  },
  eslint: {
    ignoreDuringBuilds: true, // Geçici olarak ESLint kontrollerini devre dışı bırak
  },
}

module.exports = nextConfig 