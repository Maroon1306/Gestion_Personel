"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error } = useAuth()
  const [formData, setFormData] = useState({
    emailOrMatricule: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(formData.emailOrMatricule, formData.password)
    
    const savedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null
    if (savedUser) {
      router.push("/dashboard")
    }
  }

  const handleDemoLogin = (role: string) => {
    const demoUsers: Record<string, { user: string; pass: string }> = {
      admin_user: { user: "admin@jirama.mg", pass: "admin123" },
      admin_rh: { user: "admin.rh@jirama.mg", pass: "admin123" },
      user: { user: "user@jirama.mg", pass: "user123" },
    }

    const creds = demoUsers[role]
    setFormData({ emailOrMatricule: creds.user, password: creds.pass })
    
    setTimeout(async () => {
      await login(creds.user, creds.pass)
      
      const savedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null
      if (savedUser) {
        router.push("/dashboard")
      }
    }, 100)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/25 mb-4">
              <span className="text-white text-3xl font-bold">JIRAMA</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Jiro sy Rano Malagasy
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">Gestion de Personnel & Pointage</p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bienvenue</h2>
            <p className="text-gray-600 dark:text-gray-400">Connectez-vous à votre espace personnel</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email ou Matricule
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  name="emailOrMatricule"
                  placeholder="admin@jirama.mg"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 
                           bg-white dark:bg-gray-900 text-gray-900 dark:text-white 
                           placeholder:text-gray-500 dark:placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                           transition-all duration-200"
                  value={formData.emailOrMatricule}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 
                           bg-white dark:bg-gray-900 text-gray-900 dark:text-white 
                           placeholder:text-gray-500 dark:placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                           transition-all duration-200"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5"
            >
              <LogIn className="w-5 h-5" />
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link
              href="/forgot-password"
              className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Accès rapide</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { role: "admin_rh", label: "Admin RH", color: "from-orange-500 to-amber-500" },
              { role: "admin_user", label: "Admin Utilisateurs", color: "from-blue-500 to-cyan-500" },
              { role: "user", label: "Employé Standard", color: "from-emerald-500 to-green-500" },
            ].map((account) => (
              <button
                key={account.role}
                onClick={() => handleDemoLogin(account.role)}
                disabled={isLoading}
                className={`w-full px-4 py-3 rounded-xl bg-gradient-to-r ${account.color} text-white 
                          hover:shadow-lg transition-all duration-300 hover:scale-[1.02] 
                          disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium`}
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-8">
          © 2026 JIRAMA - Jiro sy Rano Malagasy. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}