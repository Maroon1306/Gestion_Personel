"use client"

import { useAuth } from "@/hooks/useAuth"
import MainLayout from "@/components/MainLayout"
import { TrendingUp, Users, Briefcase, Building2 } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    { label: "Total Employés", value: "2,543", icon: Users, color: "bg-blue-500" },
    { label: "Contrats Actifs", value: "2,120", icon: Briefcase, color: "bg-green-500" },
    { label: "Départements", value: "12", icon: Building2, color: "bg-purple-500" },
    { label: "Croissance", value: "+5.2%", icon: TrendingUp, color: "bg-orange-500" },
  ]

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Bienvenue, {user?.name?.split(" ")[0]}</h1>
          <p className="text-muted-foreground">
            {user?.role === "ADMIN_RH"
              ? "Centre de gestion du personnel et des ressources humaines"
              : user?.role === "ADMIN_USER"
                ? "Centre de gestion des utilisateurs système"
                : "Portail d'accès aux informations personnelles"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="card-modern p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">+2.5% depuis le mois dernier</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 card-modern p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Activités Récentes</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">{item}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Activité #{item}</p>
                    <p className="text-xs text-muted-foreground">Il y a {item * 2} heures</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info */}
          <div className="space-y-6">
            <div className="card-modern p-6">
              <h3 className="font-semibold text-foreground mb-4">Votre Profil</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Rôle</p>
                  <p className="font-medium text-foreground">{user?.role}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground break-all">{user?.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Matricule</p>
                  <p className="font-medium text-foreground">{user?.matricule}</p>
                </div>
              </div>
            </div>

            <div className="card-modern p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <h3 className="font-semibold text-foreground mb-2">Version App</h3>
              <p className="text-2xl font-bold text-primary">1.0.0</p>
              <p className="text-xs text-muted-foreground mt-2">Dernière mise à jour: 7 jan 2026</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
