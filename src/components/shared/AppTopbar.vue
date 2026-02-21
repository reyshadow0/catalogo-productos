<template>
  <header class="topbar" role="banner">
    <div class="topbar-inner">

      <!-- Logo / Marca -->
      <RouterLink to="/" class="brand" aria-label="Arkive — Ir al inicio">
        Arkive<span class="brand-dot" aria-hidden="true">.</span>
      </RouterLink>

      <!-- Búsqueda -->
      <div class="search-wrap" role="search">
        <label for="busqueda-global" class="sr-only">Buscar productos en el catálogo</label>
        <input
          id="busqueda-global"
          v-model="catalogo.filtros.nombre"
          @input="debouncedBuscar"
          type="search"
          class="search-input"
          placeholder="Buscar productos…"
          autocomplete="off"
        />
        <span class="search-icon" aria-hidden="true">🔍</span>
      </div>

      <!-- Navegación principal -->
      <nav class="topbar-nav" aria-label="Navegación principal">

        <!-- Enlace admin (solo para admin/editor) -->
        <RouterLink
          v-if="auth.esAdminOEditor"
          to="/admin"
          class="btn-nav"
          :aria-current="$route.name === 'admin' ? 'page' : undefined"
        >
          ⚙ Panel Admin
        </RouterLink>

        <!-- Sin sesión -->
        <template v-if="!auth.estaLogueado">
          <button
            class="btn-secondary"
            @click="ui.abrirModal('auth', { tab: 'login' })"
            aria-haspopup="dialog"
          >Entrar</button>
          <button
            class="btn-primary"
            @click="ui.abrirModal('auth', { tab: 'register' })"
            aria-haspopup="dialog"
          >Registrarse</button>
        </template>

        <!-- Con sesión activa -->
        <template v-else>
          <div
            class="user-chip"
            role="status"
            :aria-label="`Sesión activa: ${auth.usuario.nombre}, rol ${auth.usuario.rol}`"
          >
            <span class="user-avatar" aria-hidden="true">
              {{ auth.usuario.nombre.charAt(0).toUpperCase() }}
            </span>
            <span class="user-name">{{ auth.usuario.nombre }}</span>
            <span class="role-badge" :class="`role-${auth.usuario.rol}`">
              {{ auth.usuario.rol }}
            </span>
          </div>
          <button
            class="btn-icon"
            @click="handleLogout"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >🚪</button>
        </template>

      </nav>
    </div>

    <!-- Modal de Auth (montado dentro del header para semántica) -->
    <AuthModal v-if="ui.modalActivo === 'auth'" />
  </header>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router'
import AuthModal from '@/components/shared/AuthModal.vue'
import { useCatalogoStore } from '@/stores/catalogo.js'
import { useAuthStore }     from '@/stores/auth.js'
import { useUiStore }       from '@/stores/ui.js'

const catalogo = useCatalogoStore()
const auth     = useAuthStore()
const ui       = useUiStore()
const $route   = useRoute()

let timeout = null
function debouncedBuscar() {
  clearTimeout(timeout)
  timeout = setTimeout(() => catalogo.buscar(true), 380)
}

function handleLogout() {
  auth.logout()
  ui.toast('Has cerrado sesión correctamente.')
  catalogo.buscar()
}
</script>

<style scoped>
.topbar {
  background: var(--ink);
  position: sticky; top: 0; z-index: 100;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.topbar-inner {
  max-width: 1280px; margin: 0 auto;
  padding: 0 24px; height: 64px;
  display: flex; align-items: center; gap: 20px;
}

/* Marca */
.brand {
  font-family: var(--font-display);
  font-size: 1.35rem;
  color: var(--paper);
  text-decoration: none;
  white-space: nowrap; flex-shrink: 0;
  letter-spacing: -0.01em;
}
.brand-dot { color: var(--accent); }

/* Búsqueda */
.search-wrap { flex: 1; max-width: 420px; position: relative; }

.search-input {
  width: 100%; padding: 10px 40px 10px 16px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 100px;
  color: var(--paper); font-family: var(--font-body); font-size: 0.9rem;
  transition: var(--transition);
}
.search-input::placeholder { color: rgba(255,255,255,0.4); }
.search-input:focus {
  background: rgba(255,255,255,0.14);
  border-color: rgba(255,255,255,0.35);
  outline: none;
}

.search-icon {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  color: rgba(255,255,255,0.4); pointer-events: none; font-size: 0.95rem;
}

/* Nav */
.topbar-nav { margin-left: auto; display: flex; align-items: center; gap: 8px; }

.btn-nav {
  padding: 8px 14px; border-radius: 8px;
  color: rgba(255,255,255,0.7); text-decoration: none;
  font-size: 0.875rem; font-family: var(--font-body);
  transition: var(--transition);
}
.btn-nav:hover, .btn-nav[aria-current="page"] {
  color: white; background: rgba(255,255,255,0.1);
}

.btn-primary {
  padding: 9px 20px; background: var(--accent); color: white;
  border: none; border-radius: 100px;
  font-family: var(--font-body); font-size: 0.875rem; font-weight: 500;
  cursor: pointer; transition: var(--transition);
}
.btn-primary:hover { background: var(--accent-hover); }

.btn-secondary {
  padding: 9px 20px; background: transparent; color: rgba(255,255,255,0.8);
  border: 1px solid rgba(255,255,255,0.2); border-radius: 100px;
  font-family: var(--font-body); font-size: 0.875rem; font-weight: 500;
  cursor: pointer; transition: var(--transition);
}
.btn-secondary:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.4); }

/* Chip de usuario */
.user-chip {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 12px 5px 5px;
  background: rgba(255,255,255,0.1);
  border-radius: 100px;
  color: white;
}
.user-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 700;
  flex-shrink: 0;
}
.user-name { font-size: 0.85rem; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.role-badge {
  font-size: 0.68rem; padding: 2px 7px; border-radius: 100px;
  font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
}
.role-ADMIN    { background: var(--accent); }
.role-EDITOR   { background: #2563eb; }
.role-VISITANTE { background: #6b7280; }

.btn-icon {
  width: 38px; height: 38px; border: none; background: transparent;
  color: rgba(255,255,255,0.6); border-radius: 50%; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; transition: var(--transition);
}
.btn-icon:hover { background: rgba(255,255,255,0.1); color: white; }

/* Pantallas pequeñas */
@media (max-width: 640px) {
  .topbar-inner { padding: 0 16px; gap: 12px; }
  .search-wrap  { display: none; }
  .user-name    { display: none; }
}

/* Accesibilidad */
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
</style>
