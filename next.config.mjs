/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false, // or true if you want it to be a permanent redirect
      },
    ];
  },
};
export default nextConfig;
