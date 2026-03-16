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
    <ImageAdjustModal
      :visible="showBannerCrop"
      :image-src="cropSrc"
      :aspect-ratio="3"
      title="Ajustar imagem de capa"
      @confirm="onBannerCropConfirm"
      @cancel="showBannerCrop = false"
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
        <!-- Banner -->
        <div class="profile-banner-upload" @click="bannerInput?.click()">
          <img v-if="bannerPreview || form.bannerUrl" :src="bannerPreview || form.bannerUrl" alt="Banner" />
          <div v-else style="width:100%; height:100%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);" />
          <div class="profile-banner-upload-overlay">
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>
            Alterar capa
          </div>
          <input ref="bannerInput" type="file" accept="image/*" style="display:none" @change="onBannerChange" />
        </div>

        <!-- Avatar -->
        <div style="position: relative; padding: 0 var(--spacing-xl) var(--spacing-xl); margin-top: -40px;">
          <div class="profile-avatar-upload" @click="avatarInput?.click()">
            <img v-if="avatarPreview || form.avatarUrl" :src="avatarPreview || form.avatarUrl" alt="Avatar" />
            <span v-else>{{ initials }}</span>
            <div class="profile-avatar-upload-overlay">
              <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /></svg>
            </div>
            <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="onAvatarChange" />
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
              <span class="db-input-prefix-text">vitrinepro.com/perfil/</span>
              <input v-model="form.username" class="db-input" placeholder="seuusuario" />
            </div>
          </div>
          <div class="db-form-group">
            <label class="db-label">Profissão</label>
            <input v-model="form.profession" class="db-input" placeholder="Ex: Desenvolvedor Full Stack" />
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
import { getFullProfile, updateProfile, uploadAvatar, uploadBanner } from '../../utils/api';
import type { FullProfile } from '../../utils/api';

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(true);
const saving = ref(false);

const avatarInput = ref<HTMLInputElement>();
const bannerInput = ref<HTMLInputElement>();
const avatarPreview = ref('');
const bannerPreview = ref('');
const showAvatarCrop = ref(false);
const showBannerCrop = ref(false);
const cropSrc = ref('');
let pendingAvatar: File | null = null;
let pendingBanner: File | null = null;

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
  bannerUrl: '',
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

function onBannerChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  cropSrc.value = URL.createObjectURL(file);
  showBannerCrop.value = true;
  (e.target as HTMLInputElement).value = '';
}

function onBannerCropConfirm(blob: Blob) {
  if (bannerPreview.value) URL.revokeObjectURL(bannerPreview.value);
  bannerPreview.value = URL.createObjectURL(blob);
  pendingBanner = new File([blob], 'banner.jpg', { type: blob.type });
  showBannerCrop.value = false;
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
  form.value.bannerUrl = p.bannerUrl ?? '';
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
  saving.value = true;
  try {
    // Upload images first if changed
    if (pendingAvatar) {
      const updated = await uploadAvatar(pendingAvatar);
      form.value.avatarUrl = updated.avatarUrl ?? '';
      // Keep avatarPreview (blob URL) showing the freshly uploaded image.
      // It will be revoked the next time the user picks a new avatar.
      pendingAvatar = null;
    }
    if (pendingBanner) {
      const updated = await uploadBanner(pendingBanner);
      form.value.bannerUrl = updated.bannerUrl ?? '';
      // Keep bannerPreview (blob URL) showing the freshly uploaded image.
      // Avoids browser-cache returning the old image from the same remote URL.
      pendingBanner = null;
    }
    // Save profile data
    await updateProfile({
      username: form.value.username || undefined,
      profession: form.value.profession || undefined,
      bio: form.value.bio || undefined,
      phone: form.value.phone || undefined,
      website: form.value.website || undefined,
      location: form.value.location || undefined,
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
  } catch {
    toast.value?.show('Erro ao carregar perfil', 'error');
  } finally {
    loading.value = false;
  }
});
</script>
