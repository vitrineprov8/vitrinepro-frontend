import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],
  adapter: node({ mode: 'standalone' }),
  server: {
    port: 4321
  },
  output: 'server',
  vite: {
    define: {
      'import.meta.env.ENVIRONMENT': JSON.stringify(
        process.env.NODE_ENV === 'production' ? 'production' : 'development'
      )
    }
  }
});
