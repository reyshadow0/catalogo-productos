import client from './client.js'

export const categoriasApi = {
  listar()         { return client.get('/categorias') },
  crear(payload)   { return client.post('/categorias', payload) },
  actualizar(id, payload) { return client.put(`/categorias/${id}`, payload) },
  eliminar(id)     { return client.delete(`/categorias/${id}`) }
}
