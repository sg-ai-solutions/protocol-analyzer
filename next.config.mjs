/** @type {import('next').NextConfig} */
const nextConfig = {
  // v2: NOT a static export. The live analysis path (/api/analyze) runs as a
  // Netlify function, which is incompatible with output: 'export'. App Router
  // pages with no server code stay statically prerendered; only /api/analyze
  // runs on demand.
  images: { unoptimized: true },
};

export default nextConfig;
