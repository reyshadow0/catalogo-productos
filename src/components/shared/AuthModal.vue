<template>
  <AppModal title="Bienvenido" @close="ui.cerrarModal()">

    <!-- Tabs login / registro -->
    <div class="auth-tabs" role="tablist" aria-label="Modo de acceso">
      <button
        v-for="t in TABS" :key="t.value"
        class="auth-tab"
        :class="{ active: tab === t.value }"
        role="tab"
        :aria-selected="tab === t.value"
        :aria-controls="`panel-${t.value}`"
        @click="cambiarTab(t.value)"
      >{{ t.label }}</button>
    </div>

    <!-- ── LOGIN ── -->
    <section v-if="tab === 'login'" :id="`panel-login`" role="tabpanel">
      <AppFormGroup label="Email" for-id="l-email" :error="errors.email">
        <input
          id="l-email"
          v-model.trim="form.email"
          type="email"
          class="form-control"
          :class="{ 'is-error': errors.email }"
          placeholder="tu@email.com"
          aria-required="true"
          autocomplete="email"
          @blur="validarCampo('email')"
        />
      </AppFormGroup>

      <AppFormGroup label="Contraseña" for-id="l-pass" :error="errors.password">
        <div class="input-password">
          <input
            id="l-pass"
            v-model="form.password"
            :type="verPassword ? 'text' : 'password'"
            class="form-control"
            :class="{ 'is-error': errors.password }"
            placeholder="••••••••"
            aria-required="true"
            autocomplete="current-password"
            @blur="validarCampo('password')"
          />
          <button
            type="button"
            class="toggle-pass"
            @click="verPassword = !verPassword"
            :aria-label="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            :aria-pressed="verPassword"
          >{{ verPassword ? '🙈' : '👁' }}</button>
        </div>
      </AppFormGroup>

      <p class="hint">
        <strong>Demo:</strong> admin@catalogo.com / Admin1234!
        &nbsp;·&nbsp; editor@catalogo.com / Editor1234!
      </p>
    </section>

    <!-- ── REGISTRO ── -->
    <section v-else :id="`panel-register`" role="tabpanel">
      <AppFormGroup label="Nombre completo" for-id="r-nombre" :error="errors.nombre">
        <input
          id="r-nombre"
          v-model.trim="form.nombre"
          type="text"
          class="form-control"
          :class="{ 'is-error': errors.nombre }"
          placeholder="Tu nombre y apellido"
          aria-required="true"
          autocomplete="name"
          @blur="validarCampo('nombre')"
        />
      </AppFormGroup>

      <AppFormGroup label="Email" for-id="r-email" :error="errors.email">
        <input
          id="r-email"
          v-model.trim="form.email"
          type="email"
          class="form-control"
          :class="{ 'is-error': errors.email }"
          placeholder="tu@email.com"
          aria-required="true"
          autocomplete="email"
          @blur="validarCampo('email')"
        />
      </AppFormGroup>

      <AppFormGroup
        label="Contraseña"
        for-id="r-pass"
        :error="errors.password"
        hint="Mínimo 8 caracteres, una mayúscula, una minúscula y un número."
      >
        <div class="input-password">
          <input
            id="r-pass"
            v-model="form.password"
            :type="verPassword ? 'text' : 'password'"
            class="form-control"
            :class="{ 'is-error': errors.password }"
            aria-required="true"
            autocomplete="new-password"
            @blur="validarCampo('password')"
            @input="calcularFuerzaPassword"
          />
          <button
            type="button"
            class="toggle-pass"
            @click="verPassword = !verPassword"
            :aria-label="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          >{{ verPassword ? '🙈' : '👁' }}</button>
        </div>
        <!-- Indicador de fuerza -->
        <div class="password-strength" v-if="form.password" aria-live="polite">
          <div class="strength-bar">
            <div class="strength-fill" :style="{ width: fuerzaPassword.pct + '%' }"
              :class="fuerzaPassword.clase"></div>
          </div>
          <span class="strength-label" :class="fuerzaPassword.clase">
            {{ fuerzaPassword.label }}
          </span>
        </div>
      </AppFormGroup>
    </section>

    <!-- Error general del servidor -->
    <div v-if="errorServidor" class="error-banner" role="alert" aria-live="assertive">
      <span class="error-icon" aria-hidden="true">⚠</span>
      {{ errorServidor }}
    </div>

    <template #actions>
      <button class="btn-form-secondary" @click="ui.cerrarModal()">Cancelar</button>
      <button
        class="btn-form-primary"
        @click="submit"
        :disabled="cargando"
        :aria-busy="cargando"
      >
        <span v-if="cargando" class="spinner" aria-hidden="true"></span>
        {{ cargando ? 'Procesando…' : (tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta') }}
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import AppModal     from '@/components/shared/AppModal.vue'
import AppFormGroup from '@/components/shared/AppFormGroup.vue'
import { useAuthStore }     from '@/stores/auth.js'
import { useUiStore }       from '@/stores/ui.js'
import { useCatalogoStore } from '@/stores/catalogo.js'

const auth     = useAuthStore()
const ui       = useUiStore()
const catalogo = useCatalogoStore()

const TABS = [
  { value: 'login',    label: 'Iniciar sesión' },
  { value: 'register', label: 'Registrarse'    }
]

const tab           = ref(ui.modalData?.tab || 'login')
const errorServidor = ref('')
const cargando      = ref(false)
const verPassword   = ref(false)

const form = reactive({ email: '', password: '', nombre: '' })
const errors = reactive({ email: '', password: '', nombre: '' })

const fuerzaPassword = ref({ pct: 0, label: '', clase: '' })

// Limpiar al cambiar de tab
function cambiarTab(nuevoTab) {
  tab.value = nuevoTab
  errorServidor.value = ''
  verPassword.value   = false
  Object.assign(form,   { email: '', password: '', nombre: '' })
  Object.assign(errors, { email: '', password: '', nombre: '' })
  fuerzaPassword.value = { pct: 0, label: '', clase: '' }
}

// ── Validación campo a campo ────────────────────────────────────────────────
function validarCampo(campo) {
  errors[campo] = ''

  if (campo === 'nombre' && tab.value === 'register') {
    if (!form.nombre.trim())          errors.nombre = 'El nombre es obligatorio.'
    else if (form.nombre.length < 2)  errors.nombre = 'El nombre debe tener al menos 2 caracteres.'
    else if (form.nombre.length > 100) errors.nombre = 'El nombre no puede superar los 100 caracteres.'
  }

  if (campo === 'email') {
    if (!form.email.trim())           errors.email = 'El email es obligatorio.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                      errors.email = 'El formato del email no es válido.'
  }

  if (campo === 'password') {
    if (!form.password)               errors.password = 'La contraseña es obligatoria.'
    else if (form.password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres.'
    else if (tab.value === 'register') {
      if (!/[A-Z]/.test(form.password)) errors.password = 'Debe incluir al menos una letra mayúscula.'
      else if (!/[a-z]/.test(form.password)) errors.password = 'Debe incluir al menos una letra minúscula.'
      else if (!/\d/.test(form.password))    errors.password = 'Debe incluir al menos un número.'
    }
  }
}

function validarTodo() {
  if (tab.value === 'register') validarCampo('nombre')
  validarCampo('email')
  validarCampo('password')
  return !errors.nombre && !errors.email && !errors.password
}

// ── Indicador de fuerza de contraseña ──────────────────────────────────────
function calcularFuerzaPassword() {
  const p = form.password
  let score = 0
  if (p.length >= 8)  score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[a-z]/.test(p)) score++
  if (/\d/.test(p))    score++
  if (/[^A-Za-z0-9]/.test(p)) score++

  if (score <= 2)      fuerzaPassword.value = { pct: 33,  label: 'Débil',  clase: 'debil' }
  else if (score <= 4) fuerzaPassword.value = { pct: 66,  label: 'Media',  clase: 'media' }
  else                 fuerzaPassword.value = { pct: 100, label: 'Fuerte', clase: 'fuerte' }
}

// ── Submit ──────────────────────────────────────────────────────────────────
async function submit() {
  errorServidor.value = ''
  if (!validarTodo()) return

  cargando.value = true
  try {
    if (tab.value === 'login') {
      await auth.login(form.email, form.password)
    } else {
      await auth.register(form.nombre, form.email, form.password)
    }
    ui.toast('¡Bienvenido, ' + auth.usuario.nombre + '!')
    ui.cerrarModal()
    catalogo.buscar()
  } catch (e) {
    errorServidor.value = e.message || 'Error de conexión. Inténtalo de nuevo.'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.auth-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  margin-bottom: 20px;
}
.auth-tab {
  flex: 1; padding: 10px; text-align: center; cursor: pointer;
  font-size: 0.9rem; font-weight: 500; color: var(--ink-muted);
  border: none; background: transparent;
  border-bottom: 2px solid transparent;
  font-family: var(--font-body); transition: var(--transition);
}
.auth-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

.hint { font-size: 0.8rem; color: var(--ink-muted); margin-top: 8px; line-height: 1.5; }

/* Campo con botón de mostrar/ocultar */
.input-password { position: relative; }
.input-password .form-control { padding-right: 44px; }
.toggle-pass {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; font-size: 1rem; padding: 4px;
  border-radius: 4px; line-height: 1;
}
.toggle-pass:hover { background: var(--paper-warm); }

/* Fuerza de contraseña */
.password-strength { margin-top: 8px; }
.strength-bar {
  height: 4px; background: var(--paper-warm);
  border-radius: 2px; overflow: hidden; margin-bottom: 4px;
}
.strength-fill { height: 100%; border-radius: 2px; transition: width 300ms ease; }
.strength-fill.debil  { background: #dc2626; }
.strength-fill.media  { background: var(--warning); }
.strength-fill.fuerte { background: var(--success); }
.strength-label { font-size: 0.78rem; font-weight: 600; }
.strength-label.debil  { color: #dc2626; }
.strength-label.media  { color: var(--warning); }
.strength-label.fuerte { color: var(--success); }

/* Banner de error servidor */
.error-banner {
  display: flex; align-items: flex-start; gap: 10px;
  background: #fef2f2; border: 1px solid #fecaca;
  color: #991b1b; border-radius: 8px;
  padding: 12px 14px; margin-top: 4px;
  font-size: 0.875rem; line-height: 1.5;
  animation: fadeIn 200ms ease;
}
.error-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }

/* Spinner en botón */
.spinner {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 600ms linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}
@keyframes spin { to { transform: rotate(360deg); } }

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

.btn-form-primary {
  padding: 10px 24px; background: var(--accent); color: white;
  border: none; border-radius: 8px;
  font-family: var(--font-body); font-size: 0.9rem; font-weight: 500;
  cursor: pointer; transition: var(--transition);
  display: flex; align-items: center; gap: 6px;
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
