import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import vercel from '@astrojs/vercel';

import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  site: 'https://v8pro.com.br',
  integrations: [vue(), partytown()],
  adapter: vercel(),
  server: {
    port: 4321
  },
  vite: {
    define: {
      'import.meta.env.ENVIRONMENT': JSON.stringify(
        process.env.NODE_ENV === 'production' ? 'production' : 'development'
      )
    }
  }
});