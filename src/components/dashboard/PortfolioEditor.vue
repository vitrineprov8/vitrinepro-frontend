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
      <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
        <a href="/dashboard/portfolio" class="btn btn-ghost btn-sm">
          <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          Portfólio
        </a>
        <span style="color: var(--text-secondary);">·</span>
        <StatusBadge :status="form.status" />
      </div>
      <div class="editor-toolbar-actions">
        <button class="btn btn-secondary" @click="persist('DRAFT')" :disabled="saving">Salvar rascunho</button>
        <button class="btn btn-primary" @click="persist('PUBLISHED')" :disabled="saving">
          <span v-if="saving" class="spinner spinner-sm" />
          {{ portfolioId ? 'Atualizar' : 'Publicar' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner spinner-lg" /></div>

    <div v-else class="editor-layout">
      <!-- Main -->
      <div class="editor-main">
        <input v-model="form.title" class="db-input editor-title-input" maxlength="40" :class="{ 'input-error': errors.title }" placeholder="Título do item *" @input="errors.title = false" />
        <p v-if="errors.title" class="field-error-msg">O título é obrigatório.</p>
        <input v-model="form.subtitle" class="db-input editor-subtitle-input" maxlength="40" placeholder="Subtítulo (opcional)" />

        <!-- <div class="db-form-group">
          <label class="db-label">Descrição <span>(resumo curto)</span> <span class="required-star">*</span></label>
          <textarea v-model="form.description" class="db-textarea" maxlength="200" :class="{ 'input-error': errors.description }" rows="3" placeholder="Descreva brevemente o item..." @input="errors.description = false" />
          <p v-if="errors.description" class="field-error-msg">A descrição é obrigatória.</p>
        </div> -->

        <div>
          <label class="db-label" style="margin-bottom: var(--spacing-xs); display: block;">Conteúdo detalhado <span>(opcional)</span></label>
          <TiptapEditor v-model="form.content" placeholder="Descreva em detalhes, processo, desafios, resultados..." />
        </div>

        <!-- Gallery -->
        <div class="db-card">
          <div class="db-card-title">Galeria</div>
          <PortfolioGallery
            :files="gallery"
            :pending-files="pendingFiles"
            :uploading="uploadingFile"
            @add="addFile"
            @delete="removeFile"
            @delete-pending="removePendingFile"
            @reorder="reorderFiles"
            @caption-change="updateCaption"
          />
          <p v-if="!portfolioId && pendingFiles.length > 0" style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: var(--spacing-xs);">
            Os arquivos serão enviados ao salvar o item.
          </p>
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

        <!-- Detalhes opcionais -->
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
              <input v-model="form.clientName" class="db-input" maxlength="20" placeholder="Nome do cliente" />
            </div>
            <div class="db-form-group">
              <label class="db-label">Ano</label>
              <input v-model.number="form.year" class="db-input"  type="number" placeholder="2024" min="1990" :max="new Date().getFullYear()" />
            </div>
            <div class="db-form-group">
              <label class="db-label">Duração</label>
              <input v-model="form.duration" class="db-input" maxlength="10" placeholder="Ex: 3 meses" />
            </div>
            <div class="db-form-group">
              <label class="db-label">Meu papel</label>
              <input v-model="form.role" class="db-input" maxlength="20" placeholder="Ex: Desenvolvedor Front-end" />
            </div>
            <div class="db-form-group">
              <label class="db-label">Link externo</label>
              <input v-model="form.externalUrl" class="db-input" type="url" placeholder="https://..." maxlength="40" />
            </div>
          </div>
        </div>

        <div class="db-card" v-if="portfolioId">
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
import PortfolioGallery from './PortfolioGallery.vue';
import type { PendingFile } from './PortfolioGallery.vue';
import ImageAdjustModal from '../ui/ImageAdjustModal.vue';
import {
  getPortfolioItem, createPortfolioItem, updatePortfolioItem, uploadPortfolioCover,
  getTags, addPortfolioFile, deletePortfolioFile, reorderPortfolioFiles,
} from '../../utils/api';
import type { Tag, PortfolioFile } from '../../utils/api';

const props = defineProps<{ portfolioId?: string }>();

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(!!props.portfolioId);
const saving = ref(false);
const uploadingFile = ref(false);
const errors = ref({ title: false });

const coverInput = ref<HTMLInputElement>();
const coverPreview = ref('');
const showCropModal = ref(false);
const cropSrc = ref('');
let pendingCover: File | null = null;

// Real UUID (portfolioId prop may be a slug)
const portfolioId = ref<string | undefined>(undefined);

const form = ref({
  title: '',
  subtitle: '',
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
const gallery = ref<PortfolioFile[]>([]);
const pendingFiles = ref<PendingFile[]>([]);
let pendingIdCounter = 0;

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

async function addFile(file: File) {
  if (portfolioId.value) {
    // Item já existe → upload imediato
    uploadingFile.value = true;
    try {
      const saved = await addPortfolioFile(portfolioId.value, file);
      gallery.value.push(saved);
    } catch {
      toast.value?.show('Erro ao adicionar arquivo', 'error');
    } finally {
      uploadingFile.value = false;
    }
  } else {
    // Item ainda não criado → adicionar como pendente
    const isPdf = file.type === 'application/pdf';
    const order = pendingFiles.value.length + gallery.value.length;
    pendingFiles.value.push({
      id: `pending-${++pendingIdCounter}`,
      file,
      fileUrl: isPdf ? '' : URL.createObjectURL(file),
      fileType: isPdf ? 'PDF' : 'IMAGE',
      caption: '',
      originalFilename: isPdf ? file.name : undefined,
      fileSize: isPdf ? file.size : undefined,
      pending: true,
      order,
    });
  }
}

async function removeFile(fileId: string) {
  if (!portfolioId.value) return;
  const previous = [...gallery.value];
  gallery.value = gallery.value.filter(f => f.id !== fileId);
  try {
    await deletePortfolioFile(portfolioId.value, fileId);
  } catch {
    gallery.value = previous;
    toast.value?.show('Erro ao remover arquivo', 'error');
  }
}

function removePendingFile(pendingId: string) {
  const item = pendingFiles.value.find(f => f.id === pendingId);
  if (item?.fileUrl) URL.revokeObjectURL(item.fileUrl);
  pendingFiles.value = pendingFiles.value.filter(f => f.id !== pendingId);
}

async function reorderFiles(fromIdx: number, toIdx: number) {
  const all = [
    ...gallery.value.map(f => ({ ...f, pending: false as const })),
    ...pendingFiles.value,
  ].sort((a, b) => a.order - b.order);

  const [moved] = all.splice(fromIdx, 1);
  all.splice(toIdx, 0, moved);

  // Update pending files order locally
  pendingFiles.value = pendingFiles.value.map(pf => {
    const newIdx = all.findIndex(x => x.id === pf.id);
    return newIdx !== -1 ? { ...pf, order: newIdx } : pf;
  });

  if (!portfolioId.value) return;

  // Update saved files order via API
  const savedOrders = all
    .filter(f => !(f as any).pending)
    .map((f, i) => ({ id: f.id, order: i }));

  gallery.value = gallery.value.map(f => {
    const newOrder = savedOrders.find(o => o.id === f.id);
    return newOrder ? { ...f, order: newOrder.order } : f;
  });

  try {
    await reorderPortfolioFiles(portfolioId.value, savedOrders);
  } catch {
    toast.value?.show('Erro ao reordenar', 'error');
  }
}

function updateCaption(fileId: string, caption: string) {
  const f = gallery.value.find(f => f.id === fileId);
  if (f) f.caption = caption;
}

async function persist(status: 'DRAFT' | 'PUBLISHED') {
  errors.value.title = !form.value.title.trim();
  if (errors.value.title) {
    toast.value?.show('Preencha o campo obrigatório', 'warning');
    return;
  }
  if (saving.value) return;
  saving.value = true;
  form.value.status = status;
  try {
    const payload = {
      title: form.value.title,
      subtitle: form.value.subtitle || undefined,
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

    if (portfolioId.value) {
      await updatePortfolioItem(portfolioId.value, payload);
    } else {
      const created = await createPortfolioItem(payload);
      portfolioId.value = created.id;
      form.value.slug = created.slug;
      window.history.replaceState({}, '', `/dashboard/portfolio/${created.slug}`);

      // Fazer upload dos arquivos pendentes
      if (pendingFiles.value.length > 0) {
        uploadingFile.value = true;
        try {
          for (const pf of pendingFiles.value) {
            const saved = await addPortfolioFile(portfolioId.value, pf.file, pf.caption || undefined);
            gallery.value.push(saved);
            if (pf.fileUrl) URL.revokeObjectURL(pf.fileUrl);
          }
          pendingFiles.value = [];
        } finally {
          uploadingFile.value = false;
        }
      }
    }

    if (pendingCover && portfolioId.value) {
      const updated = await uploadPortfolioCover(portfolioId.value, pendingCover);
      form.value.coverImageUrl = updated.coverImageUrl ?? '';
      pendingCover = null;
    }

    toast.value?.show(status === 'PUBLISHED' ? 'Item publicado!' : 'Rascunho salvo!', 'success');
    if (status === 'PUBLISHED') {
      setTimeout(() => { window.location.href = '/dashboard/portfolio'; }, 1200);
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
      props.portfolioId
        ? getPortfolioItem(props.portfolioId).then(item => {
            portfolioId.value = item.id;
            form.value.title = item.title;
            form.value.subtitle = item.subtitle ?? '';
            form.value.content = item.content;
            form.value.status = item.status ?? 'DRAFT';
            form.value.projectStatus = item.projectStatus ?? '';
            form.value.clientName = item.clientName ?? '';
            form.value.year = item.year;
            form.value.duration = item.duration ?? '';
            form.value.role = item.role ?? '';
            form.value.externalUrl = item.externalUrl ?? '';
            form.value.tagIds = item.tags.map(t => t.id);
            form.value.coverImageUrl = item.coverImageUrl ?? '';
            form.value.slug = item.slug;
            gallery.value = [...(item.files ?? [])].sort((a, b) => a.order - b.order);
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
