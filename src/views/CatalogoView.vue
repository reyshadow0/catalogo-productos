<template>
  <div class="layout">
    <!-- Sidebar filtros -->
    <FiltrosSidebar class="sidebar" />

    <!-- Contenido principal -->
    <main role="main" aria-label="Catálogo de productos">

      <!-- Header de sección -->
      <div class="main-header">
        <div>
          <h1 class="main-title">{{ tituloSeccion }}</h1>
          <p class="main-count" aria-live="polite">
            {{ cargando ? 'Cargando…' : `${totalProductos} productos encontrados` }}
          </p>
        </div>

        <div class="view-controls" role="toolbar" aria-label="Controles de vista">
          <button class="view-btn" :class="{ active: vista === 'grid' }"
            @click="vista = 'grid'" :aria-pressed="vista === 'grid'" aria-label="Vista cuadrícula">⊞</button>
          <button class="view-btn" :class="{ active: vista === 'list' }"
            @click="vista = 'list'" :aria-pressed="vista === 'list'" aria-label="Vista lista">≡</button>
          <select class="sort-select" v-model="filtros.sort" @change="catalogo.buscar(true)" aria-label="Ordenar productos">
            <option value="fechaCreacion,desc">Más recientes</option>
            <option value="precio,asc">Precio: menor a mayor</option>
            <option value="precio,desc">Precio: mayor a menor</option>
            <option value="nombre,asc">Nombre A-Z</option>
          </select>
        </div>
      </div>

      <!-- Skeleton loader -->
      <div v-if="cargando" :class="vista === 'grid' ? 'products-grid' : 'products-list'"
        aria-busy="true" aria-label="Cargando productos">
        <div v-for="n in 8" :key="n" class="skeleton skeleton-card"></div>
      </div>

      <!-- Vista grid -->
      <div v-else-if="vista === 'grid' && productos.length" class="products-grid" role="list">
        <ProductCard
          v-for="p in productos"
          :key="p.id"
          :producto="p"
          @ver="abrirDetalle"
        />
      </div>

      <!-- Vista lista -->
      <div v-else-if="vista === 'list' && productos.length" class="products-list" role="list">
        <ProductListItem
          v-for="p in productos"
          :key="p.id"
          :producto="p"
          @ver="abrirDetalle"
        />
      </div>

      <!-- Estado vacío -->
      <div v-else-if="!cargando" class="empty-state" role="status">
        <div class="empty-icon" aria-hidden="true">🔍</div>
        <h2 class="empty-title">Sin resultados</h2>
        <p>Intenta con otros filtros o términos de búsqueda.</p>
        <button class="btn-limpiar" @click="catalogo.limpiarFiltros()">Limpiar filtros</button>
      </div>

      <!-- Paginación -->
      <nav v-if="totalPaginas > 1" class="pagination" aria-label="Paginación de productos">
        <button class="page-btn" @click="catalogo.cambiarPagina(paginaActual - 1)"
          :disabled="paginaActual === 0" aria-label="Página anterior">‹</button>
        <button
          v-for="p in paginasVisibles"
          :key="p"
          class="page-btn"
          :class="{ active: p === paginaActual }"
          @click="catalogo.cambiarPagina(p)"
          :aria-label="`Página ${p + 1}`"
          :aria-current="p === paginaActual ? 'page' : undefined"
        >{{ p + 1 }}</button>
        <button class="page-btn" @click="catalogo.cambiarPagina(paginaActual + 1)"
          :disabled="paginaActual >= totalPaginas - 1" aria-label="Página siguiente">›</button>
      </nav>

    </main>
  </div>

  <!-- FAB: Nuevo producto (admin/editor) -->
  <div v-if="auth.esAdminOEditor" class="admin-fab">
    <button class="fab" @click="ui.abrirModal('form', null)" aria-label="Crear nuevo producto" title="Nuevo producto">+</button>
  </div>

  <!-- Modal detalle -->
  <ProductoDetalle v-if="ui.modalActivo === 'detalle'" />

  <!-- Modal formulario -->
  <ProductoForm v-if="ui.modalActivo === 'form'" :producto="ui.modalData" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import FiltrosSidebar  from '@/components/catalog/FiltrosSidebar.vue'
import ProductCard     from '@/components/catalog/ProductCard.vue'
import ProductListItem from '@/components/catalog/ProductListItem.vue'
import ProductoDetalle from '@/components/catalog/ProductoDetalle.vue'
import ProductoForm    from '@/components/admin/ProductoForm.vue'
import { useCatalogoStore } from '@/stores/catalogo.js'
import { useAuthStore }     from '@/stores/auth.js'
import { useUiStore }       from '@/stores/ui.js'
import { productosApi }     from '@/api/productos.js'

const catalogo = useCatalogoStore()
const auth     = useAuthStore()
const ui       = useUiStore()

const { productos, totalProductos, totalPaginas, paginaActual, cargando, filtros } = storeToRefs(catalogo)
const vista = ref('grid')

const tituloSeccion = computed(() => {
  if (filtros.value.nombre) return `Resultados para "${filtros.value.nombre}"`
  if (filtros.value.categoriaId) {
    const cat = catalogo.categorias.find(c => c.id === filtros.value.categoriaId)
    return cat?.nombre || 'Catálogo'
  }
  return 'Catálogo'
})

const paginasVisibles = computed(() => {
  const pages = [], rango = 2
  for (let i = Math.max(0, paginaActual.value - rango); i <= Math.min(totalPaginas.value - 1, paginaActual.value + rango); i++) {
    pages.push(i)
  }
  return pages
})

async function abrirDetalle(id) {
  ui.abrirModal('detalle', null)
  try {
    const detalle = await productosApi.obtenerPorId(id)
    ui.abrirModal('detalle', detalle)
  } catch {
    ui.toast('Error al cargar el producto', 'error')
    ui.cerrarModal()
  }
}

onMounted(async () => {
  await catalogo.cargarCategorias()
  catalogo.buscar()
})
</script>

<style scoped>
.layout {
  max-width: 1280px; margin: 0 auto; padding: 32px 24px;
  display: grid; grid-template-columns: 260px 1fr; gap: 32px; align-items: start;
}

.sidebar { position: sticky; top: 80px; }

.main-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.main-title  { font-family: var(--font-display); font-size: 2rem; line-height: 1.2; }
.main-count  { color: var(--ink-muted); font-size: 0.875rem; margin-top: 4px; }

.view-controls { display: flex; align-items: center; gap: 8px; }

.view-btn {
  width: 36px; height: 36px; border: 1px solid var(--border);
  background: transparent; border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--ink-muted); font-size: 1rem; transition: var(--transition);
}
.view-btn.active, .view-btn:hover { background: var(--ink); color: white; border-color: var(--ink); }

.sort-select {
  padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;
  font-family: var(--font-body); font-size: 0.875rem;
  background: white; color: var(--ink); cursor: pointer;
}

.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
.products-list { display: flex; flex-direction: column; gap: 12px; }

.skeleton-card { height: 300px; border-radius: 12px; }

.empty-state { text-align: center; padding: 80px 24px; color: var(--ink-muted); grid-column: 1/-1; }
.empty-icon  { font-size: 4rem; margin-bottom: 16px; opacity: 0.4; }
.empty-title { font-family: var(--font-display); font-size: 1.4rem; color: var(--ink-soft); margin-bottom: 8px; }
.btn-limpiar {
  margin-top: 16px; padding: 10px 24px; background: var(--ink); color: white;
  border: none; border-radius: 8px; cursor: pointer; font-family: var(--font-body);
  transition: var(--transition);
}
.btn-limpiar:hover { background: var(--ink-soft); }

.pagination { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 40px; }
.page-btn {
  min-width: 38px; height: 38px; border: 1px solid var(--border);
  background: var(--paper-card); border-radius: 8px; cursor: pointer;
  font-family: var(--font-body); font-size: 0.875rem; color: var(--ink-soft);
  padding: 0 10px; transition: var(--transition);
}
.page-btn:hover  { border-color: var(--ink); color: var(--ink); }
.page-btn.active { background: var(--ink); color: white; border-color: var(--ink); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.admin-fab { position: fixed; bottom: 28px; left: 28px; z-index: 100; }
.fab {
  width: 52px; height: 52px; border-radius: 50%; background: var(--ink); color: white;
  border: none; cursor: pointer; font-size: 1.3rem;
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-lg); transition: var(--transition);
}
.fab:hover { background: var(--accent); transform: scale(1.05); }

@media (max-width: 900px) {
  .layout  { grid-template-columns: 1fr; }
  .sidebar { position: static; }
}
@media (max-width: 640px) {
  .layout         { padding: 16px; }
  .products-grid  { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
}
</style>
