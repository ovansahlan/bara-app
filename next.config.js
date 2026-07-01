/** @type {import('next').NextConfig} */
const nextConfig = {
    // Beritahu Next.js untuk memproses sintaks modern di package ini
    transpilePackages: ['undici', '@vercel/blob'],
  };
  
  module.exports = nextConfig;