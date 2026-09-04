/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  async redirects() {
    return [{ source: "/registration", destination: "/login", permanent: false }];
  },
};

export default nextConfig;
