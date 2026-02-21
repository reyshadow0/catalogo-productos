<template>
  <article
    class="product-card"
    tabindex="0"
    role="listitem"
    :aria-label="`${producto.nombre}, precio: ${formatPrecio(producto.precio)}`"
    @click="$emit('ver', producto.id)"
    @keydown.enter="$emit('ver', producto.id)"
  >
    <div class="product-img">
      <img
        :src="producto.imagenPrincipal || 'https://placehold.co/400x400/ede9e1/8a8a8a?text=Sin+imagen'"
        :alt="producto.nombre"
        loading="lazy"
      />
      <span
        class="product-estado"
        :class="`estado-${producto.estado}`"
        :aria-label="`Estado: ${producto.estado}`"
      >{{ producto.estado }}</span>
    </div>
    <div class="product-body">
      <p class="product-cat">{{ producto.categoriaId || 'Sin categoría' }}</p>
      <h2 class="product-name">{{ producto.nombre }}</h2>
      <div class="product-footer">
        <span class="product-price">{{ formatPrecio(producto.precio) }}</span>
        <span class="product-stock" :aria-label="`Stock: ${producto.stock} unidades`">
          {{ producto.stock > 0 ? `${producto.stock} disp.` : 'Sin stock' }}
        </span>
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
.product-card {
  background: var(--paper-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition), box-shadow var(--transition);
}
.product-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }

.product-img { aspect-ratio: 1; overflow: hidden; background: var(--paper-warm); position: relative; }
.product-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 400ms ease; }
.product-card:hover .product-img img { transform: scale(1.04); }

.product-estado {
  position: absolute; top: 10px; right: 10px;
  font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em;
  text-transform: uppercase; padding: 3px 8px; border-radius: 100px;
}

.product-body { padding: 14px; }
.product-cat  { font-size: 0.72rem; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 500; margin-bottom: 4px; }
.product-name { font-family: var(--font-display); font-size: 1.05rem; line-height: 1.3; color: var(--ink); margin-bottom: 8px; }
.product-footer { display: flex; justify-content: space-between; align-items: center; }
.product-price  { font-size: 1.1rem; font-weight: 600; color: var(--ink); }
.product-stock  { font-size: 0.78rem; color: var(--ink-muted); }
</style>
