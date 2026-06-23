import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
  serverExternalPackages: ["music-metadata"],
  turbopack: {
    root: path.join(__dirname),
  },
}

export default nextConfig
