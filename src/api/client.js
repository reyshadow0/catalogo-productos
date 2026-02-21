import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// Interceptor: adjuntar JWT automáticamente
client.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor: manejo centralizado de errores
client.interceptors.response.use(
  res => res.data,
  err => {
    const mensaje = err.response?.data?.mensaje || 'Error en la petición'
    return Promise.reject(new Error(mensaje))
  }
)

export default client
