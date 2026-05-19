import { createContext, useContext, useMemo, useState } from 'react'

const CLIENT_STORAGE_KEY = 'barber-date-client-session'
const ClientSessionContext = createContext(null)

function readStoredClient() {
  const rawClient = window.sessionStorage.getItem(CLIENT_STORAGE_KEY)

  if (!rawClient) {
    return { name: '', phone: '' }
  }

  try {
    return JSON.parse(rawClient)
  } catch {
    window.sessionStorage.removeItem(CLIENT_STORAGE_KEY)
    return { name: '', phone: '' }
  }
}

export function ClientSessionProvider({ children }) {
  const [clientProfile, setClientProfile] = useState(readStoredClient)

  const saveClientProfile = (profile) => {
    const nextProfile = {
      name: profile.name.trim(),
      phone: profile.phone.trim(),
    }

    window.sessionStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(nextProfile))
    setClientProfile(nextProfile)
  }

  const clearClientProfile = () => {
    window.sessionStorage.removeItem(CLIENT_STORAGE_KEY)
    setClientProfile({ name: '', phone: '' })
  }

  const value = useMemo(
    () => ({
      clientProfile,
      hasClientProfile: Boolean(clientProfile.name && clientProfile.phone),
      saveClientProfile,
      clearClientProfile,
    }),
    [clientProfile],
  )

  return <ClientSessionContext.Provider value={value}>{children}</ClientSessionContext.Provider>
}

export function useClientSession() {
  const context = useContext(ClientSessionContext)

  if (!context) {
    throw new Error('useClientSession must be used within ClientSessionProvider')
  }

  return context
}
