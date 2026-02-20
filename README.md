# VitrinePro V8

Plataforma de portfólio profissional para advogados, médicos, programadores e outros profissionais.

## Tecnologias

- **Astro** - Framework principal
- **Vue 3** - Componentes interativos
- **TypeScript** - Type safety
- **CSS Modules** - Estilização
## Desenvolvimento
### Configuração Inicial

1. **Clone o repositório**
```bash
git clone <repository-url>
cd vitrineproIA
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de entorno**

Crie um arquivo `.env` na raiz do projeto:

```env
# Backend API URL
PUBLIC_BACKEND_URL=http://localhost:3000

# Frontend URL (usado pelo backend para callbacks OAuth)
PUBLIC_FRONTEND_URL=http://localhost:4321
```

⚠️ **Importante:** Certifique-se de que o backend NestJS está configurado e rodando na porta 3000.

4. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:4321`

### Build para Produção

```bash
# Build
npm run build

# Preview da build
npm run preview
```

## Estrutura

```
vitrineproIA/
├── src/
│   ├── components/    # Componentes Vue e Astro
│   ├── layouts/       # Layouts da aplicação
│   ├── pages/         # Páginas (rotas)
│   └── styles/        # Estilos globais
└── public/            # Arquivos estáticos
```

## Features

- ✅ Responsive (Mobile, Tablet, Desktop)
- ✅ TypeScript
- ✅ CSS Modules
- ✅ Componentes Vue 3
- ✅ SEO otimizado
- ✅ Performance otimizada
- ✅ **Sistema de Autenticação Completo**
  - Login/Registro tradicional (email/senha)
  - OAuth com Google
  - OAuth com LinkedIn
  - Proteção de rotas
  - Gerenciamento de sessão com JWT

## Autenticação

### Rotas de Autenticação

O sistema possui as seguintes rotas:

- `/login` - Página de login
- `/signup` - Página de cadastro
- `/dashboard` - Dashboard do usuário (protegida)
- `/auth/callback` - Callback OAuth (não acessar diretamente)

### Fluxo de Autenticação

#### 1. Registro/Login Tradicional

```
1. Usuário acessa /signup ou /login
2. Preenche formulário
3. Sistema autentica no backend
4. Token JWT é salvo no localStorage
5. Redirecionamento para /dashboard
```

#### 2. OAuth (Google/LinkedIn)

```
1. Usuário clica em "Continuar com Google/LinkedIn"
2. Redirecionamento para backend (/auth/google ou /auth/linkedin)
3. Backend redireciona para Google/LinkedIn
4. Usuário autoriza
5. Callback do provider para o backend
6. Backend gera JWT e redireciona para /auth/callback?token=...
7. Frontend extrai token, salva e redireciona para /dashboard
```

### Configuração do Backend

O backend NestJS deve estar configurado com:

1. **CORS habilitado** para o frontend:
```typescript
app.enableCors({
  origin: 'http://localhost:4321',
  credentials: true,
});
```

2. **Variáveis de entorno** (backend `.env`):
```env
FRONTEND_URL=http://localhost:4321
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

3. **Callback URLs configuradas nos providers:**
- Google Console: `http://localhost:3000/auth/google/callback`
- LinkedIn Apps: `http://localhost:3000/auth/linkedin/callback`

### Proteção de Rotas

Para proteger uma nova página, adicione o script de verificação:

```typescript
<script>
  import { isAuthenticated, redirectToLogin } from '../utils/auth';

  if (typeof window !== 'undefined' && !isAuthenticated()) {
    redirectToLogin('/sua-pagina');
  }
</script>
```

### Acessar Dados do Usuário

```typescript
import { getProfile } from '../utils/api';
import { getUserFromToken } from '../utils/auth';

// Obter do token (client-side, básico)
const userData = getUserFromToken();

// Obter do backend (completo, requer autenticação)
const profile = await getProfile();
```

### Logout

```typescript
import { logout } from '../utils/auth';

// Remover token e redirecionar para home
logout();
```

### Troubleshooting

**Erro de CORS:**
- Verifique se o backend tem CORS habilitado para `http://localhost:4321`
- Confirme que `PUBLIC_BACKEND_URL` está correto no `.env`

**OAuth não funciona:**
- Verifique se as credenciais estão configuradas no backend
- Confirme que as callback URLs estão corretas nas consoles dos providers
- Verifique se `FRONTEND_URL` no backend aponta para `http://localhost:4321`

**Token não persiste:**
- Verifique se o localStorage está habilitado no navegador
- Abra o DevTools → Application → Local Storage → `http://localhost:4321`
- Deve haver uma chave `token` com o JWT

Para mais detalhes técnicos, consulte [AUTH_FRONTEND.md](./AUTH_FRONTEND.md)

## Licença

Proprietary - VitrinePro V8
