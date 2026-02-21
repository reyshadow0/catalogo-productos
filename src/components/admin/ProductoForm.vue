<template>
  <AppModal :title="producto ? 'Editar producto' : 'Nuevo producto'" @close="ui.cerrarModal()">

    <AppFormGroup label="Nombre *" for-id="f-nombre" :error="errors.nombre">
      <input
        id="f-nombre"
        v-model.trim="form.nombre"
        class="form-control"
        :class="{ 'is-error': errors.nombre, 'is-valid': touched.nombre && !errors.nombre }"
        placeholder="Nombre del producto"
        aria-required="true"
        maxlength="150"
        @blur="validar('nombre')"
      />
      <span class="char-count" aria-live="polite">{{ form.nombre.length }}/150</span>
    </AppFormGroup>

    <AppFormGroup label="Descripción" for-id="f-desc" :error="errors.descripcion">
      <textarea
        id="f-desc"
        v-model="form.descripcion"
        class="form-control"
        :class="{ 'is-error': errors.descripcion }"
        rows="3"
        placeholder="Descripción detallada del producto…"
        maxlength="2000"
        @blur="validar('descripcion')"
      ></textarea>
      <span class="char-count" aria-live="polite">{{ form.descripcion.length }}/2000</span>
    </AppFormGroup>

    <div class="form-grid">
      <AppFormGroup label="Precio (USD) *" for-id="f-precio" :error="errors.precio">
        <div class="input-prefix">
          <span class="prefix" aria-hidden="true">$</span>
          <input
            id="f-precio"
            v-model.number="form.precio"
            type="number"
            step="0.01"
            min="0.01"
            class="form-control with-prefix"
            :class="{ 'is-error': errors.precio, 'is-valid': touched.precio && !errors.precio }"
            aria-required="true"
            placeholder="0.00"
            @blur="validar('precio')"
          />
        </div>
      </AppFormGroup>

      <AppFormGroup label="Stock *" for-id="f-stock" :error="errors.stock">
        <input
          id="f-stock"
          v-model.number="form.stock"
          type="number"
          min="0"
          max="99999"
          class="form-control"
          :class="{ 'is-error': errors.stock, 'is-valid': touched.stock && !errors.stock }"
          aria-required="true"
          placeholder="0"
          @blur="validar('stock')"
        />
      </AppFormGroup>
    </div>

    <div class="form-grid">
      <AppFormGroup label="Categoría" for-id="f-cat">
        <select id="f-cat" v-model="form.categoriaId" class="form-control" aria-label="Seleccionar categoría">
          <option value="">— Sin categoría —</option>
          <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
        </select>
      </AppFormGroup>

      <AppFormGroup label="Estado" for-id="f-estado">
        <select id="f-estado" v-model="form.estado" class="form-control">
          <option value="BORRADOR">📝 Borrador</option>
          <option value="ACTIVO">✅ Activo</option>
          <option value="INACTIVO">⏸ Inactivo</option>
        </select>
      </AppFormGroup>
    </div>

    <AppFormGroup label="URL de imagen" for-id="f-img" :error="errors.imagenUrl">
      <input
        id="f-img"
        v-model.trim="form.imagenUrl"
        class="form-control"
        :class="{ 'is-error': errors.imagenUrl }"
        placeholder="https://ejemplo.com/imagen.jpg"
        type="url"
        @blur="validar('imagenUrl')"
      />
    </AppFormGroup>

    <AppFormGroup
      label="Texto alternativo (accesibilidad)"
      for-id="f-alt"
      :error="errors.imagenAlt"
      hint="Describe la imagen brevemente para usuarios con discapacidad visual (lectores de pantalla)."
    >
      <input
        id="f-alt"
        v-model.trim="form.imagenAlt"
        class="form-control"
        :class="{ 'is-error': errors.imagenAlt }"
        placeholder="Ej: Fotografía frontal del producto sobre fondo blanco"
        maxlength="200"
        @blur="validar('imagenAlt')"
      />
    </AppFormGroup>

    <!-- Errores del servidor -->
    <div v-if="errorServidor" class="error-banner" role="alert" aria-live="assertive">
      <span class="error-icon" aria-hidden="true">⚠</span>
      {{ errorServidor }}
    </div>

    <!-- Resumen de errores si intentó enviar con errores -->
    <div v-if="mostrarResumenErrores && tieneErrores" class="errors-summary" role="alert" aria-live="polite">
      <strong>Por favor, corrige los siguientes campos antes de continuar:</strong>
      <ul>
        <li v-for="(msg, campo) in erroresFiltrados" :key="campo">
          <a :href="`#f-${campo}`" @click.prevent="enfocarCampo(campo)">{{ msg }}</a>
        </li>
      </ul>
    </div>

    <template #actions>
      <button class="btn-form-secondary" @click="ui.cerrarModal()">Cancelar</button>
      <button
        class="btn-form-primary"
        @click="guardar"
        :disabled="guardando"
        :aria-busy="guardando"
      >
        <span v-if="guardando" class="spinner" aria-hidden="true"></span>
        {{ guardando ? 'Guardando…' : (producto ? 'Actualizar producto' : 'Crear producto') }}
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import AppModal     from '@/components/shared/AppModal.vue'
import AppFormGroup from '@/components/shared/AppFormGroup.vue'
import { useCatalogoStore } from '@/stores/catalogo.js'
import { useUiStore }       from '@/stores/ui.js'
import { storeToRefs }      from 'pinia'

const props   = defineProps({ producto: { type: Object, default: null } })
const ui      = useUiStore()
const catalogo = useCatalogoStore()
const { categorias } = storeToRefs(catalogo)

const guardando           = ref(false)
const errorServidor       = ref('')
const mostrarResumenErrores = ref(false)

// Inicializar form con valores del producto si existe
const form = reactive({
  nombre:      props.producto?.nombre              ?? '',
  descripcion: props.producto?.descripcion         ?? '',
  precio:      props.producto?.precio              ?? '',
  stock:       props.producto?.stock               ?? 0,
  estado:      props.producto?.estado              ?? 'BORRADOR',
  categoriaId: props.producto?.categoria?.id       ?? '',
  imagenUrl:   props.producto?.imagenes?.[0]?.url    ?? '',
  imagenAlt:   props.producto?.imagenes?.[0]?.altText ?? '',
})

const errors  = reactive({ nombre: '', descripcion: '', precio: '', stock: '', imagenUrl: '', imagenAlt: '' })
const touched = reactive({ nombre: false, descripcion: false, precio: false, stock: false, imagenUrl: false, imagenAlt: false })

// ── Validaciones individuales ───────────────────────────────────────────────
const REGLAS = {
  nombre(v)      {
    if (!v.trim())    return 'El nombre del producto es obligatorio.'
    if (v.length < 2) return 'El nombre debe tener al menos 2 caracteres.'
    if (v.length > 150) return 'El nombre no puede superar los 150 caracteres.'
    return ''
  },
  descripcion(v) {
    if (v.length > 2000) return 'La descripción no puede superar los 2000 caracteres.'
    return ''
  },
  precio(v)      {
    if (v === '' || v === null || v === undefined) return 'El precio es obligatorio.'
    if (isNaN(v) || Number(v) <= 0)               return 'El precio debe ser un número mayor a 0.'
    return ''
  },
  stock(v)       {
    if (v === '' || v === null || v === undefined) return 'El stock es obligatorio.'
    if (isNaN(v) || Number(v) < 0)                return 'El stock no puede ser negativo.'
    if (Number(v) > 99999)                        return 'El stock no puede superar las 99,999 unidades.'
    return ''
  },
  imagenUrl(v)   {
    if (!v) return ''
    try { new URL(v); return '' }
    catch { return 'La URL de la imagen no tiene un formato válido.' }
  },
  imagenAlt(v)   {
    if (v.length > 200) return 'El texto alternativo no puede superar los 200 caracteres.'
    return ''
  }
}

function validar(campo) {
  touched[campo] = true
  errors[campo]  = REGLAS[campo] ? REGLAS[campo](form[campo]) : ''
}

function validarTodo() {
  Object.keys(REGLAS).forEach(c => validar(c))
  return !tieneErrores.value
}

const tieneErrores      = computed(() => Object.values(errors).some(e => e))
const erroresFiltrados  = computed(() => {
  const res = {}
  Object.entries(errors).forEach(([k, v]) => { if (v) res[k] = v })
  return res
})

function enfocarCampo(campo) {
  const el = document.getElementById(`f-${campo}`)
  if (el) el.focus()
}

// ── Guardar ─────────────────────────────────────────────────────────────────
async function guardar() {
  errorServidor.value       = ''
  mostrarResumenErrores.value = true

  if (!validarTodo()) return

  guardando.value = true
  try {
    const payload = {
      nombre:      form.nombre,
      descripcion: form.descripcion,
      precio:      form.precio,
      stock:       Number(form.stock),
      estado:      form.estado,
      categoriaId: form.categoriaId || null,
      imagenes:    form.imagenUrl
        ? [{ url: form.imagenUrl, altText: form.imagenAlt || form.nombre, orden: 0 }]
        : []
    }

    if (props.producto) {
      await catalogo.actualizarProducto(props.producto.id, payload)
      ui.toast('Producto actualizado correctamente')
    } else {
      await catalogo.crearProducto(payload)
      ui.toast('Producto creado correctamente')
    }
    ui.cerrarModal()
  } catch (e) {
    errorServidor.value = e.message || 'Error al guardar el producto. Inténtalo de nuevo.'
  } finally {
    guardando.value = false
  }
}
</script>

<style scoped>
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.form-control {
  width: 100%; padding: 10px 14px;
  border: 1px solid var(--border); border-radius: 8px;
  font-family: var(--font-body); font-size: 0.9rem;
  background: white; color: var(--ink); transition: var(--transition);
}
.form-control:focus {
  border-color: var(--accent); outline: none;
  box-shadow: 0 0 0 3px var(--accent-light);
}
.form-control.is-error { border-color: #dc2626; background: #fff8f8; }
.form-control.is-valid { border-color: var(--success); }

/* Prefix $ en precio */
.input-prefix { position: relative; }
.prefix {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  color: var(--ink-muted); font-weight: 600; pointer-events: none;
}
.with-prefix { padding-left: 26px; }

/* Contador de caracteres */
.char-count {
  display: block; text-align: right; font-size: 0.75rem;
  color: var(--ink-muted); margin-top: 3px;
}

/* Error de servidor */
.error-banner {
  display: flex; align-items: flex-start; gap: 10px;
  background: #fef2f2; border: 1px solid #fecaca;
  color: #991b1b; border-radius: 8px;
  padding: 12px 14px; margin-top: 4px;
  font-size: 0.875rem; line-height: 1.5;
}
.error-icon { font-size: 1rem; flex-shrink: 0; }

/* Resumen de errores */
.errors-summary {
  background: #fef9c3; border: 1px solid #fde047;
  border-radius: 8px; padding: 12px 16px;
  font-size: 0.85rem; margin-top: 4px;
}
.errors-summary ul { margin-top: 6px; padding-left: 20px; }
.errors-summary li { margin-bottom: 3px; }
.errors-summary a  { color: #92400e; }

/* Spinner */
.spinner {
  display: inline-block; width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.4); border-top-color: white;
  border-radius: 50%; animation: spin 600ms linear infinite;
  margin-right: 6px; vertical-align: middle;
}
@keyframes spin { to { transform: rotate(360deg); } }

.btn-form-primary {
  padding: 10px 24px; background: var(--accent); color: white;
  border: none; border-radius: 8px;
  font-family: var(--font-body); font-size: 0.9rem; font-weight: 500;
  cursor: pointer; transition: var(--transition);
  display: flex; align-items: center;
}
.btn-form-primary:hover    { background: var(--accent-hover); }
.btn-form-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-form-secondary {
  padding: 10px 24px; background: transparent; color: var(--ink-soft);
  border: 1px solid var(--border); border-radius: 8px;
  font-family: var(--font-body); font-size: 0.9rem; font-weight: 500;
  cursor: pointer; transition: var(--transition);
}
.btn-form-secondary:hover { background: var(--paper-warm); }
</style>
