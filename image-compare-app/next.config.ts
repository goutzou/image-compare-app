import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname, // force correct workspace root
  },
};

module.exports = nextConfig;

export default nextConfig;
