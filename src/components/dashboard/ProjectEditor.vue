<template>
  <DashboardLayout>
    <Toast ref="toast" />
    <ImageAdjustModal
      :visible="showCropModal"
      :image-src="cropSrc"
      :aspect-ratio="16 / 9"
      title="Ajustar imagem de capa"
      @confirm="onCropConfirm"
      @cancel="showCropModal = false"
    />

    <div class="editor-toolbar">
      <div class="editor-toolbar-left">
        <a href="/dashboard/projetos" class="btn btn-ghost btn-sm">
          <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          Projetos
        </a>
        <span class="editor-toolbar-sep">·</span>
        <StatusBadge :status="form.status" />
      </div>
      <div class="editor-toolbar-actions">
        <button class="btn btn-secondary" @click="persist('DRAFT')" :disabled="saving">Salvar rascunho</button>
        <button class="btn btn-primary" @click="persist('PUBLISHED')" :disabled="saving">
          <span v-if="saving" class="spinner spinner-sm" />
          {{ projectId ? 'Atualizar' : 'Publicar' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner spinner-lg" /></div>

    <div v-else class="editor-layout">
      <!-- Main -->
      <div class="editor-main">
        <input v-model="form.title" class="db-input editor-title-input" :class="{ 'input-error': errors.title }" placeholder="Título do projeto *" @input="errors.title = false" />
        <p v-if="errors.title" class="field-error-msg">O título é obrigatório.</p>
        <input v-model="form.subtitle" class="db-input editor-subtitle-input" placeholder="Subtítulo (opcional)" />

        <div class="db-form-group">
          <label class="db-label">Descrição <span>(resumo curto)</span> <span class="required-star">*</span></label>
          <textarea v-model="form.description" class="db-textarea" :class="{ 'input-error': errors.description }" rows="3" placeholder="Descreva brevemente o projeto..." @input="errors.description = false" />
          <p v-if="errors.description" class="field-error-msg">A descrição é obrigatória.</p>
        </div>

        <div>
          <label class="db-label" style="margin-bottom: var(--spacing-xs); display: block;">Conteúdo detalhado <span>(opcional)</span></label>
          <TiptapEditor v-model="form.content" placeholder="Descreva o projeto em detalhes, processo, desafios, resultados..." />
        </div>

        <!-- Gallery -->
        <div class="db-card" v-if="projectUUID">
          <div class="db-card-title">Galeria de imagens</div>
          <ProjectGallery
            :images="gallery"
            :uploading="uploadingImage"
            @add="addImage"
            @delete="removeImage"
            @reorder="reorderImages"
            @caption-change="updateCaption"
          />
        </div>
        <div v-else class="db-card" style="color: var(--text-secondary); font-size: var(--text-sm);">
          Salve o projeto primeiro para adicionar imagens à galeria.
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="editor-sidebar">
        <!-- Cover -->
        <div class="db-card">
          <div class="db-card-title">Imagem de capa</div>
          <div class="img-upload" @click="coverInput?.click()">
            <img v-if="coverPreview || form.coverImageUrl" :src="coverPreview || form.coverImageUrl" class="img-upload-preview" alt="Capa" />
            <div v-else class="img-upload-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
              <span>Clique para adicionar capa</span>
            </div>
            <input ref="coverInput" type="file" accept="image/*" style="display:none" @change="onCoverChange" />
          </div>
        </div>

        <!-- Tags -->
        <div class="db-card">
          <div class="db-card-title">Tags</div>
          <TagSelect :available-tags="allTags" v-model:selected-ids="form.tagIds" @tag-created="onTagCreated" />
        </div>

        <!-- Project meta -->
        <div class="db-card">
          <div class="db-card-title">Detalhes</div>
          <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            <div class="db-form-group">
              <label class="db-label">Status do projeto</label>
              <select v-model="form.projectStatus" class="db-select">
                <option value="">Selecione</option>
                <option value="ONGOING">Em andamento</option>
                <option value="COMPLETED">Concluído</option>
                <option value="PAUSED">Pausado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
            <div class="db-form-group">
              <label class="db-label">Cliente</label>
              <input v-model="form.clientName" class="db-input" placeholder="Nome do cliente" />
            </div>
            <div class="db-form-group">
              <label class="db-label">Ano</label>
              <input v-model.number="form.year" class="db-input" type="number" placeholder="2024" min="1990" :max="new Date().getFullYear()" />
            </div>
            <div class="db-form-group">
              <label class="db-label">Duração</label>
              <input v-model="form.duration" class="db-input" placeholder="Ex: 3 meses" />
            </div>
            <div class="db-form-group">
              <label class="db-label">Meu papel</label>
              <input v-model="form.role" class="db-input" placeholder="Ex: Desenvolvedor Front-end" />
            </div>
            <div class="db-form-group">
              <label class="db-label">Link externo</label>
              <input v-model="form.externalUrl" class="db-input" type="url" placeholder="https://..." />
            </div>
          </div>
        </div>

        <div class="db-card" v-if="projectUUID">
          <div class="db-card-title">Slug</div>
          <div class="db-input-hint" style="font-family: var(--font-mono); font-size: var(--text-xs); word-break: break-all;">{{ form.slug }}</div>
        </div>
      </aside>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Toast from '../ui/Toast.vue';
import StatusBadge from '../ui/StatusBadge.vue';
import TiptapEditor from './TiptapEditor.vue';
import TagSelect from '../ui/TagSelect.vue';
import ProjectGallery from './ProjectGallery.vue';
import ImageAdjustModal from '../ui/ImageAdjustModal.vue';
import {
  getProject, createProject, updateProject, uploadProjectCover,
  getTags, addProjectImage, deleteProjectImage, reorderProjectImages,
} from '../../utils/api';
import type { Tag, ProjectImage } from '../../utils/api';

const props = defineProps<{ projectId?: string }>();

// projectId prop may be a slug — store real UUID separately
const projectUUID = ref<string | undefined>(undefined);

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(!!props.projectId);
const saving = ref(false);
const uploadingImage = ref(false);
const errors = ref({ title: false, description: false });

const coverInput = ref<HTMLInputElement>();
const coverPreview = ref('');
const showCropModal = ref(false);
const cropSrc = ref('');
let pendingCover: File | null = null;

const form = ref({
  title: '',
  subtitle: '',
  description: '',
  content: null as any,
  status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
  projectStatus: '' as string,
  clientName: '',
  year: undefined as number | undefined,
  duration: '',
  role: '',
  externalUrl: '',
  tagIds: [] as string[],
  coverImageUrl: '',
  slug: '',
});

const allTags = ref<Tag[]>([]);
const gallery = ref<ProjectImage[]>([]);

function onCoverChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  cropSrc.value = URL.createObjectURL(file);
  showCropModal.value = true;
  (e.target as HTMLInputElement).value = '';
}

function onCropConfirm(blob: Blob) {
  if (coverPreview.value) URL.revokeObjectURL(coverPreview.value);
  coverPreview.value = URL.createObjectURL(blob);
  pendingCover = new File([blob], 'cover.jpg', { type: blob.type });
  showCropModal.value = false;
  URL.revokeObjectURL(cropSrc.value);
  cropSrc.value = '';
}

function onTagCreated(tag: Tag) { allTags.value.push(tag); }

async function addImage(file: File) {
  if (!projectUUID.value) return;
  const id = projectUUID.value;
  uploadingImage.value = true;
  try {
    const img = await addProjectImage(id, file);
    gallery.value.push(img);
  } catch {
    toast.value?.show('Erro ao adicionar imagem', 'error');
  } finally {
    uploadingImage.value = false;
  }
}

async function removeImage(imageId: string) {
  if (!projectUUID.value) return;
  // Optimistic: remove immediately so the gallery updates without waiting for the API
  const previousGallery = [...gallery.value];
  gallery.value = gallery.value.filter(img => img.id !== imageId);
  try {
    await deleteProjectImage(projectUUID.value, imageId);
  } catch {
    gallery.value = previousGallery; // restore on failure
    toast.value?.show('Erro ao remover imagem', 'error');
  }
}

async function reorderImages(fromIdx: number, toIdx: number) {
  if (!projectUUID.value) return;
  const imgs = [...gallery.value];
  const [moved] = imgs.splice(fromIdx, 1);
  imgs.splice(toIdx, 0, moved);
  gallery.value = imgs;
  try {
    await reorderProjectImages(projectUUID.value, imgs.map((img, i) => ({ id: img.id, order: i })));
  } catch {
    toast.value?.show('Erro ao reordenar imagens', 'error');
  }
}

function updateCaption(imageId: string, caption: string) {
  const img = gallery.value.find(i => i.id === imageId);
  if (img) img.caption = caption;
}

async function persist(status: 'DRAFT' | 'PUBLISHED') {
  errors.value.title = !form.value.title.trim();
  errors.value.description = !form.value.description.trim();
  if (errors.value.title || errors.value.description) {
    toast.value?.show('Preencha os campos obrigatórios', 'warning');
    return;
  }
  if (saving.value) return;
  saving.value = true;
  form.value.status = status;
  try {
    const payload = {
      title: form.value.title,
      subtitle: form.value.subtitle || undefined,
      description: form.value.description,
      content: form.value.content,
      projectStatus: form.value.projectStatus || undefined,
      clientName: form.value.clientName || undefined,
      year: form.value.year || undefined,
      duration: form.value.duration || undefined,
      role: form.value.role || undefined,
      externalUrl: form.value.externalUrl || undefined,
      tagIds: form.value.tagIds,
      status,
    };

    if (projectUUID.value) {
      await updateProject(projectUUID.value, payload);
    } else {
      const created = await createProject(payload);
      projectUUID.value = created.id;
      form.value.slug = created.slug;
      window.history.replaceState({}, '', `/dashboard/projetos/${created.slug}`);
    }

    if (pendingCover && projectUUID.value) {
      const updated = await uploadProjectCover(projectUUID.value, pendingCover);
      form.value.coverImageUrl = updated.coverImageUrl ?? '';
      // Keep coverPreview (blob URL) so the template shows the new image immediately.
      // The blob bypasses the browser cache (server reuses the same URL on replace).
      // onCropConfirm() revokes the previous blob when the user picks a new image.
      pendingCover = null;
    }

    toast.value?.show(status === 'PUBLISHED' ? 'Projeto publicado!' : 'Rascunho salvo!', 'success');
    if (status === 'PUBLISHED') {
      setTimeout(() => { window.location.href = '/dashboard/projetos'; }, 1200);
    }
  } catch (e: any) {
    toast.value?.show(e?.message || 'Erro ao salvar', 'error');
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  try {
    const [tags] = await Promise.all([
      getTags(),
      props.projectId
        ? getProject(props.projectId).then(p => {
            projectUUID.value = p.id;
            form.value.title = p.title;
            form.value.subtitle = p.subtitle ?? '';
            form.value.description = p.description;
            form.value.content = p.content;
            form.value.status = p.status ?? 'DRAFT';
            form.value.projectStatus = p.projectStatus ?? '';
            form.value.clientName = p.clientName ?? '';
            form.value.year = p.year;
            form.value.duration = p.duration ?? '';
            form.value.role = p.role ?? '';
            form.value.externalUrl = p.externalUrl ?? '';
            form.value.tagIds = p.tags.map(t => t.id);
            form.value.coverImageUrl = p.coverImageUrl ?? '';
            form.value.slug = p.slug;
            gallery.value = [...p.images].sort((a, b) => a.order - b.order);
          })
        : Promise.resolve(),
    ]);
    allTags.value = tags;
  } catch {
    toast.value?.show('Erro ao carregar dados', 'error');
  } finally {
    loading.value = false;
  }
});
</script>
