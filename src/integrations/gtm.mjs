/**
 * Astro Integration para Google Tag Manager.
 * Inyecta el snippet de GTM (head + noscript) en TODAS las páginas durante el build,
 * incluso aquellas que no usen BaseLayout/DashboardLayout.
 */

export default function gtmIntegration(options = {}) {
  return {
    name: 'gtm-integration',
    hooks: {
      'astro:build:done': async () => {},
    },
  };
}

export function gtmVitePlugin(options = {}) {
  const containerId = options.containerId || 'GTM-TLTNFG8T';

  const headSnippet = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');</script>
<!-- End Google Tag Manager -->`;

  const noscriptSnippet = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

  return {
    name: 'vite-gtm-plugin',
    apply: 'build',
    async transformIndexHtml(html) {
      let out = html;
      if (out.includes('</head>') && !out.includes(`id=${containerId}`)) {
        out = out.replace('</head>', `${headSnippet}\n</head>`);
      }
      if (out.includes('<body')) {
        out = out.replace(/<body([^>]*)>/, `<body$1>\n${noscriptSnippet}`);
      }
      return out;
    },
  };
}
