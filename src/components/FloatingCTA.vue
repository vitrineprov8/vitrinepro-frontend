<template>
  <div :class="[$style.floatingCTA, { [$style.visible]: isVisible }]">
    <div class="container">
      <div :class="$style.content">
        <button :class="$style.closeButton" @click="hide" aria-label="Recolher">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 10l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <div :class="$style.text">
          <h3 :class="$style.title">Centralize Toda Sua Experiência</h3>
          <p :class="$style.description">
            É comum ter sua experiência profissional dispersa em documentos, planilhas e memórias.
            Com VitrinePro, você reúne tudo em um único lugar, pronto para impressionar o mundo.
          </p>
        </div>

        <a href="/signup" :class="$style.button" class="btn btn-accent">
          Quero Meu Portfólio Profissional
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isVisible = ref(false);
const isHidden = ref(false);

const handleScroll = () => {
  if (isHidden.value) return;

  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;

  const footer = document.querySelector('footer');

  if (footer) {
    const footerRect = footer.getBoundingClientRect();
    const footerTop = footerRect.top + window.scrollY;
    const viewportBottom = scrollPosition + windowHeight;

    // Esconder quando o footer estiver visível na tela
    if (viewportBottom >= footerTop) {
      isVisible.value = false;
      return;
    }
  }

  // Mostrar após rolar 300px (e enquanto não estiver no footer)
  if (scrollPosition > 300) {
    isVisible.value = true;
  } else {
    isVisible.value = false;
  }
};

const hide = () => {
  isVisible.value = false;
  isHidden.value = true;

  // Permitir mostrar novamente após 30 segundos
  setTimeout(() => {
    isHidden.value = false;
  }, 30000);
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Check initial position
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style module>
.floatingCTA {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-fixed);
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(100%);
  opacity: 0;
  transition: all var(--transition-slow);
  padding: var(--spacing-lg) 0;
}

.floatingCTA.visible {
  transform: translateY(0);
  opacity: 1;
}

.content {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  position: relative;
}

.closeButton {
  position: absolute;
  top: -12px;
  right: 8px;
  width: auto;
  height: auto;
  padding: 0;
  background-color: transparent;
  border-radius: 0;
  color: white;
  border: none;
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-fast);
  flex-shrink: 0;
}

.closeButton:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.closeButton svg {
  width: 14px;
  height: 14px;
}

.text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: white;
  margin: 0;
}

.description {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.95);
  line-height: var(--leading-normal);
  margin: 0;
}

.button {
  flex-shrink: 0;
  white-space: nowrap;
  background-color: white;
  color: var(--primary);
  border: none;
}

.button:hover {
  background-color: var(--bg-secondary);
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 1024px) {
  .content {
    flex-direction: column;
    gap: var(--spacing-md);
    padding-top: 0;
  }

  .closeButton {
    position: static;
    align-self: flex-end;
    margin-bottom: var(--spacing-xs);
  }

  .text {
    text-align: center;
  }

  .button {
    width: 100%;
  }

  .title {
    font-size: var(--text-lg);
  }

  .description {
    font-size: var(--text-xs);
  }
}

@media (max-width: 640px) {
  .floatingCTA {
    padding: var(--spacing-md) 0;
  }

  .content {
    gap: var(--spacing-sm);
  }

  .title {
    font-size: var(--text-base);
  }
}
</style>
