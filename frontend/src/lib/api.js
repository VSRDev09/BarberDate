import axios from 'axios'

const ADMIN_AUTH_STORAGE_KEY = 'barber-date-admin-auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

export function clearAdminSession() {
  window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY)
}

api.interceptors.request.use((config) => {
  const isAdminRequest =
    config.url?.startsWith('/admin')

  if (!isAdminRequest) {
    return config
  }

  const rawAuth = window.localStorage.getItem(
    ADMIN_AUTH_STORAGE_KEY
  )

  if (rawAuth) {
    try {
      const parsedAuth = JSON.parse(rawAuth)

      if (parsedAuth?.token) {
        config.headers.Authorization =
          `Bearer ${parsedAuth.token}`
      }
    } catch {
      clearAdminSession()
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status

    const isAdminRequest =
      error.config?.url?.startsWith('/admin')

    if (
      isAdminRequest &&
      (status === 401 || status === 403)
    ) {

      clearAdminSession()

      window.location.href =
        '/barbeiro/login?expired=true'
    }

    return Promise.reject(error)
  }
)

export { ADMIN_AUTH_STORAGE_KEY }
