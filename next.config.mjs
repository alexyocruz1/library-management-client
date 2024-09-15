import { i18n } from './next-i18next.config.mjs';
import withPWA from 'next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true
});

const nextConfig = {
  i18n,
  ...pwaConfig,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;