<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  provider: 'google' | 'linkedin';
}

const props = defineProps<Props>();

const backendUrl = 'https://vitrinepro-bakend-production.up.railway.app';

const isLoading = ref(false);

const providerConfig = {
  google: {
    name: 'Google',
    color: '#4285F4',
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.8055 10.2292C19.8055 9.55056 19.75 8.86667 19.6306 8.19445H10.2083V11.9889H15.5889C15.3528 13.2 14.6278 14.2667 13.5694 14.9667V17.2778H16.8222C18.7167 15.5222 19.8055 13.0889 19.8055 10.2292Z" fill="#4285F4"/>
      <path d="M10.2083 19.5C12.7556 19.5 14.8889 18.6556 16.8278 17.2778L13.575 14.9667C12.6861 15.5611 11.5472 15.9 10.2139 15.9C7.75 15.9 5.66667 14.1278 4.88333 11.8H1.51389V14.1833C3.47778 18.0889 6.61667 19.5 10.2083 19.5Z" fill="#34A853"/>
      <path d="M4.87778 11.8C4.41111 10.5889 4.41111 9.41667 4.87778 8.20556V5.82223H1.51389C0.186111 8.46667 0.186111 11.5389 1.51389 14.1833L4.87778 11.8Z" fill="#FBBC04"/>
      <path d="M10.2083 4.1C11.6194 4.07778 13.0056 4.65 14.0361 5.65L16.9167 2.76667C14.7917 0.766667 11.9306 -0.277778 10.2083 -0.244444C6.61667 -0.244444 3.47778 1.16667 1.51389 5.07222L4.87778 7.45556C5.65556 5.12778 7.74444 4.1 10.2083 4.1Z" fill="#EA4335"/>
    </svg>`,
  },
  linkedin: {
    name: 'LinkedIn',
    color: '#0077B5',
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.5195 0H1.47656C0.660156 0 0 0.644531 0 1.44141V18.5547C0 19.3516 0.660156 20 1.47656 20H18.5195C19.3359 20 20 19.3516 20 18.5586V1.44141C20 0.644531 19.3359 0 18.5195 0ZM5.93359 17.043H2.96484V7.49609H5.93359V17.043ZM4.44922 6.19531C3.49609 6.19531 2.72656 5.42578 2.72656 4.47656C2.72656 3.52734 3.49609 2.75781 4.44922 2.75781C5.39844 2.75781 6.16797 3.52734 6.16797 4.47656C6.16797 5.42188 5.39844 6.19531 4.44922 6.19531ZM17.043 17.043H14.0781V12.4023C14.0781 11.2969 14.0586 9.87109 12.5352 9.87109C10.9922 9.87109 10.7578 11.0781 10.7578 12.3242V17.043H7.79297V7.49609H10.6406V8.80078H10.6797C11.0742 8.05078 12.043 7.25781 13.4844 7.25781C16.4883 7.25781 17.043 9.23438 17.043 11.8047V17.043Z" fill="white"/>
    </svg>`,
  },
};

const config = providerConfig[props.provider];

function handleOAuthLogin() {
  isLoading.value = true;
  window.location.href = `${backendUrl}/auth/${props.provider}`;
}
</script>

<template>
  <button
    @click="handleOAuthLogin"
    :disabled="isLoading"
    class="btn-oauth"
    :class="`btn-oauth-${provider}`"
    type="button"
  >
    <span class="btn-oauth-icon" v-html="config.icon"></span>
    <span class="btn-oauth-text">
      {{ isLoading ? 'Redirecionando...' : `Continuar com ${config.name}` }}
    </span>
  </button>
</template>

<style scoped>
.btn-oauth {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  color: white;
  font-family: var(--font-sans);
}

.btn-oauth:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-oauth:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-oauth:not(:disabled):active {
  transform: translateY(0);
}

.btn-oauth-google {
  background-color: #4285F4;
}

.btn-oauth-google:not(:disabled):hover {
  background-color: #357ae8;
}

.btn-oauth-linkedin {
  background-color: #0077B5;
}

.btn-oauth-linkedin:not(:disabled):hover {
  background-color: #006399;
}

.btn-oauth-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.btn-oauth-text {
  flex: 1;
  text-align: center;
}
</style>
