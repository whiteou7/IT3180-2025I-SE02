import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  transpilePackages: ["@supabase/supabase-js"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure @supabase/supabase-js is bundled and not externalized
      const originalExternals = config.externals
      config.externals = [
        (
          context: string,
          request: string,
          callback: (err?: Error | null, result?: string | boolean) => void
        ) => {
          // Don't externalize @supabase/supabase-js
          if (request?.includes("@supabase/supabase-js")) {
            return callback()
          }
          // Apply original externals logic
          if (typeof originalExternals === "function") {
            return originalExternals(context, request, callback)
          }
          if (Array.isArray(originalExternals)) {
            for (const external of originalExternals) {
              if (typeof external === "function") {
                const result = external(context, request, callback)
                if (result !== undefined) return result
              }
            }
          }
          return callback()
        },
      ]
    }
    return config
  },
}

export default nextConfig
