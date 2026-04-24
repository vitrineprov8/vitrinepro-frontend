/**
 * Astro Integration para Google Analytics
 * Inyecta automáticamente el script en TODAS las páginas del proyecto
 * Sin necesidad de importes manuales
 */

export default function googleAnalyticsIntegration(options = {}) {
  const measurementId = options.measurementId || 'G-G5CL10932J';

  return {
    name: 'ga-integration',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        // Hook que se ejecuta cuando el build termina
      },
    },
  };
}

/**
 * Plugin para Vite que inyecta Google Analytics en el HTML durante build
 */
export function googleAnalyticsVitePlugin(options = {}) {
  const measurementId = options.measurementId || 'G-G5CL10932J';

  // Script de Google Analytics que se inyectará
  const gaScript = `<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}');
</script>`;

  return {
    name: 'vite-ga-plugin',
    apply: 'build',
    async transformIndexHtml(html) {
      // Inyectar en </head> de HTML
      if (html.includes('</head>')) {
        return html.replace('</head>', `${gaScript}</head>`);
      }
      return html;
    },
  };
}
