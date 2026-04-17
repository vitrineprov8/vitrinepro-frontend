# VitrinePro Frontend — Claude Code Agent Instructions

## Qué es este proyecto

VitrinePro es una plataforma SaaS de portfolios profesionales para Brasil.
- **Producción:** https://v8pro.com.br
- **Deploy:** Vercel con `@astrojs/vercel` adapter
- **Backend:** https://vitrinepro-bakend-production.up.railway.app

---

## Stack

| Tecnología | Versión |
|---|---|
| Astro | 5.x |
| Vue 3 | 3.4 (Composition API + `<script setup>`) |
| TypeScript | Strict |
| Tiptap | 3.x (editor + renderer) |
| CSS custom | Sin Tailwind, sin UI libraries |

---

## Estrategia de Rendering — REGLA CRÍTICA

El objetivo es **minimizar costos de servidor** y **maximizar performance pública**.

### Páginas públicas → SSG (estático por defecto)
- `/`, `/login`, `/signup`, `/explorar`, `/privacidade`, `/termos`, etc.
- Páginas dinámicas públicas (`/perfil/[slug]`, `/portfolio/[slug]`) → SSR solo si necesitan datos frescos, preferir ISR/cache cuando sea posible.
- **SEO completo** en todas las páginas públicas via `BaseLayout.astro`.
- Nunca usar `client:load` innecesariamente en páginas públicas.

### Dashboard → 100% Client Side
- Todas las rutas `/dashboard/*` son **client-only**: shell Astro mínimo + `<Component client:load />`.
- El componente Vue maneja todo: auth check, fetch de datos, UI.
- La página Astro no hace ningún fetch al backend — solo sirve el HTML shell.
- Ejemplo de página dashboard correcta:

```astro
---
// src/pages/dashboard/perfil.astro
// SIN imports de API, SIN fetch, SIN getStaticPaths
---
<html>
  <head><title>Dashboard</title></head>
  <body>
    <ProfileEditor client:load />
  </body>
</html>
```

### Por qué
- Vercel cobra por invocaciones de función serverless. El dashboard no necesita SSR.
- Las páginas públicas ganan en Lighthouse/Core Web Vitals siendo estáticas.

---

## Estructura de directorios

```
src/
├── components/
│   ├── dashboard/     # Componentes Vue — área autenticada (client-only)
│   ├── profile/       # Componentes Vue — perfil público
│   ├── ui/            # Modal, Toast, ConfirmDialog, TagSelect, Pagination, etc.
│   └── landing/       # Hero, Auth forms, Header, Footer
├── layouts/
│   └── BaseLayout.astro  # Template master con SEO, JSON-LD, GA4
├── pages/             # File-based routing Astro
├── utils/
│   ├── api.ts         # Todos los tipos y funciones de API
│   └── auth.ts        # JWT helpers
└── styles/
    ├── variables.css  # Design tokens
    ├── global.css     # Reset + base (importa variables.css)
    ├── dashboard.css  # Estilos del dashboard
    └── auth.css
```

---

## Patrones de código

### Componente Vue (Composition API)
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';

const loading = ref(false);
const saving = ref(false);

async function save() {
  if (saving.value) return;  // guard
  saving.value = true;
  try { /* ... */ }
  finally { saving.value = false; }  // siempre en finally
}
</script>
```

### Auth en componentes dashboard
```ts
import { isAuthenticated, redirectToLogin } from '@/utils/auth';

onMounted(() => {
  if (!isAuthenticated()) redirectToLogin();
});
```

### Import de CSS en Astro
```astro
<style is:global>
  @import '../styles/global.css';
</style>
```
**NO** usar `<link rel="stylesheet" href="/src/...">`.

### Upload de archivos
- Usar `fetchAPIFormData()` de `api.ts` — nunca definir `Content-Type` manualmente.
- Preview antes de upload: `URL.createObjectURL(file)`, liberar con `URL.revokeObjectURL()`.
- Flujo de imágenes: `ImageAdjustModal` (crop) → blob → upload.
  - Avatar: aspect ratio 1:1
  - Cover: aspect ratio 16:9

---

## API Client

`src/utils/api.ts` — wrapper sobre fetch que:
- Inyecta Bearer token desde localStorage automáticamente.
- Maneja errores con mensajes en **portugués**.
- Exporta todos los tipos TypeScript de entidades.

**Módulos:** `auth`, `profile`, `portfolio`, `tags`, `cv`, `education`, `uploads`.

---

## SEO (solo páginas públicas)

`BaseLayout.astro` maneja: canonical, OG, Twitter Card, Organization JSON-LD, GA4.

JSON-LD específico por ruta:
- `/perfil/*` → Person
- `/portfolio/*` → CreativeWork

`/dashboard/` y `/auth/` están bloqueados en robots.txt.

---

## Variables de entorno

```env
PUBLIC_BACKEND_URL=http://localhost:3000          # dev
PUBLIC_BACKEND_URL=https://vitrinepro-bakend-production.up.railway.app  # prod
PUBLIC_FRONTEND_URL=http://localhost:4321
PUBLIC_ENVIRONMENT=development
```

---

## Comandos

```bash
npm run dev      # localhost:4321
npm run build    # type check + build
npm run preview  # preview del build
```

---

## Reglas para el agente

1. **No agregar SSR a páginas de dashboard** — siempre client-side.
2. **No usar Tailwind ni UI libraries externas** — solo CSS custom con variables.
3. **No cambiar el Content-Type en uploads** — el browser lo define.
4. **TypeScript strict** — no usar `any`, tipar todo con los tipos de `api.ts`.
5. **Portugués** en mensajes de error al usuario (el producto es para Brasil).
6. **Scoped styles** en componentes Vue; globales solo en archivos CSS de `src/styles/`.
7. Leer siempre el archivo antes de editarlo.
8. No crear helpers ni abstracciones para uso único.
9. No agregar manejo de errores para casos imposibles.
10. **Performance primero**: páginas públicas deben ser estáticas o bien cacheadas.
11. **Testes E2E**: Ao modificar qualquer componente, consulte `tests/MANIFEST.md` para encontrar o arquivo de teste correspondente e atualize-o se o comportamento ou estrutura HTML mudar. Após mudanças significativas rode `npm run test:e2e` para verificar regressões.
