<template>
  <section :class="$style.section" aria-labelledby="featured-heading">
    <div class="container">

      <!-- Profiles sub-section -->
      <div :class="$style.subsection">
        <div :class="$style.header">
          <h2 :class="$style.title" id="featured-heading">Profissionais em Destaque</h2>
          <p :class="$style.subtitle">
            Conheça profissionais que estão construindo carreiras incríveis na plataforma
          </p>
        </div>
        <ProfilesCarousel v-if="showProfiles" />
      </div>

      <!-- Projects sub-section -->
      <div :class="$style.subsection">
        <div :class="$style.header">
          <h2 :class="$style.title">Projetos em Destaque</h2>
          <p :class="$style.subtitle">
            Explore trabalhos e projetos reais compartilhados pela nossa comunidade
          </p>
        </div>
        <ProjectsCarousel v-if="showProjects" />
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ProfilesCarousel from './ProfilesCarousel.vue';
import ProjectsCarousel from './ProjectsCarousel.vue';

// Both carousels always attempt to load; each handles its own fail-silent logic.
const showProfiles = ref(true);
const showProjects = ref(true);
</script>

<style module>
.section {
  padding: var(--spacing-4xl) 0;
  background-color: var(--bg-secondary);
}

.subsection {
  margin-bottom: var(--spacing-3xl);
}

.subsection:last-child {
  margin-bottom: 0;
}

.header {
  margin-bottom: var(--spacing-xl);
  max-width: 600px;
}

.title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs);
  line-height: var(--leading-tight);
}

.subtitle {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--leading-relaxed);
}

/* ── Responsive ───────────────────────────────────────── */
@media (max-width: 640px) {
  .section {
    padding: var(--spacing-3xl) 0;
  }

  .title {
    font-size: var(--text-2xl);
  }

  .subtitle {
    font-size: var(--text-sm);
  }

  .subsection {
    margin-bottom: var(--spacing-2xl);
  }
}
</style>
