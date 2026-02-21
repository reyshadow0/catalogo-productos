<template>
  <div class="admin-layout">
    <div class="admin-header">
      <h1 class="admin-title">Panel de Administración</h1>
      <div class="admin-actions">
        <button class="btn-primary" @click="ui.abrirModal('form', null)">+ Nuevo Producto</button>
        <button class="btn-secondary" @click="ui.abrirModal('categoria', null)" v-if="auth.esAdmin">
          + Nueva Categoría
        </button>
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" aria-hidden="true">📦</div>
        <div class="stat-val">{{ totalProductos }}</div>
        <div class="stat-label">Total productos</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" aria-hidden="true">✅</div>
        <div class="stat-val">{{ productosActivos }}</div>
        <div class="stat-label">Activos</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" aria-hidden="true">🗂</div>
        <div class="stat-val">{{ categorias.length }}</div>
        <div class="stat-label">Categorías</div>
      </div>
    </div>

    <!-- Tabla de productos -->
    <div class="table-wrap">
      <table class="admin-table" role="table" aria-label="Lista de productos">
        <thead>
          <tr>
            <th scope="col">Producto</th>
            <th scope="col">Categoría</th>
            <th scope="col">Precio</th>
            <th scope="col">Stock</th>
            <th scope="col">Estado</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="cargando">
            <td colspan="6" class="loading-row">Cargando productos…</td>
          </tr>
          <tr v-else v-for="p in productos" :key="p.id" class="table-row">
            <td>
              <div class="td-producto">
                <img :src="p.imagenPrincipal || 'https://placehold.co/40x40/ede9e1/8a8a8a?text=?'"
                  :alt="p.nombre" class="td-img" />
                <span class="td-nombre">{{ p.nombre }}</span>
              </div>
            </td>
            <td>{{ p.categoriaId || '—' }}</td>
            <td class="td-precio">{{ formatPrecio(p.precio) }}</td>
            <td :class="{ 'sin-stock': p.stock === 0 }">{{ p.stock }}</td>
            <td>
              <span class="product-estado" :class="`estado-${p.estado}`">{{ p.estado }}</span>
            </td>
            <td class="td-actions">
              <button class="action-btn" @click="editarProducto(p.id)" aria-label="Editar producto">✏️</button>
              <button v-if="auth.esAdmin" class="action-btn danger" @click="eliminarProducto(p.id)" aria-label="Eliminar producto">🗑</button>
            </td>
          </tr>
          <tr v-if="!cargando && !productos.length">
            <td colspan="6" class="loading-row">No hay productos</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Modales -->
  <ProductoForm v-if="ui.modalActivo === 'form'" :producto="ui.modalData" />
  <CategoriaForm v-if="ui.modalActivo === 'categoria'" />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import ProductoForm  from '@/components/admin/ProductoForm.vue'
import CategoriaForm from '@/components/admin/CategoriaForm.vue'
import { useCatalogoStore } from '@/stores/catalogo.js'
import { useAuthStore }     from '@/stores/auth.js'
import { useUiStore }       from '@/stores/ui.js'
import { productosApi }     from '@/api/productos.js'

const catalogo = useCatalogoStore()
const auth     = useAuthStore()
const ui       = useUiStore()

const { productos, totalProductos, cargando, categorias } = storeToRefs(catalogo)

const productosActivos = computed(() => productos.value.filter(p => p.estado === 'ACTIVO').length)

function formatPrecio(v) {
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(v)
}

async function editarProducto(id) {
  try {
    const detalle = await productosApi.obtenerPorId(id)
    ui.abrirModal('form', detalle)
  } catch {
    ui.toast('Error al cargar el producto', 'error')
  }
}

async function eliminarProducto(id) {
  if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return
  try {
    await catalogo.eliminarProducto(id)
    ui.toast('Producto eliminado')
  } catch (e) {
    ui.toast('Error al eliminar', 'error')
  }
}

onMounted(async () => {
  await catalogo.cargarCategorias()
  catalogo.buscar()
})
</script>

<style scoped>
.admin-layout { max-width: 1280px; margin: 0 auto; padding: 32px 24px; }

.admin-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px;
}
.admin-title { font-family: var(--font-display); font-size: 2rem; }
.admin-actions { display: flex; gap: 10px; }

.btn-primary {
  padding: 10px 20px; background: var(--accent); color: white;
  border: none; border-radius: 8px; cursor: pointer;
  font-family: var(--font-body); font-size: 0.9rem; font-weight: 500;
  transition: var(--transition);
}
.btn-primary:hover { background: var(--accent-hover); }

.btn-secondary {
  padding: 10px 20px; background: transparent; color: var(--ink);
  border: 1px solid var(--border); border-radius: 8px; cursor: pointer;
  font-family: var(--font-body); font-size: 0.9rem; font-weight: 500;
  transition: var(--transition);
}
.btn-secondary:hover { background: var(--paper-warm); }

.stats-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px;
}
.stat-card {
  background: var(--paper-card); border: 1px solid var(--border); border-radius: 12px;
  padding: 20px; text-align: center;
}
.stat-icon  { font-size: 1.8rem; margin-bottom: 8px; }
.stat-val   { font-family: var(--font-display); font-size: 2rem; }
.stat-label { color: var(--ink-muted); font-size: 0.85rem; margin-top: 4px; }

.table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--border); }

.admin-table {
  width: 100%; border-collapse: collapse;
  background: var(--paper-card); font-size: 0.875rem;
}
.admin-table th {
  padding: 14px 16px; text-align: left; background: var(--paper-warm);
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
  color: var(--ink-muted); border-bottom: 1px solid var(--border);
}
.table-row { border-bottom: 1px solid var(--border); transition: var(--transition); }
.table-row:hover { background: var(--paper); }
.table-row:last-child { border-bottom: none; }

.admin-table td { padding: 12px 16px; vertical-align: middle; }

.td-producto { display: flex; align-items: center; gap: 10px; }
.td-img      { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.td-nombre   { font-weight: 500; }
.td-precio   { font-weight: 600; }
.sin-stock   { color: #dc2626; font-weight: 600; }

.td-actions { display: flex; gap: 6px; }
.action-btn {
  padding: 6px 10px; background: transparent; border: 1px solid var(--border);
  border-radius: 6px; cursor: pointer; transition: var(--transition); font-size: 0.85rem;
}
.action-btn:hover       { background: var(--paper-warm); }
.action-btn.danger:hover { background: #fef2f2; border-color: #dc2626; }

.loading-row { text-align: center; padding: 32px; color: var(--ink-muted); }

.product-estado {
  font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em;
  text-transform: uppercase; padding: 3px 8px; border-radius: 100px;
}

@media (max-width: 640px) {
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .admin-actions { flex-direction: column; }
}
</style>
