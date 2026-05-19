import { createContext, useContext, useMemo, useState } from 'react'
import { ADMIN_AUTH_STORAGE_KEY } from '../lib/api.js'

const AuthContext = createContext(null)

function readStoredAuth() {
  const rawAuth = window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY)

  if (!rawAuth) {
    return { token: null, admin: null }
  }

  try {
    return JSON.parse(rawAuth)
  } catch {
    window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY)
    return { token: null, admin: null }
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(readStoredAuth)

  const login = (payload) => {
    const nextState = {
      token: payload.token,
      admin: {
        name: payload.adminName,
        role: payload.role,
        expiresInMinutes: payload.expiresInMinutes,
      },
    }

    window.localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(nextState))
    setAuthState(nextState)
  }

  const logout = () => {
    window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY)
    setAuthState({ token: null, admin: null })
  }

  const value = useMemo(
    () => ({
      token: authState.token,
      admin: authState.admin,
      isAuthenticated: Boolean(authState.token),
      login,
      logout,
    }),
    [authState],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
