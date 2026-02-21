import client from './client.js'

export const authApi = {
  login(payload)    { return client.post('/auth/login', payload) },
  register(payload) { return client.post('/auth/register', payload) }
}
