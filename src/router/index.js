import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useUiStore }   from '@/stores/ui.js'

const routes = [
  {
    path: '/',
    name: 'catalogo',
    component: () => import('@/views/CatalogoView.vue'),
    meta: { title: 'Catálogo de Productos' }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminView.vue'),
    meta: {
      title:        'Panel de Administración',
      requiresAuth: true,
      roles:        ['ADMIN', 'EDITOR'],
      // Mensaje personalizado si no tiene acceso
      mensajeSinAcceso: 'Necesitas iniciar sesión con una cuenta de administrador o editor.'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Página no encontrada' }
  }
]

const router = createRouter({
  history: createWebHistory('#'),
  routes,
  scrollBehavior: (to, from, savedPosition) => {
    // Restaurar posición al usar botón "atrás"
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  }
})

// ── Guard de navegación ──────────────────────────────────────────────────────
router.beforeEach((to, from) => {
  const auth = useAuthStore()
  const ui   = useUiStore()

  // Actualizar título del documento (accesibilidad: lectores de pantalla lo anuncian)
  document.title = `${to.meta.title || 'Página'} — Arkive`

  // Ruta que requiere autenticación
  if (to.meta.requiresAuth && !auth.estaLogueado) {
    ui.toast(to.meta.mensajeSinAcceso || 'Debes iniciar sesión para acceder a esta sección.', 'error')
    // Abrir modal de login automáticamente
    ui.abrirModal('auth', { tab: 'login' })
    return { name: 'catalogo' }
  }

  // Ruta que requiere un rol específico
  if (to.meta.roles && !to.meta.roles.includes(auth.usuario?.rol)) {
    ui.toast('No tienes permisos para acceder a esta sección.', 'error')
    return { name: 'catalogo' }
  }
})

// ── Anunciar cambios de ruta a lectores de pantalla ──────────────────────────
router.afterEach((to) => {
  // Mover el foco al main-content tras la navegación
  const main = document.getElementById('main-content')
  if (main) {
    main.setAttribute('tabindex', '-1')
    main.focus({ preventScroll: true })
    // Limpiar tabindex tras el foco para no afectar la navegación normal
    setTimeout(() => main.removeAttribute('tabindex'), 500)
  }
})

export default router
