<template>
  <DashboardLayout>
    <Toast ref="toast" />
    <ImageAdjustModal
      :visible="showAvatarCrop"
      :image-src="cropSrc"
      :aspect-ratio="1"
      title="Ajustar foto de perfil"
      @confirm="onAvatarCropConfirm"
      @cancel="showAvatarCrop = false"
    />

    <div class="db-section-header">
      <div>
        <h1 class="db-section-title">Meu Perfil</h1>
        <p class="db-section-subtitle">Edite suas informações públicas</p>
      </div>
      <button class="btn btn-primary" @click="save" :disabled="saving">
        <span v-if="saving" class="spinner spinner-sm" />
        {{ saving ? 'Salvando...' : 'Salvar alterações' }}
      </button>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner spinner-lg" /></div>

    <form v-else @submit.prevent="save">
      <!-- Cover & Avatar -->
      <div class="db-card" style="margin-bottom: var(--spacing-lg); padding: 0;">
        <!-- Banner color preview -->
        <div class="profile-banner-color-preview" :style="bannerPreviewStyle">
          <!-- Avatar overlapping banner bottom -->
          <div class="profile-avatar-upload" @click="avatarInput?.click()">
            <img v-if="avatarPreview || form.avatarUrl" :src="avatarPreview || form.avatarUrl" alt="Avatar" />
            <span v-else>{{ initials }}</span>
            <div class="profile-avatar-upload-overlay">
              <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /></svg>
            </div>
            <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="onAvatarChange" />
          </div>
        </div>
        <div style="padding: 0 var(--spacing-xl) var(--spacing-xl); margin-top: 44px;">
          <div class="db-form-group" style="margin-bottom: 0;">
            <label class="db-label">Cor do banner</label>
            <div class="banner-color-picker">
              <button
                v-for="c in bannerColorPresets"
                :key="c"
                type="button"
                class="banner-color-swatch"
                :style="{ background: c }"
                :class="{ active: form.bannerColor === c }"
                @click="form.bannerColor = c"
                :title="c"
              />
              <label class="banner-color-custom" title="Cor personalizada">
                <input type="color" v-model="form.bannerColor" style="opacity:0;position:absolute;width:0;height:0;" />
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"/></svg>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Info básica -->
      <div class="db-card" style="margin-bottom: var(--spacing-lg);">
        <div class="db-card-title">Informações básicas</div>
        <div class="db-form-row">
          <div class="db-form-group">
            <label class="db-label">Nome</label>
            <input v-model="form.firstName" class="db-input" placeholder="Seu nome" required />
          </div>
          <div class="db-form-group">
            <label class="db-label">Sobrenome</label>
            <input v-model="form.lastName" class="db-input" placeholder="Seu sobrenome" required />
          </div>
          <div class="db-form-group">
            <label class="db-label">Usuário <span>(URL do perfil)</span></label>
            <div class="db-input-prefix">
              <span class="db-url-user">https://www.v8pro.com.br/perfil/{{ form.username }}</span>
              <!-- <input v-model="form.username" class="db-input" placeholder="seuusuario" /> -->
            </div>
          </div>
          <div class="db-form-group">
            <label class="db-label">Profissão</label>
            <input v-model="form.profession" class="db-input" placeholder="Ex: Desenvolvedor Full Stack" />
          </div>
          <div class="db-form-group">
            <label class="db-label">Email</label>
            <div class="db-input-prefix">
              <span class="db-url-user">{{ email }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bio -->
      <div class="db-card" style="margin-bottom: var(--spacing-lg);">
        <div class="db-card-title">Carta de apresentação​</div>
        <div class="db-form-group">
          <label class="db-label">Apresentação <span>(aparece no perfil público)</span></label>
          <textarea v-model="form.bio" maxlength="800" class="db-textarea" rows="4" placeholder="Conte um pouco sobre você, sua experiência e o que você faz..." />
        </div>
      </div>

      <!-- Contato -->
      <div class="db-card" style="margin-bottom: var(--spacing-lg);">
        <div class="db-card-title">Contato e localização</div>
        <div class="db-form-row">
          <div class="db-form-group">
            <label class="db-label">Telefone</label>
            <input
              v-model="form.phone"
              class="db-input"
              placeholder="+55 11 99999-9999"
              type="tel"
              maxlength="20"
              @input="formatPhone"
            />
          </div>
          <div class="db-form-group">
            <label class="db-label">Website</label>
            <input v-model="form.website" class="db-input" placeholder="https://seusite.com" type="url" />
          </div>
          <div class="db-form-group full">
            <label class="db-label">Localização</label>
            <input v-model="form.location" class="db-input" placeholder="Ex: São Paulo, SP – Brasil" />
          </div>
        </div>
      </div>

      <!-- Redes sociais -->
      <div class="db-card">
        <div class="db-card-title">Redes sociais</div>
        <div class="db-form-row">
          <div v-for="net in socialNetworks" :key="net.key" class="db-form-group">
            <label class="db-label">{{ net.label }}</label>
            <div class="db-input-prefix">
              <span class="db-input-prefix-text">{{ net.prefix }}</span>
              <input v-model="form.socialLinks[net.key]" class="db-input" :placeholder="net.placeholder" />
            </div>
          </div>
        </div>
      </div>
    </form>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Toast from '../ui/Toast.vue';
import ImageAdjustModal from '../ui/ImageAdjustModal.vue';
import { getFullProfile, updateProfile, uploadAvatar } from '../../utils/api';
import type { FullProfile } from '../../utils/api';

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(true);
const saving = ref(false);

const avatarInput = ref<HTMLInputElement>();
const avatarPreview = ref('');
const showAvatarCrop = ref(false);
const cropSrc = ref('');
let pendingAvatar: File | null = null;
const email = ref('');

const bannerColorPresets = [
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
  'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
];

const bannerPreviewStyle = computed(() => {
  if (form.value.bannerColor) return { background: form.value.bannerColor };
  return { background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' };
});

const form = ref({
  firstName: '',
  lastName: '',
  username: '',
  profession: '',
  bio: '',
  phone: '',
  website: '',
  location: '',
  avatarUrl: '',
  bannerColor: '',
  socialLinks: {
    linkedin: '', github: '', twitter: '',
    instagram: '', facebook: '', youtube: '', tiktok: '',
  },
});

const initials = computed(() => {
  return `${form.value.firstName[0] ?? ''}${form.value.lastName[0] ?? ''}`.toUpperCase() || '?';
});

const socialNetworks = [
  { key: 'linkedin' as const,  label: 'LinkedIn',  prefix: 'linkedin.com/in/', placeholder: 'seuusuario' },
  { key: 'github' as const,    label: 'GitHub',    prefix: 'github.com/',      placeholder: 'seuusuario' },
  { key: 'twitter' as const,   label: 'Twitter/X', prefix: 'x.com/',           placeholder: 'seuusuario' },
  { key: 'instagram' as const, label: 'Instagram', prefix: 'instagram.com/',   placeholder: 'seuusuario' },
  { key: 'facebook' as const,  label: 'Facebook',  prefix: 'facebook.com/',    placeholder: 'seuusuario' },
  { key: 'youtube' as const,   label: 'YouTube',   prefix: 'youtube.com/@',    placeholder: 'seucanal' },
  { key: 'tiktok' as const,    label: 'TikTok',    prefix: 'tiktok.com/@',     placeholder: 'seuusuario' },
];

function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  cropSrc.value = URL.createObjectURL(file);
  showAvatarCrop.value = true;
  (e.target as HTMLInputElement).value = '';
}

function onAvatarCropConfirm(blob: Blob) {
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value);
  avatarPreview.value = URL.createObjectURL(blob);
  pendingAvatar = new File([blob], 'avatar.jpg', { type: blob.type });
  showAvatarCrop.value = false;
  URL.revokeObjectURL(cropSrc.value);
  cropSrc.value = '';
}

function formatPhone(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^\d+\s\-()]/g, '');
  form.value.phone = raw.slice(0, 20);
}

function fillForm(p: FullProfile) {
  form.value.firstName = p.firstName;
  form.value.lastName = p.lastName;
  form.value.username = p.username ?? '';
  form.value.profession = p.profession ?? '';
  form.value.bio = p.bio ?? '';
  form.value.phone = p.phone ?? '';
  form.value.website = p.website ?? '';
  form.value.location = p.location ?? '';
  form.value.avatarUrl = p.avatarUrl ?? '';
  form.value.bannerColor = (p as any).bannerColor ?? '';
  form.value.socialLinks = {
    linkedin:  p.socialLinks?.linkedin  ?? '',
    github:    p.socialLinks?.github    ?? '',
    twitter:   p.socialLinks?.twitter   ?? '',
    instagram: p.socialLinks?.instagram ?? '',
    facebook:  p.socialLinks?.facebook  ?? '',
    youtube:   p.socialLinks?.youtube   ?? '',
    tiktok:    p.socialLinks?.tiktok    ?? '',
  };
}

async function save() {
  if (saving.value) return;
  saving.value = true;
  try {
    if (pendingAvatar) {
      const updated = await uploadAvatar(pendingAvatar);
      if (updated.avatarUrl) form.value.avatarUrl = updated.avatarUrl;
      pendingAvatar = null;
    }
    await updateProfile({
      username: form.value.username || undefined,
      profession: form.value.profession || undefined,
      bio: form.value.bio || undefined,
      phone: form.value.phone || undefined,
      website: form.value.website || undefined,
      location: form.value.location || undefined,
      bannerColor: form.value.bannerColor || undefined,
      socialLinks: form.value.socialLinks,
    });
    toast.value?.show('Perfil atualizado com sucesso!', 'success');
  } catch (e: any) {
    toast.value?.show(e?.message || 'Erro ao salvar perfil', 'error');
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  try {
    const profile = await getFullProfile();
    fillForm(profile);
    email.value = profile.email;
  } catch {
    toast.value?.show('Erro ao carregar perfil', 'error');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.profile-banner-color-preview {
  width: 100%;
  height: 100px;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  position: relative;
}
.banner-color-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 8px;
}
.banner-color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
  flex-shrink: 0;
}
.banner-color-swatch:hover { transform: scale(1.12); }
.banner-color-swatch.active { border-color: var(--text-primary); transform: scale(1.12); }
.banner-color-custom {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px dashed var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  position: relative;
  transition: border-color 0.15s;
}
.banner-color-custom:hover { border-color: var(--primary); color: var(--primary); }
</style>
