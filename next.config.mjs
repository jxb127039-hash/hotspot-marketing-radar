/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  typedRoutes: true,
  output: "export",
  trailingSlash: true,
  basePath: isGithubPages ? "/hotspot-marketing-radar" : undefined,
  assetPrefix: isGithubPages ? "/hotspot-marketing-radar/" : undefined,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
