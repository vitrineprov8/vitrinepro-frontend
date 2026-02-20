# Configuración de Variables de Entorno

## Overview

Este proyecto utiliza variables de entorno para configurar diferentes comportamientos según el entorno de ejecución (desarrollo, producción, etc).

Las variables públicas (prefijo `PUBLIC_`) están disponibles en el lado del cliente y se inyectan en tiempo de compilación por Astro.

## Archivos de Configuración

### `.env` (Desarrollo - Localhost)
```bash
PUBLIC_BACKEND_URL=http://localhost:3000
PUBLIC_FRONTEND_URL=http://localhost:4321
PUBLIC_ENVIRONMENT=development
```

**Uso:** Cuando ejecutas `npm run dev` localmente

### `.env.production` (Producción - v8pro.com.br)
```bash
PUBLIC_BACKEND_URL=https://api.v8pro.com.br
PUBLIC_FRONTEND_URL=https://www.v8pro.com.br
PUBLIC_ENVIRONMENT=production
```

**Uso:** Cuando construyes para producción con `npm run build`

### `.env.example`
Plantilla con todos los variables disponibles. No debe contener valores sensibles.

## Variables Disponibles

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PUBLIC_BACKEND_URL` | URL base del API (backend) | `http://localhost:3000` |
| `PUBLIC_FRONTEND_URL` | URL del frontend (para redirecciones) | `https://www.v8pro.com.br` |
| `PUBLIC_ENVIRONMENT` | Entorno de ejecución | `development` \| `production` |
| `PUBLIC_GOOGLE_CLIENT_ID` | Client ID de Google OAuth | Obtener en Google Console |
| `PUBLIC_LINKEDIN_CLIENT_ID` | Client ID de LinkedIn OAuth | Obtener en LinkedIn Developers |

## Uso en el Código

### En archivos TypeScript/JavaScript
```typescript
// Acceder a variables públicas
const backendUrl = import.meta.env.PUBLIC_BACKEND_URL;
const environment = import.meta.env.PUBLIC_ENVIRONMENT;

// El proyecto ya lo hace en
import { getBackendUrl } from '@/utils/api';
const url = getBackendUrl(); // Retorna PUBLIC_BACKEND_URL
```

### En componentes Vue
```vue
<script setup>
const environment = import.meta.env.PUBLIC_ENVIRONMENT;
</script>
```

## Configuración en Diferentes Plataformas

### Desarrollo Local
1. Asegúrate que `.env` existe en la raíz del proyecto
2. Ejecuta: `npm run dev`
3. El backend debe estar corriendo en `http://localhost:3000`

### Build para Producción
1. Verifica que `.env.production` contiene URLs correctas
2. Ejecuta: `npm run build`
3. El site se construirá con las variables de producción
4. El resultado estará en `dist/`

### Deployment en Servidor
1. Asegúrate que `.env.production` contiene las URLs correctas de v8pro.com.br
2. Deploy el contenido de `dist/` a tu servidor
3. Las variables se compilaron en tiempo de build, no se cargan en runtime

## Seguridad

- ✅ Las variables `PUBLIC_*` se inyectan en compile-time y son visibles en el HTML
- ⚠️ **NO incluyas secretos o tokens aquí** (solo URLs públicas)
- 🔒 Los archivos `.env` y `.env.*.local` están en `.gitignore` para no exponerlos en Git
- 📝 El archivo `.env.example` documenta la estructura sin valores sensibles

## Google & LinkedIn OAuth

Para configurar OAuth, obtén los credentials:

1. **Google OAuth:**
   - Ve a https://console.cloud.google.com
   - Crea un OAuth 2.0 Client ID
   - Configura URIs autorizados (localhost:4321, v8pro.com.br)
   - Copia el Client ID a `PUBLIC_GOOGLE_CLIENT_ID`

2. **LinkedIn OAuth:**
   - Ve a https://www.linkedin.com/developers
   - Crea una aplicación
   - Obtén el Client ID
   - Configura Redirect URIs
   - Copia el Client ID a `PUBLIC_LINKEDIN_CLIENT_ID`

## Troubleshooting

**Problema:** Variables no se cargan
- **Solución:** Reinicia el servidor de desarrollo con `npm run dev`

**Problema:** URLs incorrectas en producción
- **Solución:** Verifica `.env.production` antes de hacer build

**Problema:** OAuth no funciona
- **Solución:** Verifica que los IDs de Cliente están correctos e incluye las URLs en la whitelist de cada proveedor
