import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbcdnw.aoneroom.com',
      },
      {
        protocol: 'https',
        hostname: 'pbcdn.aoneroom.com',
      },
      {
        protocol: 'https',
        hostname: 'filmboom.top',
      },
      {
        protocol: 'https',
        hostname: '*.filmboom.top',
      },
      {
        protocol: 'https',
        hostname: '*.aoneroom.com'
      },
      {
        protocol: 'https',
        hostname: 'otakudesu.best',
      },
      {
        protocol: 'https',
        hostname: 'i0.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
      },
      {
        protocol: 'https',
        hostname: 'hwztchapter.dramaboxdb.com',
      },
      {
        protocol: 'https',
        hostname: '123movienow.cc',
      },
      {
        protocol: 'https',
        hostname: '*.123movienow.cc',
      },
      {
        protocol: 'https',
        hostname: '*.dramaboxdb.com',
      },
      {
        protocol: 'http',
        hostname: '43.228.214.96',
        port: '8000',
      }
    ],
  },
};

export default nextConfig;
