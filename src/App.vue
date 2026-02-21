<template>
  <div id="root">
    <!-- Enlace de saltar al contenido principal (accesibilidad) -->
    <a href="#main-content" class="skip-link">Saltar al contenido principal</a>

    <AppTopbar />

    <RouterView id="main-content" />

    <ToastContainer />
  </div>
</template>

<script setup>
import AppTopbar      from '@/components/shared/AppTopbar.vue'
import ToastContainer from '@/components/shared/ToastContainer.vue'
import { onMounted }  from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useUiStore }   from '@/stores/ui.js'

const authStore = useAuthStore()
const ui        = useUiStore()

onMounted(() => {
  authStore.restaurarSesion()
})

// ESC cierra cualquier modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') ui.cerrarModal()
})
</script>

<style>
/* Enlace "saltar al contenido" para navegación por teclado */
.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  background: var(--accent);
  color: white;
  padding: 10px 18px;
  border-radius: 0 0 8px 8px;
  font-weight: 600;
  font-family: var(--font-body);
  z-index: 9999;
  text-decoration: none;
  transition: top 100ms;
}
.skip-link:focus {
  top: 0;
  outline: 3px solid white;
  outline-offset: 2px;
}
</style>
