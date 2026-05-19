import axios from 'axios'

const ADMIN_AUTH_STORAGE_KEY = 'barber-date-admin-auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

api.interceptors.request.use((config) => {
  const rawAuth = window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY)

  if (rawAuth) {
    const parsedAuth = JSON.parse(rawAuth)

    if (parsedAuth?.token) {
      config.headers.Authorization = `Bearer ${parsedAuth.token}`
    }
  }

  return config
})

export { ADMIN_AUTH_STORAGE_KEY }
