"use client"

import MainLayout from "@/components/MainLayout"
import { useAuth } from "@/hooks/useAuth"
import { useState } from "react"
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Key,
  LogOut,
  Check,
  Eye,
  EyeOff,
  Save,
  Camera,
  CreditCard,
  Database,
  Zap,
  ShieldCheck
} from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [darkMode, setDarkMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+261 34 123 4567",
    language: "fr",
    timezone: "Indian/Antananarivo"
  })

  const tabs = [
    { id: "profile", label: "Profil", icon: User, color: "from-blue-500 to-cyan-500" },
    { id: "security", label: "Sécurité", icon: Shield, color: "from-emerald-500 to-green-500" },
    { id: "notifications", label: "Notifications", icon: Bell, color: "from-violet-500 to-purple-500" },
    { id: "appearance", label: "Apparence", icon: Palette, color: "from-amber-500 to-orange-500" },
    { id: "privacy", label: "Confidentialité", icon: ShieldCheck, color: "from-indigo-500 to-blue-500" },
  ]

  const notificationSettings = [
    { 
      id: "email", 
      label: "Email Notifications", 
      description: "Recevez les mises à jour importantes par email",
      icon: Mail 
    },
    { 
      id: "push", 
      label: "Notifications Push", 
      description: "Alertes en temps réel sur votre appareil",
      icon: Smartphone 
    },
    { 
      id: "weekly", 
      label: "Rapports Hebdomadaires", 
      description: "Résumé des activités de la semaine",
      icon: Database 
    },
    { 
      id: "security", 
      label: "Alertes de Sécurité", 
      description: "Notifications des connexions suspectes",
      icon: Shield 
    },
  ]

  const activeSessions = [
    { 
      id: "current", 
      device: "Chrome on Windows", 
      location: "Antananarivo, Madagascar", 
      ip: "192.168.1.100", 
      active: true,
      lastActive: "Maintenant"
    },
    { 
      id: "mobile", 
      device: "Safari on iPhone", 
      location: "Antananarivo, Madagascar", 
      ip: "192.168.1.101", 
      active: false,
      lastActive: "Il y a 2 heures"
    },
  ]

  const handleSave = () => {
    // Ici, vous intégrerez la logique de sauvegarde
    console.log("Sauvegarde des paramètres", formData)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header avec Glassmorphism */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-xl p-8">
          <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px]" />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Paramètres</h1>
            <p className="text-gray-300">
              Personnalisez votre expérience et gérez vos préférences
            </p>
          </div>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Navigation Latérale */}
          <div className="lg:w-64">
            <div className="sticky top-24 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${tab.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="absolute right-4">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Contenu Principal */}
          <div className="flex-1">
            {/* Profil */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Carte d'en-tête */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                        <span className="text-white text-3xl font-bold">{user?.name?.charAt(0)}</span>
                      </div>
                      <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-medium rounded-full">
                            {user?.role}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Depuis 2020</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Matricule</label>
                          <p className="font-semibold text-gray-900 dark:text-white">{user?.matricule}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Département</label>
                          <p className="font-semibold text-gray-900 dark:text-white">Technique</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations personnelles */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Informations Personnelles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Langue
                      </label>
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData({...formData, language: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="fr">Français</option>
                        <option value="mg">Malagasy</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bouton de sauvegarde */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    className="group relative overflow-hidden px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Save className="w-5 h-5" />
                      Sauvegarder les modifications
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </div>
              </div>
            )}

            {/* Sécurité */}
            {activeTab === "security" && (
              <div className="space-y-6">
                {/* Mot de passe */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Mot de passe</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">Mettez à jour votre mot de passe régulièrement</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full text-xs font-medium">
                      Fort
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          defaultValue="••••••••"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="Minimum 8 caractères"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirmer le mot de passe
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <button className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                      Mettre à jour le mot de passe
                    </button>
                  </div>
                </div>

                {/* 2FA */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Authentification à deux facteurs</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Ajoutez une couche de sécurité supplémentaire à votre compte
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 rounded-full text-xs font-medium">
                        Désactivé
                      </span>
                      <button className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-medium text-sm hover:shadow-lg">
                        Activer
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                        <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Application</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Google Authenticator</p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                        <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Code envoyé par email</p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                        <Key className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Clés de sécurité</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">YubiKey, etc.</p>
                    </div>
                  </div>
                </div>

                {/* Sessions actives */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Sessions Actives</h3>
                  <div className="space-y-4">
                    {activeSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl ${session.active ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center`}>
                            <Smartphone className={`w-5 h-5 ${session.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{session.device}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">{session.location}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{session.ip}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {session.active ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full text-xs font-medium">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {session.lastActive}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">{session.lastActive}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-6 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors">
                    Déconnecter toutes les autres sessions
                  </button>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                {/* Paramètres globaux */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Préférences de Notifications</h3>
                  <div className="space-y-4">
                    {notificationSettings.map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <setting.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{setting.label}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{setting.description}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Heures silencieuses */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Heures Silencieuses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        De
                      </label>
                      <input
                        type="time"
                        defaultValue="22:00"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        À
                      </label>
                      <input
                        type="time"
                        defaultValue="07:00"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Pendant ces heures, seules les notifications urgentes seront envoyées
                  </p>
                </div>

                {/* Canaux de notification */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Canaux de Notification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Notifications par email</p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Smartphone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Push</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Notifications push</p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-violet-500 dark:hover:border-violet-500 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Bell className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">In-App</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Notifications dans l'app</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Apparence */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                {/* Thème */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Thème</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setDarkMode(false)}
                      className={`p-6 rounded-xl border ${!darkMode ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-gray-200 dark:border-gray-700'} hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-3">
                          <Sun className="w-6 h-6 text-gray-700" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Clair</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Interface claire</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setDarkMode(true)}
                      className={`p-6 rounded-xl border ${darkMode ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-gray-200 dark:border-gray-700'} hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center mb-3">
                          <Moon className="w-6 h-6 text-gray-300" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Sombre</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Interface sombre</p>
                      </div>
                    </button>
                    <button className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center mb-3">
                          <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Auto</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Basé sur le système</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Densité */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Densité d'Interface</h3>
                  <div className="space-y-4">
                    {[
                      { id: "compact", label: "Compact", description: "Plus d'éléments à l'écran" },
                      { id: "comfortable", label: "Confortable", description: "Équilibre parfait" },
                      { id: "spacious", label: "Spacieux", description: "Beaucoup d'espace" },
                    ].map((density) => (
                      <div key={density.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{density.label}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{density.description}</p>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personnalisation */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Personnalisation</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { color: "bg-gradient-to-br from-blue-500 to-cyan-500", label: "Bleu" },
                      { color: "bg-gradient-to-br from-emerald-500 to-green-500", label: "Vert" },
                      { color: "bg-gradient-to-br from-violet-500 to-purple-500", label: "Violet" },
                      { color: "bg-gradient-to-br from-amber-500 to-orange-500", label: "Orange" },
                    ].map((theme) => (
                      <button
                        key={theme.label}
                        className="flex flex-col items-center group"
                      >
                        <div className={`w-12 h-12 rounded-xl ${theme.color} mb-2 group-hover:scale-110 transition-transform`} />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Confidentialité */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                {/* Données */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Données Personnelles</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Gérez vos données et téléchargez vos informations
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium text-sm hover:shadow-lg">
                      Télécharger les données
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Données de compte</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Informations de profil, préférences</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">~2.4 MB</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Activités</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Logs d'activité, connexions</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">~15.7 MB</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Partage de données */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Partage de Données</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Partage avec les administrateurs", description: "Les administrateurs peuvent voir certaines informations" },
                      { label: "Statistiques anonymes", description: "Contribuer aux statistiques d'utilisation anonymes" },
                      { label: "Amélioration produit", description: "Partager les données pour améliorer l'application" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{item.label}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suppression de compte */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 border-rose-200 dark:border-rose-800">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Supprimer le compte</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-1 mb-4">
                        Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                      </p>
                      <button className="px-4 py-2 border border-rose-600 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                        Supprimer mon compte
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}