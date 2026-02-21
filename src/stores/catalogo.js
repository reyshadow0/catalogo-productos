import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { productosApi } from '@/api/productos.js'
import { categoriasApi } from '@/api/categorias.js'

export const useCatalogoStore = defineStore('catalogo', () => {
  // Productos
  const productos     = ref([])
  const totalProductos = ref(0)
  const totalPaginas  = ref(0)
  const paginaActual  = ref(0)
  const cargando      = ref(false)

  // Categorías
  const categorias    = ref([])

  // Filtros reactivos
  const filtros = reactive({
    nombre:      '',
    categoriaId: null,
    estado:      null,
    precioMin:   null,
    precioMax:   null,
    sort:        'fechaCreacion,desc',
    size:        12
  })

  // ===== CATEGORÍAS =====
  async function cargarCategorias() {
    try {
      categorias.value = await categoriasApi.listar()
    } catch (e) {
      console.error('Error cargando categorías', e)
    }
  }

  // ===== PRODUCTOS =====
  async function buscar(reiniciarPagina = false) {
    if (reiniciarPagina) paginaActual.value = 0
    cargando.value = true
    try {
      const params = {
        page: paginaActual.value,
        size: filtros.size,
        sort: filtros.sort
      }
      if (filtros.nombre)      params.nombre      = filtros.nombre
      if (filtros.categoriaId) params.categoriaId = filtros.categoriaId
      if (filtros.estado)      params.estado      = filtros.estado
      if (filtros.precioMin)   params.precioMin   = filtros.precioMin
      if (filtros.precioMax)   params.precioMax   = filtros.precioMax

      const data = await productosApi.listar(params)
      productos.value      = data.content
      totalProductos.value = data.totalElements
      totalPaginas.value   = data.totalPages
    } finally {
      cargando.value = false
    }
  }

  function cambiarPagina(pagina) {
    if (pagina < 0 || pagina >= totalPaginas.value) return
    paginaActual.value = pagina
    buscar()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function limpiarFiltros() {
    filtros.nombre      = ''
    filtros.categoriaId = null
    filtros.estado      = null
    filtros.precioMin   = null
    filtros.precioMax   = null
    buscar(true)
  }

  // ===== CRUD =====
  async function crearProducto(payload) {
    await productosApi.crear(payload)
    buscar()
  }

  async function actualizarProducto(id, payload) {
    await productosApi.actualizar(id, payload)
    buscar()
  }

  async function eliminarProducto(id) {
    await productosApi.eliminar(id)
    buscar()
  }

  async function crearCategoria(payload) {
    await categoriasApi.crear(payload)
    await cargarCategorias()
  }

  return {
    productos, totalProductos, totalPaginas, paginaActual, cargando,
    categorias, filtros,
    cargarCategorias, buscar, cambiarPagina, limpiarFiltros,
    crearProducto, actualizarProducto, eliminarProducto, crearCategoria
  }
})
