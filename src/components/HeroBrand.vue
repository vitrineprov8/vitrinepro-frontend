<template>
  <section :class="$style.heroBrand" aria-label="VitrinePro — Apresentação da marca">
    <div class="container">
      <div :class="$style.inner">

        <!-- Logo (same as Header.astro) -->
        <a href="/" :class="$style.logoLink" aria-label="VitrinePro — página inicial">
          <img
            src="/logo.png"
            alt="Logo VitrinePro"
            :class="$style.logoImg"
            width="180"
            height="52"
          />
        </a>

        <!-- Subtitle -->
        <h1 :class="$style.subtitle">
          Sua vitrine digital de talentos profissionais
        </h1>

        <!-- Banner image -->
        <!-- <div :class="$style.bannerWrap" role="img" aria-label="Profissionais colaborando">
          <img
            :class="$style.bannerImg"
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80"
            alt="Profissionais colaborando em um ambiente de trabalho moderno"
            loading="eager"
            decoding="async"
          />
          <div :class="$style.bannerOverlay" aria-hidden="true"></div>
        </div> -->

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style module>
/* ── HeroBrand Section ───────────────────────────────────────────────────── */
.heroBrand {
  padding: var(--spacing-xl) 0 var(--spacing-lg);
  background-color: var(--bg-primary);
  text-align: center;
}

/* ── Inner wrapper ───────────────────────────────────────────────────────── */
.inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

/* ── Logo ────────────────────────────────────────────────────────────────── */
.logoLink {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.logoImg {
  display: block;
  height: 40px;
  width: auto;
}

/* ── Subtitle ────────────────────────────────────────────────────────────── */
.subtitle {
  font-size: clamp(var(--text-base), 2.2vw, var(--text-xl));
  font-weight: 400;
  color: var(--text-secondary);
  line-height: var(--leading-normal);
  max-width: 600px;
  margin: 0 auto;
}

/* ── Banner wrap ─────────────────────────────────────────────────────────── */
.bannerWrap {
  position: relative;
  width: 100%;
  max-width: 960px;
  margin: var(--spacing-md) auto 0;
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border);
  border-bottom: none;
}

.bannerImg {
  width: 100%;
  height: 400px;
  object-fit: cover;
  object-position: center 30%;
  display: block;
}

.bannerOverlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0) 60%,
    rgba(249, 250, 251, 0.6) 100%
  );
  pointer-events: none;
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .bannerImg {
    height: 280px;
  }

  .logoImg {
    height: 36px;
  }
}

@media (max-width: 480px) {
  .bannerImg {
    height: 210px;
    object-position: center 25%;
  }

  .bannerWrap {
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }
}
</style>
