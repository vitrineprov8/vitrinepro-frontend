<template>
  <section :class="$style.hero" aria-label="Apresentação VitrinePro">
    <div class="container">
      <div :class="$style.content">
        <!-- Brand name -->
        <p :class="$style.brand" aria-hidden="true">VitrinePro</p>

        <!-- Main headline -->
        <h1 :class="$style.title">
          Sua vitrine digital de talentos profissionais
        </h1>

        <!-- Value proposition block -->
        <div :class="$style.valueBlock" role="complementary">
          <p :class="$style.valueText">
            Pare de depender só do seu currículo. Coloque na vitrine suas habilidades, experiências e oferte seus serviços.
          </p>
        </div>

        <!-- CTA -->
        <div :class="$style.cta">
          <a href="/signup" class="btn btn-accent btn-lg" :class="$style.ctaBtn">
            Cadastre-se Grátis
          </a>
        </div>
        
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style module>
/* ── Hero Section ─────────────────────────────────────────────────────── */
.hero {
  padding: 88px 0 96px;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%);
  position: relative;
  overflow: hidden;
  text-align: center;
}

/* Decorative blobs */
.hero::before,
.hero::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.hero::before {
  width: 560px;
  height: 560px;
  top: -220px;
  right: -120px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.07) 0%, transparent 70%);
}

.hero::after {
  width: 400px;
  height: 400px;
  bottom: -180px;
  left: -80px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
}

/* ── Content ───────────────────────────────────────────────────────────── */
.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  max-width: 760px;
  margin: 0 auto;
}

/* ── Brand ─────────────────────────────────────────────────────────────── */
.brand {
  font-size: clamp(2.5rem, 7vw, 4.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #ffffff;
  margin: 0;
  line-height: 1;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.18);
}

/* ── Title / Subtitle ──────────────────────────────────────────────────── */
.title {
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  font-weight: 500;
  line-height: var(--leading-relaxed);
  color: rgba(255, 255, 255, 0.88);
  margin: 0;
  max-width: 580px;
}

/* ── Value Proposition Block ────────────────────────────────────────────── */
.valueBlock {
  background: rgba(255, 255, 255, 0.12);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-lg) var(--spacing-xl);
  max-width: 640px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.valueText {
  font-size: clamp(1rem, 2.2vw, 1.15rem);
  color: rgba(255, 255, 255, 0.95);
  line-height: var(--leading-relaxed);
  margin: 0;
  font-weight: 400;
}

/* ── CTA ────────────────────────────────────────────────────────────────── */
.cta {
  margin-top: var(--spacing-md);
}

.ctaBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-family: var(--font-sans);
  box-shadow: 0 6px 24px rgba(245, 158, 11, 0.45);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.ctaBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(245, 158, 11, 0.55);
}

.ctaBtn:active {
  transform: translateY(0);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.40);
}

/* ── Hero Banner Image ──────────────────────────────────────────────────── */
.heroBanner {
  position: relative;
  width: 100%;
  height: 340px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.12),
    0 24px 64px rgba(0, 0, 0, 0.45);
  margin-top: var(--spacing-lg);
}

.heroBannerImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.heroBannerOverlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(30, 58, 138, 0.20) 0%,
    rgba(0, 0, 0, 0.28) 100%
  );
  pointer-events: none;
}

/* ── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .hero {
    padding: 60px 0 72px;
  }

  .valueBlock {
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .ctaBtn {
    width: 100%;
    text-align: center;
  }

  .heroBanner {
    height: 200px;
    border-radius: 12px;
  }
}

@media (max-width: 400px) {
  .brand {
    font-size: 2.25rem;
  }
}
</style>
