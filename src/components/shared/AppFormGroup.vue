<template>
  <div class="form-group">
    <label class="form-label" :for="forId">
      {{ label }}
    </label>

    <div class="field-wrap">
      <slot />
    </div>

    <!-- Error con ícono y rol alert para lectores de pantalla -->
    <p
      v-if="error"
      class="field-error"
      role="alert"
      aria-live="polite"
      :id="`${forId}-error`"
    >
      <span class="field-error-icon" aria-hidden="true">⚠</span>
      {{ error }}
    </p>

    <!-- Hint informativo -->
    <p v-else-if="hint" class="field-hint" :id="`${forId}-hint`">
      <span aria-hidden="true">ℹ</span> {{ hint }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  forId: { type: String, required: true },
  error: { type: String, default: '' },
  hint:  { type: String, default: '' },
})
</script>

<style scoped>
.form-group  { margin-bottom: 16px; }

.form-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink-muted);
  margin-bottom: 6px;
}

.field-wrap { position: relative; }

.field-error {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 0.8rem;
  color: #dc2626;
  margin-top: 5px;
  line-height: 1.4;
  animation: fadeIn 150ms ease;
}
.field-error-icon { font-size: 0.9rem; flex-shrink: 0; margin-top: 1px; }

.field-hint {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  font-size: 0.8rem;
  color: var(--ink-muted);
  margin-top: 5px;
  line-height: 1.4;
}
</style>
