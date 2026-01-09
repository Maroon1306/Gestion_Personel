"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
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
          {!submitted ? (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-2">Réinitialiser le mot de passe</h2>
              <p className="text-muted-foreground text-sm mb-8">
                Entrez votre adresse e-mail pour recevoir un lien de réinitialisation du mot de passe.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Adresse e-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="exemple@jirama.mg"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-orange-600 font-semibold transition-colors"
                >
                  Envoyer le lien
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Email envoyé</h2>
              <p className="text-muted-foreground">
                Vérifiez votre boîte e-mail pour le lien de réinitialisation du mot de passe.
              </p>
              <p className="text-sm text-muted-foreground">Le lien expirera dans 24 heures.</p>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-8 pt-8 border-t border-border">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-primary hover:text-orange-600 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">© 2026 JIRAMA. Tous droits réservés.</p>
      </div>
    </div>
  )
}
