# VitrinePro Frontend — Project Overview

## Qué es

VitrinePro es una plataforma SaaS de portfolios profesionales. Permite a profesionales (abogados, médicos, programadores, diseñadores, consultores, etc.) crear y compartir su portafolio en línea con contenido enriquecido.

**URL Producción:** https://v8pro.com.br
**Deploy:** Vercel (adapter `@astrojs/vercel`)

---

## Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Astro | 5.17.3 | Framework principal, SSR + SSG, file-based routing |
| Vue 3 | 3.4.0 | Componentes interactivos (islands architecture) |
| TypeScript | 5.3.0 | Tipado estático completo |
| Tiptap | 3.20.0 | Editor de texto enriquecido |
| vue-advanced-cropper | 2.8.9 | Recorte de imágenes |
| Vercel | — | Hosting y SSR |

---

## Arquitectura

### Modelo híbrido Astro + Vue 3

- **Astro pages** (`.astro`): Render estático/SSR del servidor. Routing, SEO, metadata.
- **Vue components** (`.vue`): Lógica interactiva del cliente. Dashboard, formularios, modales.
- **Islands Architecture**: Solo los componentes Vue se hidratan en el cliente (`client:load`).

### Estructura de directorios

```
src/
├── components/
│   ├── dashboard/     # 12 componentes Vue — área autenticada
│   ├── profile/       # 3 componentes Vue — perfil público
│   ├── ui/            # 10 componentes reutilizables (Modal, Toast, etc.)
│   └── landing/       # Hero, Auth forms, Header, Footer
├── layouts/
│   └── BaseLayout.astro  # Template master con SEO, JSON-LD, GA4
├── pages/             # File-based routing
│   ├── index.astro
│   ├── dashboard/     # Rutas protegidas
│   ├── perfil/[slug].astro
│   ├── portfolio/[slug].astro
│   └── ... (estáticas, auth)
├── utils/
│   ├── api.ts         # Cliente API completo + tipos TypeScript
│   └── auth.ts        # JWT management + helpers de auth
└── styles/
    ├── variables.css  # Design tokens (colores, spacing, tipografía)
    ├── global.css     # Reset + elementos base
    ├── auth.css       # Formularios de login/signup
    ├── dashboard.css  # Estilos del dashboard (3076 líneas)
    └── static-pages.css
```

---

## Rutas

### Públicas
| Ruta | Página |
|---|---|
| `/` | Landing page |
| `/login`, `/signup` | Autenticación |
| `/perfil/[username]` | Perfil público |
| `/portfolio/[slug]` | Detalle de ítem |
| `/explorar` | Explorar portfolios |
| `/privacidade`, `/termos`, `/cookies`, `/faq`, `/contato`, `/ajuda` | Páginas estáticas |
| `/auth/callback` | Callback OAuth |

### Protegidas (requieren JWT en localStorage)
| Ruta | Dashboard |
|---|---|
| `/dashboard` | Home del dashboard |
| `/dashboard/perfil` | Editor de perfil |
| `/dashboard/portfolio` | Listado de ítems |
| `/dashboard/portfolio/novo` | Crear ítem |
| `/dashboard/portfolio/[id]` | Editar ítem |
| `/dashboard/curriculos` | Gestión de CVs |
| `/dashboard/formacao` | Formación académica |
| `/dashboard/tags` | Gestión de etiquetas |

---

## Autenticación

- **Almacenamiento:** JWT en `localStorage`
- **Login local:** email + password → POST `/auth/login` → JWT
- **OAuth:** Google / LinkedIn → callback → JWT → `/auth/callback?token=...`
- **`src/utils/auth.ts`:** `saveToken`, `getToken`, `isAuthenticated`, `getUserFromToken`, `isTokenExpired`, `logout`, `redirectToLogin`

---

## API Client (`src/utils/api.ts`)

Wrapper sobre `fetch` que:
- Inyecta automáticamente el Bearer token de localStorage
- Maneja errores y los traduce a mensajes en portugués
- Exporta tipos TypeScript de todas las entidades

**Módulos de la API:**
- `auth` — login, register, profile
- `profile` — CRUD perfil, upload avatar
- `portfolio` — CRUD ítems, covers, archivos
- `tags` — CRUD etiquetas
- `cv` — upload/gestión de CVs
- `education` — formación académica
- `uploads` — upload de imágenes para contenido

---

## Sistema de Estilos

### Design Tokens (`variables.css`)
```css
--primary: #2563eb          /* azul */
--secondary: #7c3aed        /* púrpura */
--accent: #f59e0b           /* naranja */
--text-primary: #1f2937
--bg-primary: #ffffff
```

- **Spacing:** xs (8px) → 4xl (96px)
- **Border radius:** sm (4px) → full (9999px)
- **Breakpoints:** 640 / 768 / 1024 / 1280 / 1536px
- **Font stack:** sistema (sans-serif)

### Scoped vs Global
- Componentes Vue usan `<style scoped>` para estilos propios
- Estilos de layout/dashboard en archivos CSS globales importados desde Astro

---

## Componentización Vue

### Patrón base (Composition API)
```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const loading = ref(false);
const saving = ref(false);

async function save() {
  if (saving.value) return;  // save guard
  saving.value = true;
  try { ... }
  finally { saving.value = false; }  // siempre en finally
}
</script>
```

### Componentes UI reutilizables (`src/components/ui/`)
| Componente | Uso |
|---|---|
| `ImageAdjustModal.vue` | Recorte de imágenes antes de subir |
| `Modal.vue` | Diálogo base |
| `Toast.vue` | Notificaciones |
| `ConfirmDialog.vue` | Confirmación de acciones destructivas |
| `StatusBadge.vue` | DRAFT / PUBLISHED |
| `TagSelect.vue` | Selector de etiquetas |
| `Pagination.vue` | Paginación |
| `EmptyState.vue` | Estado vacío |
| `LoadingSpinner.vue` | Indicador de carga |

### Patron de subida de imágenes
Siempre: `ImageAdjustModal` (crop) → blob → upload a backend.
- Avatar: aspect ratio 1:1
- Cover de ítem: aspect ratio 16:9

---

## SEO

Implementado en `BaseLayout.astro`:
- Canonical URL
- Open Graph (og:image 1200×630, og:locale pt_BR)
- Twitter Card
- Organization JSON-LD
- Google Analytics (GA4)

Páginas dinámicas tienen JSON-LD específico:
- `/artigo/*` → BlogPosting
- `/projeto/*` → CreativeWork
- `/perfil/*` → Person
- `/faq` → FAQPage

Robots: `/dashboard/` y `/auth/` bloqueados.
Sitemap dinámico en `src/pages/sitemap.xml.ts` (fetch al backend).

---

## Variables de Entorno

```env
# Desarrollo
PUBLIC_BACKEND_URL=http://localhost:3000
PUBLIC_FRONTEND_URL=http://localhost:4321
PUBLIC_ENVIRONMENT=development

# Producción
PUBLIC_BACKEND_URL=https://vitrinepro-bakend-production.up.railway.app
PUBLIC_FRONTEND_URL=https://www.v8pro.com.br
PUBLIC_ENVIRONMENT=production
```

---

## Comandos

```bash
npm run dev      # Dev server en localhost:4321
npm run build    # Type check + build de producción
npm run preview  # Preview del build
```

---

## Archivos clave

| Archivo | Propósito |
|---|---|
| `src/utils/api.ts` | Cliente API completo + todos los tipos |
| `src/utils/auth.ts` | JWT management |
| `src/layouts/BaseLayout.astro` | Template master con SEO |
| `src/components/dashboard/ProfileEditor.vue` | Editor de perfil |
| `src/components/dashboard/PortfolioEditor.vue` | Editor de ítems con Tiptap |
| `src/components/dashboard/DashboardLayout.vue` | Layout con sidebar |
| `src/components/ui/ImageAdjustModal.vue` | Modal de recorte |
| `src/styles/variables.css` | Design tokens |
| `src/styles/dashboard.css` | Estilos del dashboard (3076 líneas) |
| `astro.config.mjs` | Config de Astro |
