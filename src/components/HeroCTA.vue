<template>
  <section :class="$style.heroCta">
    <div class="container">
      <div :class="$style.grid">

        <div :class="$style.titleCol">
          <h2 :class="$style.headline">
            Pare de depender só do<br>seu currículo. 
          </h2>
          <p :class="$style.subtext">
            Coloque na vitrine suas habilidades, experiências e oferte seus serviços
          </p>
        </div>

        <div :class="$style.ctaCol">
          <div :class="$style.btnWrap">
            <div :class="$style.btnPulse" aria-hidden="true" />
            <a href="/auth/register" :class="$style.btn">
              <span>Cadastre-se Grátis</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style module>
.heroCta {
  background: linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%);
  padding: var(--spacing-2xl) 0;
}

.grid {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 40px;
  max-width: 900px;
  margin: 0 auto;
}

.headline {
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  font-weight: 900;
  color: #ffffff;
  line-height: 1.2;
  margin: 0;
}

.ctaCol {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btnWrap {
  position: relative;
  display: inline-flex;
}

@keyframes pulseRing {
  0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.45; }
  100% { transform: translate(-50%, -50%) scale(1.9); opacity: 0; }
}

.btnPulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: rgba(250, 204, 21, 0.35);
  animation: pulseRing 2s ease-out infinite;
  pointer-events: none;
}

.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 2.25rem;
  background: linear-gradient(135deg, #facc15 0%, #f59e0b 100%);
  color: #1e1b4b;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-decoration: none;
  border-radius: 999px;
  white-space: nowrap;
  box-shadow: 0 8px 28px rgba(250, 204, 21, 0.45);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
  z-index: 1;
}

.btn svg {
  transition: transform 0.3s ease;
}

.btn:hover {
  transform: translateY(-4px) scale(1.04);
  box-shadow: 0 14px 36px rgba(250, 204, 21, 0.55);
}

.btn:hover svg {
  transform: translateX(4px);
}

.titleCol {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.subtext {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
}

@media (max-width: 767px) {
  .heroCta {
    padding: 40px 0;
  }

  .grid {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 24px;
  }

  .ctaCol {
    justify-content: center;
  }

  .btnWrap {
    width: 100%;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
