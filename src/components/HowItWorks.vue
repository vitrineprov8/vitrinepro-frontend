<template>
  <section id="como-funciona" :class="$style.howItWorks">
    <div class="container">
      <div :class="$style.header">
        <h2 :class="$style.title">Como Funciona</h2>
        <p :class="$style.subtitle">
          Três passos simples para ter seu portfólio profissional online
        </p>
      </div>

      <div :class="$style.steps">
        <div v-for="(step, index) in steps" :key="step.id" :class="$style.step">
          <div :class="$style.stepNumber">{{ index + 1 }}</div>
          <div :class="$style.stepContent">
            <h3 :class="$style.stepTitle">{{ step.title }}</h3>
            <p :class="$style.stepDescription">{{ step.description }}</p>
          </div>
          <div v-if="index < steps.length - 1" :class="$style.connector"></div>
        </div>
      </div>

      <div :class="$style.cta">
        <a href="/signup" class="btn btn-accent btn-lg">
          Começar Agora - É Grátis
        </a>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
interface Step {
  id: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Crie sua conta',
    description: 'Cadastro rápido e gratuito. Sem cartão de crédito, sem pegadinhas.'
  },
  {
    id: 2,
    title: 'Complete seu perfil',
    description: 'Adicione suas informações, experiências, habilidades e histórico profissional.'
  },
  {
    id: 3,
    title: 'Apareça na Vitrine',
    description: 'Seu portfólio profissional está pronto para ser compartilhado com o mundo.'
  }
];
</script>

<style module>
.howItWorks {
  padding: var(--spacing-4xl) 0;
  background-color: var(--bg-primary);
}

.header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.title {
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  margin: 0 0 var(--spacing-sm);
}

.subtitle {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  max-width: 520px;
  margin: 0 auto;
}

.steps {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-3xl);
  position: relative;
}

.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
}

.stepNumber {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-3xl);
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-lg);
  flex-shrink: 0;
}

.stepContent {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.stepTitle {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.stepDescription {
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.connector {
  position: absolute;
  top: 40px;
  left: calc(50% + 40px);
  width: calc(100% - 80px);
  height: 2px;
  background: linear-gradient(to right, var(--primary), var(--secondary));
  z-index: 0;
}

.cta {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-3xl);
}

/* ── Eye-catching CTA Banner ─────────────────────────── */
.ctaBanner {
  position: relative;
  margin-top: var(--spacing-4xl);
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #7c3aed 100%);
  padding: 4rem 3rem;
  text-align: center;
}

.ctaBannerGlow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.12) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%);
  pointer-events: none;
}

.ctaBannerContent {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  max-width: 680px;
  margin: 0 auto;
}

.ctaBannerBadge {
  display: inline-block;
  background: rgba(255,255,255,0.18);
  color: rgba(255,255,255,0.95);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 999px;
  padding: 0.3rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.ctaBannerTitle {
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  line-height: 1.15;
  letter-spacing: -0.5px;
}

.ctaBannerText {
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  color: rgba(255,255,255,0.85);
  line-height: 1.65;
  margin: 0;
}

.ctaBannerActions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.ctaBannerBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #ffffff;
  color: #1e40af;
  font-weight: 700;
  font-size: 1rem;
  padding: 0.875rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  box-shadow: 0 4px 24px rgba(0,0,0,0.2);
  transition: transform 0.15s, box-shadow 0.15s;
}
.ctaBannerBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.28);
}

.ctaBannerNote {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.65);
}

/* Responsive */
@media (max-width: 1024px) {
  .steps {
    flex-direction: column;
    gap: var(--spacing-3xl);
  }

  .connector {
    display: none;
  }

  .step {
    flex-direction: row;
    text-align: left;
    gap: var(--spacing-lg);
  }

  .stepNumber {
    width: 60px;
    height: 60px;
    font-size: var(--text-2xl);
    margin-bottom: 0;
  }

  .stepContent {
    align-items: flex-start;
  }

  .stepDescription {
    margin-left: 0;
    margin-right: 0;
  }
}

@media (max-width: 640px) {
  .ctaBanner { padding: 2.5rem 1.5rem; }
  .ctaBannerTitle { font-size: 1.6rem; }

  .howItWorks {
    padding: var(--spacing-3xl) 0;
  }

  .step {
    flex-direction: column;
    text-align: center;
  }

  .stepContent {
    align-items: center;
  }

  .stepNumber {
    width: 60px;
    height: 60px;
    margin-bottom: var(--spacing-md);
  }
}
</style>
