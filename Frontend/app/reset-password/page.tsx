"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, AlertCircle, CheckCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas")
      setMessageType("error")
      return
    }
    if (formData.password.length < 8) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères")
      setMessageType("error")
      return
    }
    setMessage("Mot de passe réinitialisé avec succès !")
    setMessageType("success")
    setIsSubmitted(true)
    setTimeout(() => {
      router.push("/login")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground text-3xl font-bold">J</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">JIRAMA</h1>
        </div>

        {/* Card */}
        <div className="card-modern p-8 shadow-xl">
          {!isSubmitted ? (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-2">Créer un nouveau mot de passe</h2>
              <p className="text-muted-foreground text-sm mb-8">Entrez un nouveau mot de passe pour votre compte.</p>

              {message && (
                <div
                  className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${messageType === "error"
                      ? "bg-destructive/10 border-destructive/20"
                      : "bg-green-100/50 border-green-200"
                    }`}
                >
                  {messageType === "error" ? (
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p className={`text-sm ${messageType === "error" ? "text-destructive" : "text-green-700"}`}>
                    {message}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nouveau mot de passe</label>
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
                  <p className="text-xs text-muted-foreground mt-2">Minimum 8 caractères</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-orange-600 font-semibold transition-colors"
                >
                  Réinitialiser le mot de passe
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Mot de passe réinitialisé</h2>
              <p className="text-muted-foreground">Redirection vers la connexion...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">© 2026 JIRAMA. Tous droits réservés.</p>
      </div>
    </div>
  )
}
