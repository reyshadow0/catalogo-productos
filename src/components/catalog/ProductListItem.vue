<template>
  <article
    class="product-list-item"
    tabindex="0"
    role="listitem"
    :aria-label="`${producto.nombre}, precio: ${formatPrecio(producto.precio)}`"
    @click="$emit('ver', producto.id)"
    @keydown.enter="$emit('ver', producto.id)"
  >
    <img
      :src="producto.imagenPrincipal || 'https://placehold.co/72x72/ede9e1/8a8a8a?text=?'"
      :alt="producto.nombre"
      class="product-list-img"
      loading="lazy"
    />
    <div class="product-list-info">
      <p class="product-cat">{{ producto.categoriaId || 'Sin categoría' }}</p>
      <h2 class="product-list-name">{{ producto.nombre }}</h2>
      <div class="product-list-meta">
        <span class="product-price">{{ formatPrecio(producto.precio) }}</span>
        <span class="product-estado" :class="`estado-${producto.estado}`">{{ producto.estado }}</span>
        <span class="product-stock">{{ producto.stock }} disponibles</span>
      </div>
    </div>
  </article>
</template>

<script setup>
defineProps({ producto: { type: Object, required: true } })
defineEmits(['ver'])

function formatPrecio(v) {
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(v)
}
</script>

<style scoped>
.product-list-item {
  background: var(--paper-card); border: 1px solid var(--border);
  border-radius: 10px; display: flex; align-items: center; gap: 16px;
  padding: 12px; cursor: pointer; transition: var(--transition);
}
.product-list-item:hover { box-shadow: var(--shadow-md); }

.product-list-img { width: 72px; height: 72px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.product-list-info { flex: 1; min-width: 0; }
.product-cat { font-size: 0.72rem; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.product-list-name { font-family: var(--font-display); font-size: 1rem; }
.product-list-meta { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
.product-price { font-size: 1rem; font-weight: 600; }
.product-stock { font-size: 0.78rem; color: var(--ink-muted); }

.product-estado {
  font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em;
  text-transform: uppercase; padding: 3px 8px; border-radius: 100px;
}
</style>
