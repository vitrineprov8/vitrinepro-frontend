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
    title: 'Compartilhe seu link',
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
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.subtitle {
  font-size: var(--text-xl);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
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
  .howItWorks {
    padding: var(--spacing-3xl) 0;
  }

  .title {
    font-size: var(--text-3xl);
  }

  .subtitle {
    font-size: var(--text-lg);
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
