/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
      { protocol: 'http', hostname: 'localhost', port: '5298' },
      { protocol: 'https', hostname: 'sawarydecor.com' },
      { protocol: 'https', hostname: 'api.sawarydecor.com' },
      // Backend currently emits some image URLs as http:// when running behind a
      // reverse proxy without forwarded-headers configured (see SawaryAPI/Program.cs) —
      // allow it too so existing/mismatched URLs don't 400 until that's redeployed.
      { protocol: 'http', hostname: 'api.sawarydecor.com' },
    ],
  },
};

export default nextConfig;
