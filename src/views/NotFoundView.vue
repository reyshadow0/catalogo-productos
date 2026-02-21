<template>
  <div class="not-found">
    <p class="code" aria-hidden="true">404</p>
    <h1 class="title">Página no encontrada</h1>
    <p class="desc">La página que buscas no existe o fue movida.</p>
    <RouterLink to="/" class="btn-home">← Volver al catálogo</RouterLink>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.not-found {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 60vh; text-align: center; padding: 32px;
}
.code  { font-family: var(--font-display); font-size: 8rem; color: var(--paper-warm); line-height: 1; }
.title { font-family: var(--font-display); font-size: 2rem; margin-bottom: 12px; }
.desc  { color: var(--ink-muted); margin-bottom: 28px; }
.btn-home {
  padding: 12px 28px; background: var(--ink); color: white;
  border-radius: 8px; text-decoration: none; font-weight: 500;
  transition: var(--transition);
}
.btn-home:hover { background: var(--accent); }
</style>
