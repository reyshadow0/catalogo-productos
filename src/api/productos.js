import client from './client.js'

export const productosApi = {
  /**
   * Listar productos con filtros y paginación.
   * @param {Object} params - { nombre, categoriaId, estado, precioMin, precioMax, page, size, sort }
   */
  listar(params = {}) {
    return client.get('/productos', { params })
  },

  obtenerPorId(id) {
    return client.get(`/productos/${id}`)
  },

  crear(payload) {
    return client.post('/productos', payload)
  },

  actualizar(id, payload) {
    return client.put(`/productos/${id}`, payload)
  },

  cambiarEstado(id, estado) {
    return client.patch(`/productos/${id}/estado`, null, { params: { estado } })
  },

  eliminar(id) {
    return client.delete(`/productos/${id}`)
  }
}
