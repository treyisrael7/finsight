/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          // Security headers
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // CORS - Only allow same-origin for security (remove if you need cross-origin)
          // If you need CORS, restrict to specific origins, not '*'
          // { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN || 'https://yourdomain.com' },
        ],
      },
    ]
  }
}

export default nextConfig; 