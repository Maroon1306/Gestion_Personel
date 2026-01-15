"use client"

import { createContext, useState, useCallback, useEffect, type ReactNode } from "react"

interface User {
  id: number
  matricule: string
  email: string
  name: string
  role: string
  active: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (emailOrMatricule: string, password: string, useCookie?: boolean) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

function backendUrl(path = "") {
  return `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}${path}`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // restore session: prefer local token, otherwise try cookie-based /me
  useEffect(() => {
    async function restore() {
      const saved = localStorage.getItem("auth")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.user) setUser(parsed.user)
          setMounted(true)
          return
        } catch {
          localStorage.removeItem("auth")
        }
      }

      // try cookie-based session
      try {
        const res = await fetch(backendUrl('/auth/me'), { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          localStorage.setItem('auth', JSON.stringify({ user: data.user }))
        }
      } catch (e) {
        // ignore
      }

      setMounted(true)
    }

    restore()
  }, [])

  const login = useCallback(async (emailOrMatricule: string, password: string, useCookie = true) => {
    setIsLoading(true)
    setError(null)
    try {
      const body = { emailOrMatricule, password, useCookie }
      const res = await fetch(backendUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: useCookie ? 'include' : 'omit',
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Erreur lors de la connexion')
        setIsLoading(false)
        return
      }

      // if cookie mode, backend returns { user } and cookie is set; if not, backend returns { user, token }
      if (data.token) {
        localStorage.setItem('auth', JSON.stringify({ token: data.token, user: data.user }))
      } else {
        // cookie mode: still persist user for UI
        localStorage.setItem('auth', JSON.stringify({ user: data.user }))
      }

      setUser(data.user)
      setIsLoading(false)
    } catch (err: any) {
      setError('Erreur réseau')
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      // attempt server-side logout (will clear cookie if used)
      await fetch(backendUrl('/auth/logout'), { method: 'POST', credentials: 'include' })
    } catch {
      // ignore
    }
    setUser(null)
    localStorage.removeItem('auth')
  }, [])

  // helper to get Authorization header if token stored
  function getAuthHeader() {
    try {
      const saved = localStorage.getItem('auth')
      if (!saved) return undefined
      const parsed = JSON.parse(saved)
      if (parsed.token) return { Authorization: `Bearer ${parsed.token}` }
    } catch {
      return undefined
    }
    return undefined
  }

  // fetch wrapper that attaches Authorization when available and includes credentials for cookie auth
  const fetchWithAuth = useCallback(async (input: RequestInfo, init: RequestInit = {}) => {
    const headers = { ...(init.headers || {}), ...(getAuthHeader() || {}) }
    const opts: RequestInit = { ...init, headers, credentials: init.credentials ?? 'include' }
    return fetch(input, opts)
  }, [])

  if (!mounted) return null

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, login, logout, isAuthenticated: !!user, fetchWithAuth }}
    >
      {children}
    </AuthContext.Provider>
  )
}
