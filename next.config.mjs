/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net', 
      },
      {
        protocol: 'https',
        hostname: 'img.theapi.app',
        pathname: '/ephemeral/**',
      }
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    const headers = [];
    
    

    // Existing headers
    headers.push(
      {
        source: '/api/proxy-productions',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
        ],
      },
      {
        source: '/((?!api/proxy-productions).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      }
    );

    return headers;
  },
  
};

export default nextConfig;