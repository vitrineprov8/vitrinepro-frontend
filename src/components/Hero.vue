<template>
  <section :class="$style.hero">
    <div class="container">
      <div :class="$style.heroContent">
        <div :class="$style.heroText">
          <h1 :class="$style.title">
            Coloque suas habilidades na vitrine e conquiste mais oportunidades!​
          </h1>
          <p :class="$style.subtitle">
            Seja qual for sua área de atuação, o vitrine é para você!​
          </p>

          <!-- Social Proof -->
          <!-- <div :class="$style.socialProof">
            <div :class="$style.avatars">
              <div :class="$style.avatar">MS</div>
              <div :class="$style.avatar">JS</div>
              <div :class="$style.avatar">AC</div>
              <div :class="$style.avatar">CM</div>
              <div :class="$style.avatarMore">+5K</div>
            </div>
            <div :class="$style.socialText">
              <div :class="$style.socialCount">
                <strong>Mais de 5.000 profissionais</strong> já criaram seus portfólios
              </div>
              <div :class="$style.rating">
                <span :class="$style.stars">⭐⭐⭐⭐⭐</span>
                <span>4.9/5 · 500+ avaliações</span>
              </div>
            </div>
          </div> -->

          <div :class="$style.cta">
            <a href="/signup" :class="[$style.btnPrimary, 'btn', 'btn-accent', 'btn-lg']">
              Criar Meu Portfólio Gratuito
            </a>
           <!--  <a href="#exemplos" :class="[$style.btnSecondary, 'btn', 'btn-outline', 'btn-lg']">
              Ver Exemplos
            </a> -->
          </div>

          <!-- <div :class="$style.stats">
            <div :class="$style.stat">
              <span :class="$style.statNumber">5 min</span>
              <span :class="$style.statLabel">Para criar</span>
            </div>
            <div :class="$style.stat">
              <span :class="$style.statNumber">100%</span>
              <span :class="$style.statLabel">Gratuito</span>
            </div>
            <div :class="$style.stat">
              <span :class="$style.statNumber">24/7</span>
              <span :class="$style.statLabel">Disponível</span>
            </div>
          </div> -->
        </div>
        <div :class="$style.heroImage">
          <div :class="$style.imageContainer">
            <svg :class="$style.illustration" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Pessoas profissionais -->
              <circle cx="200" cy="200" r="180" fill="#EEF2FF"/>

              <!-- Pessoa 1 - Advogada -->
              <circle cx="140" cy="180" r="40" fill="#2563EB"/>
              <rect x="120" y="220" width="40" height="60" rx="5" fill="#2563EB"/>

              <!-- Pessoa 2 - Médico -->
              <circle cx="260" cy="180" r="40" fill="#7C3AED"/>
              <rect x="240" y="220" width="40" height="60" rx="5" fill="#7C3AED"/>

              <!-- Pessoa 3 - Programador -->
              <circle cx="200" cy="120" r="35" fill="#F59E0B"/>
              <rect x="183" y="155" width="34" height="50" rx="5" fill="#F59E0B"/>

              <!-- Ícones -->
              <circle cx="80" cy="100" r="20" fill="#60A5FA" opacity="0.5"/>
              <circle cx="320" cy="130" r="25" fill="#A78BFA" opacity="0.5"/>
              <circle cx="90" cy="300" r="18" fill="#FBBF24" opacity="0.5"/>
              <circle cx="310" cy="290" r="22" fill="#34D399" opacity="0.5"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style module>
.hero {
  padding: var(--spacing-4xl) 0;
  background: linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 100%);
  overflow: hidden;
  position: relative;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.heroContent {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3xl);
  align-items: center;
  position: relative;
  z-index: 1;
}

.heroText {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.title {
  font-size: var(--text-6xl);
  font-weight: 800;
  line-height: 1.1;
  color: var(--text-primary);
  margin: 0;
}

.subtitle {
  font-size: var(--text-xl);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
  margin: 0;
}

/* Social Proof */
.socialProof {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-light);
}

.avatars {
  display: flex;
  align-items: center;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: 700;
  border: 3px solid white;
  margin-left: -12px;
}

.avatar:first-child {
  margin-left: 0;
}

.avatarMore {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: 700;
  border: 3px solid white;
  margin-left: -12px;
}

.socialText {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.socialCount {
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.socialCount strong {
  color: var(--primary);
  font-weight: 700;
}

.rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.stars {
  font-size: var(--text-sm);
}

.cta {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

.btnPrimary,
.btnSecondary {
  flex-shrink: 0;
}

.stats {
  display: flex;
  gap: var(--spacing-2xl);
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.statNumber {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--primary);
}

.statLabel {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.heroImage {
  display: flex;
  align-items: center;
  justify-content: center;
}

.imageContainer {
  width: 100%;
  max-width: 400px;
  animation: float 6s ease-in-out infinite;
}

.illustration {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.1));
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .heroContent {
    grid-template-columns: 1fr;
    gap: var(--spacing-2xl);
  }

  .heroImage {
    order: -1;
  }

  .imageContainer {
    max-width: 300px;
  }

  .title {
    font-size: var(--text-5xl);
  }

  .socialProof {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .hero {
    padding: var(--spacing-3xl) 0;
  }

  .title {
    font-size: var(--text-4xl);
  }

  .subtitle {
    font-size: var(--text-lg);
  }

  .socialProof {
    padding: var(--spacing-md);
  }

  .avatar,
  .avatarMore {
    width: 36px;
    height: 36px;
    font-size: 10px;
  }

  .socialCount {
    font-size: var(--text-xs);
  }

  .cta {
    flex-direction: column;
  }

  .btnPrimary,
  .btnSecondary {
    width: 100%;
    text-align: center;
  }

  .stats {
    gap: var(--spacing-lg);
    flex-wrap: wrap;
  }

  .statNumber {
    font-size: var(--text-2xl);
  }

  .imageContainer {
    max-width: 250px;
  }
}
</style>
