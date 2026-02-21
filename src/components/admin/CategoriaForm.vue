<template>
  <AppModal title="Nueva Categoría" @close="ui.cerrarModal()">
    <AppFormGroup label="Nombre *" for-id="c-nombre" :error="errors.nombre">
      <input id="c-nombre" v-model="form.nombre" class="form-control"
        aria-required="true" placeholder="Ej: Electrónica, Ropa…" />
    </AppFormGroup>

    <AppFormGroup label="Descripción" for-id="c-desc">
      <textarea id="c-desc" v-model="form.descripcion" class="form-control" rows="2"
        placeholder="Descripción opcional…"></textarea>
    </AppFormGroup>

    <AppFormGroup label="Categoría padre (opcional)" for-id="c-padre">
      <select id="c-padre" v-model="form.categoriaPadreId" class="form-control">
        <option value="">Ninguna (categoría raíz)</option>
        <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
      </select>
    </AppFormGroup>

    <template #actions>
      <button class="btn-form-secondary" @click="ui.cerrarModal()">Cancelar</button>
      <button class="btn-form-primary" @click="guardar" :disabled="guardando">
        {{ guardando ? 'Creando…' : 'Crear categoría' }}
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { reactive, ref } from 'vue'
import AppModal     from '@/components/shared/AppModal.vue'
import AppFormGroup from '@/components/shared/AppFormGroup.vue'
import { useCatalogoStore } from '@/stores/catalogo.js'
import { useUiStore }       from '@/stores/ui.js'
import { storeToRefs }      from 'pinia'

const ui       = useUiStore()
const catalogo = useCatalogoStore()
const { categorias } = storeToRefs(catalogo)
const guardando = ref(false)
const errors    = reactive({})

const form = reactive({ nombre: '', descripcion: '', categoriaPadreId: '' })

async function guardar() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.nombre.trim()) { errors.nombre = 'El nombre es obligatorio'; return }

  guardando.value = true
  try {
    await catalogo.crearCategoria({
      nombre: form.nombre,
      descripcion: form.descripcion,
      categoriaPadreId: form.categoriaPadreId || null
    })
    ui.toast('Categoría creada correctamente')
    ui.cerrarModal()
  } catch (e) {
    ui.toast(e.message || 'Error al crear la categoría', 'error')
  } finally {
    guardando.value = false
  }
}
</script>

<style scoped>
.form-control {
  width: 100%; padding: 10px 14px;
  border: 1px solid var(--border); border-radius: 8px;
  font-family: var(--font-body); font-size: 0.9rem;
  background: white; color: var(--ink); transition: var(--transition);
}
.form-control:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 3px var(--accent-light); }

.btn-form-primary {
  padding: 10px 24px; background: var(--accent); color: white;
  border: none; border-radius: 8px; cursor: pointer;
  font-family: var(--font-body); font-size: 0.9rem; font-weight: 500;
  transition: var(--transition);
}
.btn-form-primary:hover    { background: var(--accent-hover); }
.btn-form-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-form-secondary {
  padding: 10px 24px; background: transparent; color: var(--ink-soft);
  border: 1px solid var(--border); border-radius: 8px; cursor: pointer;
  font-family: var(--font-body); font-size: 0.9rem; cursor: pointer;
  transition: var(--transition);
}
.btn-form-secondary:hover { background: var(--paper-warm); }
</style>
