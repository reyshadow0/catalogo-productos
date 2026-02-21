import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth.js'

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref(null)

  const esAdmin        = computed(() => usuario.value?.rol === 'ADMIN')
  const esEditor       = computed(() => usuario.value?.rol === 'EDITOR')
  const esAdminOEditor = computed(() => esAdmin.value || esEditor.value)
  const estaLogueado   = computed(() => !!usuario.value)

  async function login(email, password) {
    const data = await authApi.login({ email, password })
    _guardarSesion(data)
  }

  async function register(nombre, email, password) {
    const data = await authApi.register({ nombre, email, password })
    _guardarSesion(data)
  }

  function logout() {
    usuario.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    localStorage.removeItem('tokenExpira')
  }

  function restaurarSesion() {
    const token    = localStorage.getItem('token')
    const raw      = localStorage.getItem('usuario')
    const expiraEn = localStorage.getItem('tokenExpira')

    if (!token || !raw) return

    // Verificar expiración
    if (expiraEn && Number(expiraEn) < Date.now()) {
      logout()
      return
    }

    try {
      usuario.value = JSON.parse(raw)
    } catch {
      logout()
    }
  }

  function _guardarSesion(data) {
    localStorage.setItem('token',       data.token)
    localStorage.setItem('tokenExpira', String(data.expiraEn))
    const u = { nombre: data.nombre, email: data.email, rol: data.rol }
    localStorage.setItem('usuario', JSON.stringify(u))
    usuario.value = u
  }

  return {
    usuario, esAdmin, esEditor, esAdminOEditor, estaLogueado,
    login, register, logout, restaurarSesion
  }
})
