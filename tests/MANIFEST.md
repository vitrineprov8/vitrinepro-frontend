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
| `src/components/dashboard/VagaEditor.vue` | *(sem teste E2E dedicado ainda)* | — |
| `src/components/dashboard/VagasAdminList.vue` | *(sem teste E2E dedicado ainda)* | — |
| `src/components/dashboard/PlansPage.vue` | *(sem teste E2E dedicado ainda)* | — |
| `src/components/dashboard/CandidatePipeline.vue` | *(sem teste E2E dedicado ainda — ver notas Task #9 abaixo)* | `dashboard` |
| `src/components/dashboard/PipelineSettingsModal.vue` | *(novo — sem teste E2E dedicado ainda — ver notas Task #9 abaixo)* | `dashboard` |
| `src/components/dashboard/CandidateDrawer.vue` | *(sem teste E2E dedicado ainda)* | `dashboard` |
| `src/components/dashboard/TeamMembersList.vue` | *(novo Task #11 — sem teste E2E dedicado ainda)* | `dashboard` |
| `src/components/dashboard/ClientsList.vue` | *(novo Task #11 — sem teste E2E dedicado ainda)* | `dashboard` |
| `src/components/dashboard/ClientEditorModal.vue` | *(novo Task #11 — sem teste E2E dedicado ainda)* | `dashboard` |
| `src/components/dashboard/PipelineOverviewCard.vue` | *(novo Task #12 — sem teste E2E dedicado ainda)* | `dashboard` |
| `src/components/dashboard/RecentActivityFeed.vue` | *(novo Task #12 — sem teste E2E dedicado ainda)* | `dashboard` |
| `src/pages/dashboard/vagas.astro` (redirect) | *(verificação manual — redireciona para `/dashboard/recrutador/pessoal`)* | — |
| `src/pages/dashboard/minhas-candidaturas.astro` (redirect) | *(verificação manual — redireciona para `/dashboard/recrutador/pessoal`)* | — |
| `src/pages/dashboard/planos.astro` (redirect) | *(verificação manual — redireciona para `/dashboard/recrutador/pessoal?tab=planos`)* | — |
| `src/components/dashboard/ContextDropdown.vue` | *(Fase A URL-based — sem teste E2E dedicado ainda)* | `dashboard` |
| `src/components/dashboard/HunterPessoalWorkspace.vue` | *(Fase A — sem teste E2E dedicado ainda)* | `dashboard` |
| `src/components/dashboard/HunterTimeWorkspace.vue` | *(Fase A — sem teste E2E dedicado ainda)* | `dashboard` |
| `src/components/dashboard/HunterShell.vue` | *(Fase A — wrapper sem lógica própria)* | — |
| `src/pages/dashboard/recrutador/pessoal.astro` | *(Fase A — renomeado de hunter/pessoal)* | — |
| `src/pages/dashboard/recrutador/time/[teamId].astro` | *(Fase A — SSR, prerender=false; renomeado de hunter/time)* | — |
| `src/pages/dashboard/recrutador/time/[teamId]/membros.astro` | *(Fase A — SSR; renomeado de hunter/time)* | — |
| `src/pages/dashboard/recrutador/time/[teamId]/clientes.astro` | *(Fase A — SSR; renomeado de hunter/time)* | — |
| `src/components/ui/Toast.vue` | Todos | — |
| `src/components/ui/ConfirmDialog.vue` | portfolio, curriculos, tags, formacao, vagas | — |
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

### VagaEditor
- `draft-btn` *(ausente — botão "Salvar rascunho" é o submit do form, sem data-testid ainda)*
- `publish-btn` *(ausente — botão "Publicar vaga", disabled quando limite atingido)*
- Nota: o botão "Publicar" abre um ConfirmDialog antes de chamar POST /vagas/:id/publish

### VagasAdminList
- Botão "Publicar" — aparece em vagas com status DRAFT (abre ConfirmDialog)
- Botão "Republicar" — aparece em vagas com status CLOSED (abre ConfirmDialog)
- Botão "Encerrar" — aparece em vagas com status PUBLISHED (chama unpublishVaga diretamente)
- Contador de uso — `.db-section-subtitle` mostra "Vagas publicadas este mês: X / Y"

### CandidatePipeline (Task #9)

Comportamento alterado:
- On mount: chama `GET /me/pipeline-template`; usa stages da API como colunas do kanban. Fallback para `VISIBLE_STAGES` do mock se o endpoint falhar.
- `onDrop`: chama `PATCH /applications/:id/status` com `{ pipelineStage, isRejected }`. Optimistic UI; reverte em erro.
- "Configurar etapas" (`.cp-btn-settings`): abre `PipelineSettingsModal`. Desabilitado enquanto `loadingStages === true`.
- Após `saved(newStages)` do modal: atualiza `allStages` local sem re-fetch.
- `advanceStage` e `rejectCandidate` também chamam `updateApplicationStatus`.

Testes E2E necessários (não escritos ainda):
- [ ] Colunas refletem stages da API após mount
- [ ] Drag entre colunas dispara PATCH com body correto
- [ ] Falha de PATCH reverte card à coluna original
- [ ] Botão "Configurar etapas" abre modal

### PipelineSettingsModal (Task #9 — NOVO)

Props: `visible: boolean`, `stages: PipelineStage[]`
Emits: `update:visible`, `saved(newStages)`, `cancel`

Comportamento:
- Abre com cópia dos stages; rejected sempre ao final, não removível.
- Drag-handle nativo HTML5 para reordenar etapas não-rejected.
- Remover etapa mostra `ConfirmDialog` antes de remover.
- Label da etapa rejected é editável; `id` e `isRejected: true` são fixos.
- Validações: ≥1 etapa não-rejected, labels não vazios.
- Save guard (`if (saving.value) return`), flag em `finally`.
- Chama `PATCH /me/pipeline-template`; emite `saved` em sucesso.

Testes E2E necessários (não escritos ainda):
- [ ] Renomear etapa → salvar → PATCH com label atualizado
- [ ] Adicionar etapa → salvar → nova etapa aparece no kanban
- [ ] Remover etapa → ConfirmDialog → confirmar → etapa removida
- [ ] Etapa rejected não tem botão de remover
- [ ] Label vazio bloqueia save com mensagem de erro
- [ ] 0 etapas não-rejected bloqueia save

### VagasMetrics (Task #12 — atualizado)

Mudanças:
- Grid mudado de `repeat(4, 1fr)` para `auto-fill minmax(160px, 1fr)` — suporta 5 cards sem layout quebrado.
- Para TEAM/ENTERPRISE: 5 cards (Publicadas / Em análise / Entrevistas / Contratados / Conversão).
- Para FREE/RECRUITER: 4 cards (sem card de Conversão).
- Taxa de conversão = contratados / total de candidatos, em percentagem.

### RecrutadorWorkspace (Task #10 + #12 — atualizado)

Comportamento adicionado:
- Em `onMounted`: lê `new URLSearchParams(window.location.search).get('tab')`.
- Mapeamento: `carreira` → `'carreira'`, `publicar` → `'vagas'`, `servicos` → `'servicos'`.
- Se o valor do param não existe no mapa, a aba padrão `'vagas'` é mantida.
- Aba "Carreira" exibe 4 atalhos de navegação (Currículos / Publicações / Perfil / Formação).

Testes E2E necessários (não escritos ainda):
- [ ] Navegar para `/dashboard/recrutador/pessoal?tab=carreira` → aba "Carreira" ativa ao montar
- [ ] Navegar para `/dashboard/recrutador/pessoal?tab=publicar` → aba "Publicar vagas" ativa ao montar
- [ ] Navegar para `/dashboard/recrutador/pessoal?tab=servicos` → aba "Solicitar serviços" ativa ao montar
- [ ] Param desconhecido ou ausente → aba padrão "Publicar vagas" ativa

Mudanças Task #12:
- Sub-aba "Vagas" para TEAM/ENTERPRISE: layout duas colunas (`.rw-two-col`) — lista de vagas à esquerda, sidebar com `PipelineOverviewCard` + `RecentActivityFeed` à direita.
- Para FREE/RECRUITER: layout coluna única (`.rw-one-col`), sem sidebar.
- 5º card KPI "Conversão" apenas para TEAM/ENTERPRISE (calculado como contratados/total_candidatos %).

### PipelineOverviewCard (Task #12 — NOVO)

Props: nenhum (autônomo, faz fetch próprio)
Comportamento:
- On mount: (1) chama `GET /me/pipeline-template`; (2) chama `GET /vagas/me?limit=10&status=PUBLISHED`; (3) fetch paralelo de `GET /vagas/:id/applications` para vagas com `applicationsCount > 0`; (4) agrega contagem por `pipelineStage`.
- Mostra barra horizontal proporcional ao `maxCount`.
- Candidatos rejeitados (`isRejected: true`) são excluídos da contagem.
- Hint: "Agregado das N vagas mais recentes".
- Loading: skeleton animado de 5 linhas.
- Erro: card de erro com mensagem em PT-BR.
- Footer: link placeholder "Ver detalhes (em breve)".

Testes E2E necessários (não escritos ainda):
- [ ] Loading skeleton visível durante fetch
- [ ] Barras renderizadas após fetch
- [ ] Estado vazio quando sem candidaturas

### RecentActivityFeed (Task #12 — NOVO)

Props: nenhum (autônomo, faz fetch próprio)
Comportamento:
- On mount: mesma estratégia do PipelineOverviewCard (vagas + aplicações paralelas).
- Ordena todas as aplicações por `createdAt` desc; exibe top 10.
- Cada item: avatar (foto ou iniciais coloridas via `avatarColor()`), nome, "se inscreveu em {vagaTitle}", tempo relativo via `Intl.RelativeTimeFormat('pt-BR')`.
- Avatar com `loading="lazy"` e dimensões explícitas (32×32).
- Loading: skeleton animado.
- Erro: mensagem em PT-BR.

Testes E2E necessários (não escritos ainda):
- [ ] Loading skeleton visível durante fetch
- [ ] Lista de candidatos após fetch
- [ ] Estado vazio quando sem candidaturas

### TeamMembersList (Task #11 — NOVO)

Props: nenhum (componente autônomo)
Comportamento:
- On mount: chama `GET /me/team/members`.
- "+ Novo membro": abre Modal com form (email + role MANAGER|RECRUITER) → `POST /me/team/invite`.
- 403 em invite: Toast com mensagem de limite de seats em PT-BR.
- Alterar role: `PATCH /me/team/members/:id { role }` — select inline.
- OWNER não tem select de role nem botão remover.
- Remover: ConfirmDialog → `DELETE /me/team/members/:id`.
- Visível apenas quando `user.plan === 'TEAM' || 'ENTERPRISE'` (gated em RecrutadorWorkspace).

### ClientsList / ClientEditorModal (Task #11 — NOVO)

ClientsList comportamento:
- On mount: chama `GET /companies`.
- "+ Novo cliente": abre ClientEditorModal em modo create.
- Click no card: abre ClientEditorModal em modo edit.
- Excluir: ConfirmDialog → `DELETE /companies/:id`.

ClientEditorModal comportamento:
- Upload de logo: file input → `URL.createObjectURL` → `ImageAdjustModal` (aspect 1:1) → blob → `POST /uploads/image` → salva URL.
- Create: `POST /companies { name, logoUrl?, industry?, description? }`.
- Edit: `PATCH /companies/:id { ... }`.
- Save guard ativo; cleanup de blob URLs em `handleClose`.

### VagaEditor (Task #11 — atualizado)

Mudanças:
- Carrega `getMyPlan()` no `onMounted`; se TEAM/ENTERPRISE, carrega `GET /companies`.
- Exibe select "Cliente" no formulário apenas para TEAM/ENTERPRISE.
- `buildPayload()` inclui `companyId` (string|null) se TEAM/ENTERPRISE.
- `companyId` enviado no body do `createVaga`/`updateVaga` — backend aceita o campo se suportado.

### VagasAdminList (Task #11 — atualizado)

Mudanças:
- Carrega `getMyPlan()` em `onMounted`.
- Exibe nome do cliente (`v.company?.name`) inline em todas as vagas (para todos os planos).
- Exibe chip de "Responsável" + botão "Atribuir responsável" apenas para TEAM/ENTERPRISE.
- Click em "Atribuir" abre Modal com lista de membros (fetch lazy de `GET /me/team/members`).
- Selecionar membro chama `PATCH /vagas/:id/assign { userId }`.
- "Remover atribuição" chama `PATCH /vagas/:id/assign { userId: null }`.

### Redirects das rotas legadas (Task #10 + rename Fase B)

- `GET /dashboard/vagas` → 302 `/dashboard/recrutador/pessoal`
- `GET /dashboard/minhas-candidaturas` → 302 `/dashboard/recrutador/pessoal`
- `GET /dashboard/planos` → 302 `/dashboard/recrutador/pessoal?tab=planos`
- `GET /dashboard/profissional` → 302 `/dashboard/candidato` (via dashboard.astro)
- `GET /dashboard/hunter/pessoal` → 302 `/dashboard/recrutador/pessoal` (via dashboard.astro / vagas.astro)

### CandidateDrawer

Comportamento alterado (Task #9):
- `stages` prop agora é `PipelineStage[]` de `api.ts` (antes era `PipelineStage[]` do mock).
- `stageLabel` derivado de `stages.find(s => s.id === candidate.stage)?.label` em vez do `STAGE_LABELS` estático.
- `canAdvance` baseado em visibleStages filtrados e ordenados por `order`.

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
