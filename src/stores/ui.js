import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // Toasts
  const toasts = ref([])

  function toast(mensaje, tipo = 'success', duracion = 3500) {
    const id = Date.now()
    toasts.value.push({ id, mensaje, tipo })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duracion)
  }

  // Modal activo: null | 'detalle' | 'form' | 'auth' | 'categoria'
  const modalActivo = ref(null)
  const modalData   = ref(null)

  function abrirModal(tipo, data = null) {
    modalActivo.value = tipo
    modalData.value   = data
  }

  function cerrarModal() {
    modalActivo.value = null
    modalData.value   = null
  }

  return { toasts, toast, modalActivo, modalData, abrirModal, cerrarModal }
})
