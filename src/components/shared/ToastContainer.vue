<template>
  <!-- aria-live="polite" anuncia toasts sin interrumpir al usuario -->
  <div class="toast-container" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast" tag="div" class="toast-list">
      <div
        v-for="t in ui.toasts"
        :key="t.id"
        class="toast"
        :class="`toast-${t.tipo}`"
        role="status"
        :aria-label="t.tipo === 'error' ? 'Error: ' + t.mensaje : t.mensaje"
      >
        <span class="toast-icon" aria-hidden="true">
          {{ t.tipo === 'success' ? '✓' : t.tipo === 'error' ? '✕' : 'ℹ' }}
        </span>
        <span class="toast-msg">{{ t.mensaje }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useUiStore } from '@/stores/ui.js'
const ui = useUiStore()
</script>

<style scoped>
.toast-container {
  position: fixed; bottom: 24px; right: 24px; z-index: 9000;
  pointer-events: none;
}
.toast-list { display: flex; flex-direction: column; gap: 8px; }

.toast {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 18px; border-radius: 10px;
  color: white; font-size: 0.875rem; font-weight: 500;
  box-shadow: var(--shadow-lg); min-width: 260px; max-width: 380px;
  pointer-events: auto;
}
.toast-success { background: #166534; }
.toast-error   { background: #991b1b; }
.toast-info    { background: #1e40af; }

.toast-icon { font-size: 1rem; flex-shrink: 0; }
.toast-msg  { line-height: 1.4; }

/* Animaciones */
.toast-enter-active {
  animation: toastIn 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  animation: toastIn 200ms ease reverse;
}

@keyframes toastIn {
  from { transform: translateX(110%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

@media (max-width: 480px) {
  .toast-container { right: 12px; bottom: 12px; left: 12px; }
  .toast           { min-width: 0; }
}
</style>
