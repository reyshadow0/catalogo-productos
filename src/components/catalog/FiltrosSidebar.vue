<template>
  <aside aria-label="Filtros de productos">

    <!-- Categorías -->
    <div class="sidebar-section">
      <div class="sidebar-header">
        <span>Categorías</span>
        <button v-if="filtros.categoriaId" class="clear-btn" @click="limpiar('categoriaId')">Limpiar</button>
      </div>
      <div class="category-list" role="list">
        <div
          v-for="cat in categorias"
          :key="cat.id"
          class="category-item"
          :class="{ active: filtros.categoriaId === cat.id }"
          role="listitem"
          tabindex="0"
          :aria-pressed="filtros.categoriaId === cat.id"
          :aria-label="`Filtrar por ${cat.nombre}`"
          @click="toggle('categoriaId', cat.id)"
          @keydown.enter="toggle('categoriaId', cat.id)"
          @keydown.space.prevent="toggle('categoriaId', cat.id)"
        >
          <span class="category-dot" aria-hidden="true"></span>
          {{ cat.nombre }}
        </div>
      </div>
    </div>

    <!-- Precio -->
    <div class="sidebar-section">
      <div class="sidebar-header">Precio (USD)</div>
      <div class="price-range">
        <div class="price-inputs">
          <input
            v-model.number="filtros.precioMin"
            @change="catalogo.buscar(true)"
            type="number" class="price-input"
            placeholder="Mín" aria-label="Precio mínimo" min="0"
          />
          <input
            v-model.number="filtros.precioMax"
            @change="catalogo.buscar(true)"
            type="number" class="price-input"
            placeholder="Máx" aria-label="Precio máximo" min="0"
          />
        </div>
      </div>
    </div>

    <!-- Estado (solo admin/editor) -->
    <div class="sidebar-section" v-if="auth.esAdminOEditor">
      <div class="sidebar-header">Estado</div>
      <div class="estado-filters">
        <button
          v-for="est in ESTADOS"
          :key="est.value"
          class="estado-chip"
          :class="{ active: filtros.estado === est.value }"
          :aria-pressed="filtros.estado === est.value"
          @click="toggle('estado', est.value)"
        >
          <span class="dot" :class="`dot-${est.value}`" aria-hidden="true"></span>
          {{ est.label }}
        </button>
      </div>
    </div>

    <!-- Limpiar todo -->
    <button class="btn-limpiar-todo" @click="catalogo.limpiarFiltros()">
      Limpiar todos los filtros
    </button>

  </aside>
</template>

<script setup>
import { useCatalogoStore } from '@/stores/catalogo.js'
import { useAuthStore }     from '@/stores/auth.js'
import { storeToRefs }      from 'pinia'

const catalogo = useCatalogoStore()
const auth     = useAuthStore()
const { filtros, categorias } = storeToRefs(catalogo)

const ESTADOS = [
  { value: 'ACTIVO',   label: 'Activo' },
  { value: 'INACTIVO', label: 'Inactivo' },
  { value: 'BORRADOR', label: 'Borrador' }
]

function toggle(campo, valor) {
  filtros.value[campo] = filtros.value[campo] === valor ? null : valor
  catalogo.buscar(true)
}

function limpiar(campo) {
  filtros.value[campo] = null
  catalogo.buscar(true)
}
</script>

<style scoped>
.sidebar-section {
  background: var(--paper-card); border: 1px solid var(--border);
  border-radius: 12px; overflow: hidden; margin-bottom: 16px;
}

.sidebar-header {
  padding: 16px 20px; font-size: 0.75rem; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-muted);
  border-bottom: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
}

.clear-btn {
  font-size: 0.75rem; color: var(--accent); background: none;
  border: none; cursor: pointer; font-family: var(--font-body); font-weight: 500;
}

.category-list { padding: 8px; }

.category-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 8px; cursor: pointer;
  transition: var(--transition); font-size: 0.9rem; color: var(--ink-soft);
}
.category-item:hover { background: var(--paper-warm); }
.category-item.active { background: var(--accent-light); color: var(--accent); font-weight: 500; }

.category-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); flex-shrink: 0; }
.category-item.active .category-dot { background: var(--accent); }

.price-range   { padding: 16px 20px; }
.price-inputs  { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.price-input {
  padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;
  font-family: var(--font-body); font-size: 0.875rem;
  background: var(--paper); color: var(--ink); width: 100%;
}
.price-input:focus { border-color: var(--accent); outline: none; }

.estado-filters { padding: 8px; }
.estado-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 12px; border-radius: 8px; cursor: pointer;
  font-size: 0.85rem; width: 100%; border: none; background: transparent;
  font-family: var(--font-body); text-align: left; color: var(--ink-soft);
  transition: var(--transition); margin-bottom: 2px;
}
.estado-chip:hover { background: var(--paper-warm); }
.estado-chip.active { background: var(--accent-light); color: var(--accent); font-weight: 500; }

.dot           { width: 8px; height: 8px; border-radius: 50%; }
.dot-ACTIVO    { background: var(--success); }
.dot-INACTIVO  { background: var(--ink-muted); }
.dot-BORRADOR  { background: var(--warning); }

.btn-limpiar-todo {
  width: 100%; padding: 10px; border: 1px dashed var(--border);
  background: transparent; border-radius: 10px;
  color: var(--ink-muted); font-family: var(--font-body); font-size: 0.85rem;
  cursor: pointer; transition: var(--transition);
}
.btn-limpiar-todo:hover { border-color: var(--accent); color: var(--accent); }
</style>
