<template>
  <AppModal :title="producto?.nombre || 'Cargando…'" @close="ui.cerrarModal()">
    <!-- Skeleton mientras carga -->
    <template v-if="!producto">
      <div class="skeleton" style="height: 220px; border-radius: 8px; margin-bottom: 16px;"></div>
      <div class="skeleton" style="height: 20px; width: 60%; margin-bottom: 8px;"></div>
      <div class="skeleton" style="height: 16px; margin-bottom: 6px;"></div>
    </template>

    <template v-else>
      <img
        v-if="producto.imagenes?.length"
        :src="producto.imagenes[0].url"
        :alt="producto.imagenes[0].altText || producto.nombre"
        class="detail-img"
      />

      <div class="detail-meta">
        <span class="product-estado" :class="`estado-${producto.estado}`">{{ producto.estado }}</span>
        <span class="detail-cat">{{ producto.categoria?.nombre || 'Sin categoría' }}</span>
      </div>

      <div class="detail-price">{{ formatPrecio(producto.precio) }}</div>
      <p class="detail-desc">{{ producto.descripcion || 'Sin descripción disponible.' }}</p>

      <div class="divider"></div>

      <div class="info-row">
        <span class="info-label">Stock disponible</span>
        <span class="info-val" :class="{ 'sin-stock': producto.stock === 0 }">
          {{ producto.stock > 0 ? `${producto.stock} unidades` : 'Sin stock' }}
        </span>
      </div>
      <div class="info-row" v-if="producto.fechaCreacion">
        <span class="info-label">Agregado</span>
        <span class="info-val">{{ formatFecha(producto.fechaCreacion) }}</span>
      </div>

      <div class="tag-list" v-if="producto.etiquetas?.length" aria-label="Etiquetas del producto">
        <span v-for="tag in producto.etiquetas" :key="tag" class="tag">{{ tag }}</span>
      </div>

      <!-- Acciones admin/editor -->
      <div class="detail-actions" v-if="auth.esAdminOEditor">
        <button class="btn-edit" @click="editarProducto">✏️ Editar</button>
        <button v-if="auth.esAdmin" class="btn-danger" @click="eliminar">🗑 Eliminar</button>
      </div>
    </template>
  </AppModal>
</template>

<script setup>
import { computed } from 'vue'
import AppModal from '@/components/shared/AppModal.vue'
import { useUiStore }   from '@/stores/ui.js'
import { useAuthStore } from '@/stores/auth.js'
import { useCatalogoStore } from '@/stores/catalogo.js'

const ui       = useUiStore()
const auth     = useAuthStore()
const catalogo = useCatalogoStore()

const producto = computed(() => ui.modalData)

function formatPrecio(v) {
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(v)
}

function formatFecha(f) {
  return new Date(f).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })
}

function editarProducto() {
  ui.abrirModal('form', producto.value)
}

async function eliminar() {
  if (!confirm(`¿Eliminar "${producto.value.nombre}"? Esta acción no se puede deshacer.`)) return
  try {
    await catalogo.eliminarProducto(producto.value.id)
    ui.toast('Producto eliminado')
    ui.cerrarModal()
  } catch (e) {
    ui.toast('Error al eliminar', 'error')
  }
}
</script>

<style scoped>
.detail-img  { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 8px; margin-bottom: 16px; }
.detail-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.detail-cat  { font-size: 0.8rem; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.detail-price { font-size: 1.8rem; font-weight: 700; color: var(--ink); margin: 6px 0; }
.detail-desc  { color: var(--ink-soft); font-size: 0.9rem; line-height: 1.7; }

.divider { height: 1px; background: var(--border); margin: 16px 0; }

.info-row   { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.875rem; }
.info-label { color: var(--ink-muted); }
.info-val   { font-weight: 500; }
.sin-stock  { color: #dc2626; }

.tag-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.tag { padding: 4px 10px; background: var(--paper-warm); border-radius: 100px; font-size: 0.78rem; color: var(--ink-soft); }

.detail-actions { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }

.btn-edit {
  padding: 10px 20px; background: var(--ink); color: white;
  border: none; border-radius: 8px; cursor: pointer;
  font-family: var(--font-body); font-size: 0.875rem; font-weight: 500;
  transition: var(--transition);
}
.btn-edit:hover { background: var(--ink-soft); }

.btn-danger {
  padding: 10px 20px; background: transparent; color: #dc2626;
  border: 1px solid #dc2626; border-radius: 8px; cursor: pointer;
  font-family: var(--font-body); font-size: 0.875rem; font-weight: 500;
  transition: var(--transition);
}
.btn-danger:hover { background: #fef2f2; }

.product-estado {
  font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em;
  text-transform: uppercase; padding: 3px 8px; border-radius: 100px;
}
</style>
