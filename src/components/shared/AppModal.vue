<template>
  <Teleport to="body">
    <div
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      @click.self="$emit('close')"
    >
      <div class="modal" :style="{ maxWidth: width }">
        <div class="modal-header">
          <h2 class="modal-title">{{ title }}</h2>
          <button class="modal-close" @click="$emit('close')" aria-label="Cerrar diálogo">✕</button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div v-if="$slots.actions" class="modal-actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  width: { type: String, default: '540px' }
})
defineEmits(['close'])
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(6px);
  z-index: 200;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  animation: fadeIn 150ms ease;
}

.modal {
  background: var(--paper-card);
  border-radius: 16px;
  width: 100%; max-height: 90vh; overflow-y: auto;
  box-shadow: var(--shadow-lg);
  animation: slideUp 200ms cubic-bezier(0.4,0,0.2,1);
}

.modal-header {
  padding: 24px 28px 0;
  display: flex; justify-content: space-between; align-items: center;
}

.modal-title {
  font-family: var(--font-display); font-size: 1.5rem;
}

.modal-close {
  width: 36px; height: 36px;
  border: 1px solid var(--border);
  background: transparent; border-radius: 50%;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; color: var(--ink-muted);
  transition: var(--transition);
}
.modal-close:hover { background: var(--paper-warm); color: var(--ink); }

.modal-body   { padding: 24px 28px; }
.modal-actions { padding: 0 28px 28px; display: flex; gap: 10px; justify-content: flex-end; }
</style>
