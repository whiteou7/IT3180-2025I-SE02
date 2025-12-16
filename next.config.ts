import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@h1dd3nsn1p3r/pdf-invoice', 'pdfmake'],
  },
}

export default nextConfig
