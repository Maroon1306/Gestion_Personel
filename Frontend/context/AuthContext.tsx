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
  login: (emailOrMatricule: string, password: string) => void
  logout: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

const MOCK_USERS: Record<string, any> = {
  "admin@jirama.mg": {
    id: 1,
    matricule: "ADMIN001",
    email: "admin@jirama.mg",
    name: "Admin Utilisateurs",
    role: "ADMIN_USER",
    active: true,
  },
  "admin.rh@jirama.mg": {
    id: 2,
    matricule: "ADMIN002",
    email: "admin.rh@jirama.mg",
    name: "Admin RH",
    role: "ADMIN_RH",
    active: true,
  },
  "user@jirama.mg": {
    id: 3,
    matricule: "USER001",
    email: "user@jirama.mg",
    name: "Utilisateur Standard",
    role: "USER",
    active: true,
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem("user")
      }
    }
    setMounted(true)
  }, [])

  const login = useCallback((emailOrMatricule: string, password: string) => {
    setIsLoading(true)
    setError(null)

    setTimeout(() => {
      const foundUser = Object.values(MOCK_USERS).find(
        (u: any) =>
          (u.email === emailOrMatricule || u.matricule === emailOrMatricule) && password === "admin123" && u.active,
      )

      if (foundUser) {
        setUser(foundUser)
        localStorage.setItem("user", JSON.stringify(foundUser))
        setIsLoading(false)
      } else {
        setError("Identifiants invalides")
        setIsLoading(false)
      }
    }, 500)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("user")
  }, [])

  if (!mounted) return null

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
