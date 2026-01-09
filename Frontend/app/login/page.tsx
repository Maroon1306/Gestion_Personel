"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error } = useAuth()
  const [formData, setFormData] = useState({
    emailOrMatricule: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Safe wrapper to call login whether it's async or sync
  const callLogin = async (identifier: string, pwd: string) => {
    try {
      const result = login ? login(identifier, pwd) : null
      // If login returned a Promise, await it
      if (result && typeof (result as Promise<any>)?.then === "function") {
        const resolved = await (result as Promise<any>)
        return resolved
      }
      // otherwise return the sync result (could be boolean or undefined)
      return result
    } catch (err) {
      // let useAuth error state handle message; still return falsy
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // call login and wait if needed
    await callLogin(formData.emailOrMatricule, formData.password)

    // reliable check: prefer context user if available, fallback to localStorage
    const savedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null
    if (savedUser) {
      router.push("/dashboard")
      return
    }

    // If login is synchronous and sets context but not localStorage, give a tiny grace
    setTimeout(() => {
      const saved = typeof window !== "undefined" ? localStorage.getItem("user") : null
      if (saved) router.push("/dashboard")
    }, 250)
  }

  const handleDemoLogin = async (role: string) => {
    const demoUsers: Record<string, { user: string; pass: string }> = {
      admin_user: { user: "admin@jirama.mg", pass: "admin123" },
      admin_rh: { user: "admin.rh@jirama.mg", pass: "admin123" },
      user: { user: "user@jirama.mg", pass: "user123" },
    }

    const creds = demoUsers[role]
    setFormData({ emailOrMatricule: creds.user, password: creds.pass })

    // small delay to update inputs visually, then call login reliably
    setTimeout(async () => {
      await callLogin(creds.user, creds.pass)

      const savedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null
      if (savedUser) {
        router.push("/dashboard")
        return
      }

      setTimeout(() => {
        const saved = typeof window !== "undefined" ? localStorage.getItem("user") : null
        if (saved) router.push("/dashboard")
      }, 250)
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground text-3xl font-bold">J</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">JIRAMA</h1>
          <p className="text-muted-foreground text-sm mt-2">Gestion du Personnel</p>
        </div>

        <div className="card-modern p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-foreground mb-2">Bienvenue</h2>
          <p className="text-muted-foreground text-sm mb-8">Connectez-vous à votre compte</p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email ou Immatricule</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  name="emailOrMatricule"
                  placeholder="exemple@jirama.mg"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={formData.emailOrMatricule}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <div className="text-center mb-6">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:text-orange-600 font-medium transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-muted-foreground">Comptes de démonstration</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <div className="space-y-2">
            {[
              { role: "admin_user", label: "Admin Utilisateurs" },
              { role: "admin_rh", label: "Admin RH" },
              { role: "user", label: "Utilisateur Standard" },
            ].map((account) => (
              <button
                key={account.role}
                onClick={() => handleDemoLogin(account.role)}
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">© 2026 JIRAMA. Tous droits réservés.</p>
      </div>
    </div>
  )
}
