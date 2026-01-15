"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, user } = useAuth()

  const [formData, setFormData] = useState({
    emailOrMatricule: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(formData.emailOrMatricule, formData.password)

    // after login, prefer context user; fall back to localStorage 'auth'
    const savedAuth = localStorage.getItem('auth')
    const savedUser = savedAuth ? JSON.parse(savedAuth).user : null

    if (user || savedUser) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* ===== PARTIE GAUCHE : LOGIN ===== */}
      <div className="flex items-center justify-center px-6 bg-white">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              JIRAMA
            </div>
          </div>

          <h1 className="text-center text-xl font-bold text-gray-800">
            JIRO SY RANO <span className="text-orange-500">MALAGASY</span>
          </h1>
          <p className="text-center text-xs text-gray-600 mb-6">
            Connectez-vous avec vos informations personnelles.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email / Matricule */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="emailOrMatricule"
                placeholder="Email ou Matricule"
                value={formData.emailOrMatricule}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border rounded text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Mot de passe */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-2 border rounded text-sm focus:border-orange-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>

            {/* Message erreur */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 p-2 rounded">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Bouton login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50"
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>

            {/* Mot de passe oublié */}
            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-xs text-orange-600 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* ===== PARTIE DROITE : IMAGE ===== */}
      <div
        className="hidden md:flex items-center justify-center bg-cover bg-center relative"
        style={{
          backgroundImage: "url('/solarpanel.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative text-white text-center px-6">
          <h2 className="text-2xl font-semibold mb-2">Bienvenue</h2>
          <p className="text-sm">
            Plateforme interne JIRAMA<br />
            Accès réservé au personnel autorisé.
          </p>

          <p className="text-xs text-gray-300 mt-10">
            © {new Date().getFullYear()} JIRAMA – Jiro sy Rano Malagasy<br />
            iStock – Credit: Santatra 
          </p>
        </div>
      </div>

    </div>
  )
}
