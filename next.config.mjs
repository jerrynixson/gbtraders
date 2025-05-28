let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  images: {
    unoptimized: true,
    domains: ['firebasestorage.googleapis.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.a.run.app'
      }
    ]
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    serverActions: {
      allowedOrigins: ['localhost:3000', 'gbtraders--gbweb-208de.asia-east1.hosted.app']
    }
  },
  async redirects() {
    return [
      {
        source: '/cars',
        destination: '/categories/cars',
        permanent: true,
      },
      {
        source: '/dealers',
        destination: '/categories/dealers',
        permanent: true,
      },
      {
        source: '/garages',
        destination: '/categories/garages',
        permanent: true,
      },
      {
        source: '/car-parts',
        destination: '/categories/shop',
        permanent: true,
      },
      {
        source: '/breakdown-services',
        destination: '/categories/breakdown-services',
        permanent: true,
      },
      {
        source: '/sign-up',
        destination: '/signup',
        permanent: true,
      }
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*/_next/:asset*',
          destination: '/_next/:asset*'
        }
      ],
      afterFiles: [
        {
          source: '/api/:path*',
          destination: '/api/:path*'
        },
        {
          source: '/:path*',
          destination: '/:path*'
        }
      ],
      fallback: [
        {
          source: '/:path*',
          destination: `/:path*`
        }
      ]
    };
  }
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
