import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import vercel from '@astrojs/vercel';
import clarityIntegration, { clarityVitePlugin } from './src/integrations/clarity.mjs';
import gtmIntegration, { gtmVitePlugin } from './src/integrations/gtm.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://v8pro.com.br',
  trailingSlash: 'never',
  integrations: [
    vue(),
    clarityIntegration({ projectId: 'w1fw9i14tt' }),
    gtmIntegration({ containerId: 'GTM-TLTNFG8T' }),
  ],
  adapter: vercel(),
  server: {
    port: 4321
  },
  vite: {
    define: {
      'import.meta.env.ENVIRONMENT': JSON.stringify(
        process.env.NODE_ENV === 'production' ? 'production' : 'development'
      )
    },
    plugins: [
      clarityVitePlugin({ projectId: 'w1fw9i14tt' }),
      gtmVitePlugin({ containerId: 'GTM-TLTNFG8T' }),
    ]
  }
});