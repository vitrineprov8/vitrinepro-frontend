# Mapa de Testes E2E — VitrinePro

Quando a IA modifica um componente, ela deve:
1. Consultar a tabela abaixo para encontrar o arquivo de teste correspondente
2. Atualizar os `data-testid` no componente se mudar a estrutura HTML
3. Atualizar os casos de teste se mudar o comportamento
4. Rodar `npm run test:e2e -- --project=<projeto>` para verificar

---

## Componente → Arquivo de Teste

| Componente / Feature | Arquivo de Teste | Projeto Playwright |
|---|---|---|
| `src/pages/login.astro`, AuthForm | `tests/e2e/login.spec.ts` | `public` |
| `src/components/search/SearchBox.vue` | `tests/e2e/vitrine.spec.ts` | `public` |
| `src/components/search/SearchPage.vue` | `tests/e2e/vitrine.spec.ts` | `public` |
| `src/components/search/SearchResults.vue` | `tests/e2e/vitrine.spec.ts` | `public` |
| `src/components/search/SearchFilters.vue` | `tests/e2e/vitrine.spec.ts` | `public` |
| `src/components/profile/PublicProfilePage.vue` | *(sem teste E2E dedicado ainda)* | — |
| `src/components/dashboard/ProfileEditor.vue` | `tests/e2e/dashboard-perfil.spec.ts` | `dashboard` |
| `src/components/dashboard/PortfolioEditor.vue` | `tests/e2e/dashboard-portfolio.spec.ts` | `dashboard` |
| `src/components/dashboard/PortfolioList.vue` | `tests/e2e/dashboard-portfolio.spec.ts` | `dashboard` |
| `src/components/dashboard/CVManager.vue` | `tests/e2e/dashboard-curriculos.spec.ts` | `dashboard` |
| `src/components/dashboard/TagManager.vue` | `tests/e2e/dashboard-tags.spec.ts` | `dashboard` |
| `src/components/dashboard/EducationManager.vue` | `tests/e2e/dashboard-formacao.spec.ts` | `dashboard` |
| `src/components/ui/Toast.vue` | Todos | — |
| `src/components/ui/ConfirmDialog.vue` | portfolio, curriculos, tags, formacao | — |
| `src/utils/auth.ts` | `tests/e2e/login.spec.ts` + `tests/setup/auth.setup.ts` | — |

---

## data-testid Inventory

Lista completa dos `data-testid` em uso. Ao renomear um elemento, atualize aqui e no teste.

### Login
- `email-input` — input de email
- `password-input` — input de senha
- `login-btn` — botão de submit

### Busca (SearchBox / SearchPage / SearchFilters)
- `search-input` — campo de texto da busca
- `search-btn` — botão "Buscar"
- `results-container` — wrapper dos resultados
- `result-card` — cada card de resultado (+ `data-type="profile|portfolio|service"`)
- `popular-tag` — tag clicável na área de sugestões
- `filter-todas` — botão filtro "TODAS"
- `filter-especialidades` — botão filtro "Especialidades"
- `filter-projetos` — botão filtro "Projetos"
- `filter-servicos` — botão filtro "Serviços"

### ProfileEditor
- `profession-input` — campo de profissão
- `phone-input` — campo de telefone
- `save-profile-btn` — botão salvar perfil

### PortfolioEditor / PortfolioList
- `title-input` — campo título da publicação
- `publish-btn` — botão publicar
- `draft-btn` — botão salvar rascunho
- `service-toggle` — toggle "Ofertar Serviço"
- `duration-input` — campo duração (dias)
- `duration-error` — mensagem de erro de duração > 30
- `portfolio-item` — cada item na lista
- `edit-portfolio-btn` — botão editar (dentro de portfolio-item)
- `delete-portfolio-btn` — botão excluir (dentro de portfolio-item)

### CVManager
- `cv-upload-input` — input file para upload
- `cv-item` — cada currículo na lista
- `cv-delete-btn` — botão excluir (dentro de cv-item)

### TagManager
- `tag-input` — campo para nova tag
- `tag-save-btn` — botão salvar tag
- `tag-item` — cada tag na lista
- `tag-delete-btn` — botão excluir (dentro de tag-item)

### EducationManager
- `add-education-btn` — botão "Adicionar formação"
- `save-education-btn` — botão salvar no modal
- `edu-item` — cada item de formação na lista
- `edu-delete-btn` — botão excluir (dentro de edu-item)

### UI Compartilhado
- `toast` — componente Toast.vue
- `confirm-ok-btn` — botão confirmar no ConfirmDialog.vue

---

## Como rodar

```bash
# Todos os testes (precisa de dev server + backend rodando)
npm run test:e2e

# Só busca
npx playwright test vitrine --project=public

# Só dashboard
npx playwright test dashboard --project=dashboard

# Com interface visual (debug)
npm run test:e2e:ui

# Relatório HTML
npm run test:e2e:report
```
