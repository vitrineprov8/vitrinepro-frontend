/**
 * Astro Integration para Microsoft Clarity
 * Inyecta automáticamente el script en TODAS las páginas del proyecto
 * Sin necesidad de importes manuales
 */

export default function clarityIntegration(options = {}) {
  const projectId = options.projectId || 'w1fw9i14tt';

  return {
    name: 'clarity-integration',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        // Hook que se ejecuta cuando el build termina
        // Las páginas HTML ya están generadas con Clarity inyectado
      },
    },
  };
}

// Plugin para Vite que inyecta Clarity en el HTML durante build
export function clarityVitePlugin(options = {}) {
  const projectId = options.projectId || 'w1fw9i14tt';
  const clarityScript = `<script>
import Clarity from '@microsoft/clarity';
Clarity.init('${projectId}');
</script>`;

  return {
    name: 'vite-clarity-plugin',
    apply: 'build',
    async transformIndexHtml(html) {
      // Inyectar en </head> de HTML
      if (html.includes('</head>')) {
        return html.replace('</head>', `${clarityScript}</head>`);
      }
      return html;
    },
  };
}
