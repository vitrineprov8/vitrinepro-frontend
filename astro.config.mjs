import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import vercel from '@astrojs/vercel';
import clarityIntegration, { clarityVitePlugin } from './src/integrations/clarity.mjs';
import googleAnalyticsIntegration, { googleAnalyticsVitePlugin } from './src/integrations/google-analytics.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://v8pro.com.br',
  trailingSlash: 'never',
  integrations: [
    vue(),
    clarityIntegration({ projectId: 'w1fw9i14tt' }),
    googleAnalyticsIntegration({ measurementId: 'G-G5CL10932J' }),
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
      googleAnalyticsVitePlugin({ measurementId: 'G-G5CL10932J' }),
    ]
  }
});