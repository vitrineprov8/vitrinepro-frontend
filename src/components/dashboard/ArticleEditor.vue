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

    <!-- Toolbar -->
    <div class="editor-toolbar">
      <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
        <a href="/dashboard/artigos" class="btn btn-ghost btn-sm">
          <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          Artigos
        </a>
        <span style="color: var(--text-secondary);">·</span>
        <StatusBadge :status="form.status" />
        <span v-if="lastSaved" style="font-size: var(--text-xs); color: var(--text-secondary);">Auto-salvo {{ lastSaved }}</span>
      </div>
      <div class="editor-toolbar-actions">
        <button class="btn btn-secondary" @click="saveDraft" :disabled="saving">
          {{ saving && form.status === 'DRAFT' ? 'Salvando...' : 'Salvar rascunho' }}
        </button>
        <button class="btn btn-primary" @click="publish" :disabled="saving">
          <span v-if="saving && form.status === 'PUBLISHED'" class="spinner spinner-sm" />
          {{ articleId ? 'Atualizar' : 'Publicar' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner spinner-lg" /></div>

    <div v-else class="editor-layout">
      <!-- Editor main -->
      <div class="editor-main">
        <input
          v-model="form.title"
          class="db-input editor-title-input"
          :class="{ 'input-error': errors.title }"
          placeholder="Título do artigo *"
          @input="errors.title = false"
        />
        <p v-if="errors.title" class="field-error-msg">O título é obrigatório para publicar.</p>
        <input
          v-model="form.subtitle"
          class="db-input editor-subtitle-input"
          placeholder="Subtítulo (opcional)"
        />
        <TiptapEditor
          v-model="form.content"
          placeholder="Escreva o conteúdo do artigo..."
        />
        <div class="db-form-group">
          <label class="db-label">Conclusão <span>(opcional)</span></label>
          <textarea v-model="form.conclusion" class="db-textarea" rows="3" placeholder="Uma observação ou chamada para ação ao final do artigo..." />
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
              <span style="font-size: var(--text-xs); color: var(--text-light);">JPG, PNG ou WebP · máx 8MB</span>
            </div>
            <input ref="coverInput" type="file" accept="image/*" style="display:none" @change="onCoverChange" />
          </div>
        </div>

        <!-- Tags -->
        <div class="db-card">
          <div class="db-card-title">Tags</div>
          <TagSelect
            :available-tags="allTags"
            v-model:selected-ids="form.tagIds"
            @tag-created="onTagCreated"
          />
        </div>

        <!-- Slug -->
        <div class="db-card" v-if="articleUUID">
          <div class="db-card-title">Slug</div>
          <div class="db-input-hint" style="font-family: var(--font-mono); font-size: var(--text-xs); word-break: break-all;">{{ form.slug }}</div>
        </div>
      </aside>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Toast from '../ui/Toast.vue';
import StatusBadge from '../ui/StatusBadge.vue';
import TiptapEditor from './TiptapEditor.vue';
import TagSelect from '../ui/TagSelect.vue';
import ImageAdjustModal from '../ui/ImageAdjustModal.vue';
import {
  getArticle, createArticle, updateArticle, uploadArticleCover, getTags,
} from '../../utils/api';
import type { Tag } from '../../utils/api';

const props = defineProps<{ articleId?: string }>();

// articleId prop may be a slug (from edit URL) — we store the real UUID separately
const articleUUID = ref<string | undefined>(undefined);

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(!!props.articleId);
const saving = ref(false);
const lastSaved = ref('');
const errors = ref({ title: false });

const coverInput = ref<HTMLInputElement>();
const coverPreview = ref('');
const showCropModal = ref(false);
const cropSrc = ref('');
let pendingCover: File | null = null;
let autoSaveTimer: ReturnType<typeof setInterval>;

const form = ref({
  title: '',
  subtitle: '',
  content: null as any,
  conclusion: '',
  status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
  tagIds: [] as string[],
  coverImageUrl: '',
  slug: '',
});

const allTags = ref<Tag[]>([]);

function onCoverChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  cropSrc.value = URL.createObjectURL(file);
  showCropModal.value = true;
  // Reset input so the same file can be selected again
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

function onTagCreated(tag: Tag) {
  allTags.value.push(tag);
}

async function persist(status: 'DRAFT' | 'PUBLISHED') {
  if (saving.value) return;
  // Validate required fields
  errors.value.title = !form.value.title.trim();
  if (errors.value.title) {
    toast.value?.show('O título é obrigatório', 'warning');
    return;
  }
  saving.value = true;
  form.value.status = status;
  try {
    const payload = {
      title: form.value.title,
      subtitle: form.value.subtitle || undefined,
      content: form.value.content,
      conclusion: form.value.conclusion || undefined,
      tagIds: form.value.tagIds,
      status,
    };

    if (articleUUID.value) {
      await updateArticle(articleUUID.value, payload);
    } else {
      const created = await createArticle(payload);
      articleUUID.value = created.id;
      form.value.slug = created.slug;
      // Redirect using slug so URL stays consistent
      window.history.replaceState({}, '', `/dashboard/artigos/${created.slug}`);
    }

    // Upload cover if pending
    if (pendingCover && articleUUID.value) {
      const updated = await uploadArticleCover(articleUUID.value, pendingCover);
      form.value.coverImageUrl = updated.coverImageUrl ?? '';
      // Keep coverPreview (blob URL) so the template shows the new image immediately.
      // The blob bypasses the browser cache that would otherwise serve the old image
      // (the server reuses the same URL when replacing a cover).
      // onCropConfirm() revokes the previous blob when the user picks a new image.
      pendingCover = null;
    }

    const now = new Date();
    lastSaved.value = `às ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    toast.value?.show(status === 'PUBLISHED' ? 'Artigo publicado!' : 'Rascunho salvo!', 'success');

    if (status === 'PUBLISHED') {
      setTimeout(() => { window.location.href = '/dashboard/artigos'; }, 1200);
    }
  } catch (e: any) {
    toast.value?.show(e?.message || 'Erro ao salvar', 'error');
  } finally {
    saving.value = false;
  }
}

const saveDraft = () => persist('DRAFT');
const publish  = () => persist('PUBLISHED');

onMounted(async () => {
  try {
    const [tags] = await Promise.all([
      getTags(),
      props.articleId
        ? getArticle(props.articleId).then(a => {
            articleUUID.value = a.id;
            form.value.title = a.title;
            form.value.subtitle = a.subtitle ?? '';
            form.value.content = a.content;
            form.value.conclusion = a.conclusion ?? '';
            form.value.status = a.status ?? 'DRAFT';
            form.value.tagIds = a.tags.map(t => t.id);
            form.value.coverImageUrl = a.coverImageUrl ?? '';
            form.value.slug = a.slug;
          })
        : Promise.resolve(),
    ]);
    allTags.value = tags;
  } catch {
    toast.value?.show('Erro ao carregar dados', 'error');
  } finally {
    loading.value = false;
  }

  // Auto-save every 30s
  autoSaveTimer = setInterval(() => {
    if (articleUUID.value && form.value.title) saveDraft();
  }, 30_000);
});

onBeforeUnmount(() => clearInterval(autoSaveTimer));
</script>
