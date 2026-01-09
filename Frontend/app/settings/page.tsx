"use client"

import MainLayout from "@/components/MainLayout"
import { useAuth } from "@/hooks/useAuth"
import { useState } from "react"
import { User, Lock, Bell } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "security", label: "Sécurité", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ]

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Paramètres</h1>
          <p className="text-muted-foreground">Gérez vos préférences et paramètres de compte</p>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Tabs */}
          <div className="lg:w-48">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <div className="card-modern p-8">
                <h2 className="text-2xl font-bold text-foreground mb-8">Profil utilisateur</h2>

                <div className="mb-8 pb-8 border-b border-border">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold">
                      {user?.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-foreground">{user?.name}</h3>
                      <p className="text-muted-foreground">{user?.role}</p>
                      <button className="mt-3 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium">
                        Changer la photo
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email}
                      readOnly
                      className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Immatricule</label>
                    <input
                      type="text"
                      value={user?.matricule}
                      readOnly
                      className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Rôle</label>
                    <input
                      type="text"
                      value={user?.role}
                      readOnly
                      className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground"
                    />
                  </div>
                  <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-orange-600 transition-colors font-medium">
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="card-modern p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Sécurité</h2>

                <div className="space-y-6">
                  <div className="pb-6 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Mot de passe</h3>
                    <button className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium">
                      Changer le mot de passe
                    </button>
                  </div>

                  <div className="pb-6 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Sessions actives</h3>
                    <div className="card-modern bg-secondary p-4 mb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Session actuelle</p>
                          <p className="text-xs text-muted-foreground">Navigateur: Firefox | IP: 192.168.1.1</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Actif
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Authentification à deux facteurs</h3>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Désactivé</p>
                        <p className="text-xs text-muted-foreground">Activez la 2FA pour plus de sécurité</p>
                      </div>
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
                        Activer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="card-modern p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Préférences de notifications</h2>

                <div className="space-y-4">
                  {[
                    { label: "Notifications email", description: "Recevez les mises à jour par email" },
                    { label: "Alertes système", description: "Notifications des événements importants" },
                    { label: "Rapports hebdomadaires", description: "Résumé des activités de la semaine" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-border" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
