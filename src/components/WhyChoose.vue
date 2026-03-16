<template>
  <section id="porque-escolher" :class="$style.whyChoose">
    <div class="container">
      <div :class="$style.header">
        <h2 :class="$style.title">Por Que Escolher VitrinePro</h2>
        <p :class="$style.subtitle">
          A plataforma completa para gerenciar e compartilhar sua trajetória profissional
        </p>
      </div>

      <div :class="$style.grid">
        <div v-for="reason in reasons" :key="reason.id" :class="$style.card">
          <div :class="$style.icon" v-html="reason.icon"></div>
          <h3 :class="$style.cardTitle">{{ reason.title }}</h3>
          <p :class="$style.cardDescription">{{ reason.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Reason {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const reasons: Reason[] = [
  {
    id: 1,
    title: 'Centralize Suas Experiências',
    description: 'Reúna toda sua trajetória profissional em um único lugar organizado e acessível.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
    </svg>`
  },
  {
    id: 2,
    title: 'Rápido e Fácil',
    description: 'Configure seu portfólio em minutos com nossa interface intuitiva e amigável.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>`
  },
  {
    id: 3,
    title: 'Fácil de Compartilhar no WhatsApp',
    description: 'Compartilhe seu portfólio direto no WhatsApp com um clique.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
    </svg>`
  },
  {
    id: 4,
    title: 'Seguro e Confiável',
    description: 'Seus dados protegidos com as melhores práticas de segurança e privacidade.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
    </svg>`
  },
  {
    id: 5,
    title: 'Acesso Global',
    description: 'Seu portfólio acessível de qualquer lugar, a qualquer hora, em qualquer dispositivo.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>`
  },
  {
    id: 7,
    title: 'Grátis',
    description: 'Todos os recursos essenciais completamente gratuitos, sem taxas ocultas.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>`
  }
];
</script>

<style module>
.whyChoose {
  padding: var(--spacing-4xl) 0;
  background-color: var(--bg-secondary);
}

.header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
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

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.icon svg {
  width: 28px;
  height: 28px;
}

.cardTitle {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.cardDescription {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .whyChoose {
    padding: var(--spacing-3xl) 0;
  }

  .title {
    font-size: var(--text-3xl);
  }

  .subtitle {
    font-size: var(--text-lg);
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
