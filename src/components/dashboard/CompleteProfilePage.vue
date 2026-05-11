<template>
  <DashboardLayout>
    <Toast ref="toast" />

    <div class="db-section-header">
      <div>
        <h1 class="db-section-title">Completar perfil</h1>
        <p class="db-section-subtitle">Preencha os dados para aproveitar ao máximo a plataforma</p>
      </div>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner spinner-lg" /></div>

    <div v-else class="complete-profile-layout">
      <div class="checkout-card">
        <form class="complete-form" @submit.prevent="save">
          <div class="complete-form-grid">
            <label class="db-field">
              <span class="db-label">Nome *</span>
              <input v-model="form.firstName" type="text" required class="db-input" />
            </label>
            <label class="db-field">
              <span class="db-label">Sobrenome *</span>
              <input v-model="form.lastName" type="text" required class="db-input" />
            </label>
            <label class="db-field">
              <span class="db-label">Profissão</span>
              <input v-model="form.profession" type="text" class="db-input" placeholder="Ex: Desenvolvedor Full-Stack" />
            </label>
            <div class="db-field">
              <label class="db-label">Telefone</label>
              <input
                v-model="form.phone"
                data-testid="phone-input"
                class="db-input"
                :class="{ 'db-input-error': phoneInvalid }"
                placeholder="(11) 99999-9999"
                type="tel"
                maxlength="20"
                @input="formatPhone"
              />
              <small v-if="phoneInvalid" class="db-field-error">
                Telefone inválido. Use (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX.
              </small>
            </div>
            <div class="db-field complete-field--full">
              <label class="db-label">Cidade / Estado</label>
              <CitySelect
                ref="citySelectRef"
                v-model="form.location"
                placeholder="Buscar cidade..."
              />
            </div>
          </div>

          <div class="complete-form-actions">
            <a href="/dashboard" class="btn btn-ghost">Pular por agora</a>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Salvando...' : 'Salvar e continuar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Toast from '../ui/Toast.vue';
import CitySelect from '../ui/CitySelect.vue';
import { getFullProfile, updateProfile } from '../../utils/api';
import { isAuthenticated, redirectToLogin } from '../../utils/auth';
import { formatBrazilPhone, isValidBrazilPhone } from '../../utils/phone';

const toast = ref<InstanceType<typeof Toast>>();
const citySelectRef = ref<InstanceType<typeof CitySelect>>();
const loading = ref(true);
const saving = ref(false);

const form = reactive({
  firstName: '',
  lastName: '',
  profession: '',
  phone: '',
  location: '',
});

function formatPhone(e: Event) {
  form.phone = formatBrazilPhone((e.target as HTMLInputElement).value);
}

const phoneInvalid = computed(
  () => !!form.phone && !isValidBrazilPhone(form.phone),
);

async function save() {
  if (saving.value) return;
  if (!form.firstName.trim() || !form.lastName.trim()) {
    toast.value?.show('Nome e sobrenome são obrigatórios', 'error');
    return;
  }
  if (phoneInvalid.value) {
    toast.value?.show('Informe um telefone brasileiro válido.', 'error');
    return;
  }
  if (form.location && citySelectRef.value && !citySelectRef.value.isValid) {
    toast.value?.show('Selecione uma cidade válida da lista antes de salvar.', 'error');
    return;
  }
  saving.value = true;
  try {
    await updateProfile({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      profession: form.profession.trim() || null,
      phone: form.phone.trim() || null,
      location: form.location.trim() || null,
    });
    toast.value?.show('Perfil atualizado com sucesso!', 'success');
    setTimeout(() => { window.location.href = '/dashboard'; }, 800);
  } catch {
    toast.value?.show('Erro ao salvar perfil. Tente novamente.', 'error');
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  if (!isAuthenticated()) {
    redirectToLogin(window.location.pathname);
    return;
  }
  try {
    const profile = await getFullProfile();
    form.firstName = profile.firstName ?? '';
    form.lastName = profile.lastName ?? '';
    form.profession = profile.profession ?? '';
    form.phone = profile.phone ?? '';
    form.location = profile.location ?? '';
  } catch {
    toast.value?.show('Erro ao carregar perfil', 'error');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.complete-profile-layout {
  max-width: 560px;
}
.checkout-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg, 12px);
  padding: 1.5rem;
  background: var(--bg-primary);
}
.complete-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}
.complete-field--full {
  grid-column: 1 / -1;
}
.complete-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
}
</style>
