"use client"

import { useAuth } from "@/hooks/useAuth"
import MainLayout from "@/components/MainLayout"
import { TrendingUp, Users, Briefcase, Clock, Calendar, AlertCircle, ChevronRight, BarChart3, Target, Activity, Zap, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [time, setTime] = useState("")
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }))
      
      const hour = now.getHours()
      if (hour < 12) setGreeting("Bonjour")
      else if (hour < 18) setGreeting("Bon après-midi")
      else setGreeting("Bonsoir")
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    { 
      label: "Employés Actifs", 
      value: "2,543", 
      icon: Users, 
      color: "from-blue-500 to-cyan-500",
      change: "+2.5%",
      trend: "up"
    },
    { 
      label: "Pointages Aujourd'hui", 
      value: "2,345", 
      icon: Clock, 
      color: "from-emerald-500 to-green-500",
      change: "+3.2%",
      trend: "up"
    },
    { 
      label: "Taux Présence", 
      value: "94.2%", 
      icon: Target, 
      color: "from-violet-500 to-purple-500",
      change: "+0.5%",
      trend: "up"
    },
    { 
      label: "Absences", 
      value: "127", 
      icon: AlertCircle, 
      color: "from-rose-500 to-pink-500",
      change: "-0.3%",
      trend: "down"
    },
  ]

  const quickActions = [
    { 
      label: "Pointage Rapide", 
      description: "Enregistrer présence",
      icon: Clock, 
      color: "bg-gradient-to-br from-emerald-500 to-green-500",
      action: () => router.push("/attendance")
    },
    { 
      label: "Rapport Hebdo", 
      description: "Générer rapport",
      icon: BarChart3, 
      color: "bg-gradient-to-br from-blue-500 to-cyan-500",
      action: () => router.push("/analytics")
    },
    { 
      label: "Gérer Personnel", 
      description: "Liste employés",
      icon: Users, 
      color: "bg-gradient-to-br from-violet-500 to-purple-500",
      action: () => router.push("/personnel")
    },
  ]

  const recentActivity = [
    { user: "Marie Rasoa", action: "a pointé à 07:55", time: "2 min", icon: "👤", color: "from-emerald-500 to-green-500" },
    { user: "Jean Rakoto", action: "est en congé", time: "15 min", icon: "🏖️", color: "from-amber-500 to-orange-500" },
    { user: "Paul Randria", action: "a terminé son shift", time: "45 min", icon: "✅", color: "from-blue-500 to-cyan-500" },
    { user: "Sophie Rabe", action: "a déposé un rapport", time: "1h", icon: "📊", color: "from-violet-500 to-purple-500" },
  ]

  return (
    <MainLayout>
      <div className="p-2 md:p-2 space-y-4 mr-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-amber-500/10" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl">
                    <span className="text-white text-lg">📊</span>
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white">
                      {greeting}, <span className="bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">
                        {user?.name?.split(" ")[0] || "Admin"}
                      </span>
                    </h1>
                    <p className="text-gray-300 text-sm mt-1">
                      {time} • {new Date().toLocaleDateString('fr-FR', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short',
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm max-w-2xl">
                  Gérez le pointage, les absences et optimisez la productivité de votre équipe JIRAMA.
                </p>
              </div>
              <button
                onClick={() => router.push("/attendance")}
                className="group relative overflow-hidden px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 
                         rounded-xl font-semibold text-white shadow-lg shadow-orange-500/25 
                         hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 
                         hover:scale-[1.02] active:scale-[0.98] text-sm"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Gestion Pointage
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={idx}
                className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 
                         hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 
                         hover:shadow-md cursor-pointer"
                onClick={() => router.push("/analytics")}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-sm`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    <TrendingUp className={`w-3 h-3 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full bg-gradient-to-r ${stat.color}`}
                      style={{ width: `${Math.random() * 40 + 60}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Actions Rapides</h2>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={idx}
                      onClick={action.action}
                      className="group relative overflow-hidden p-4 rounded-xl border border-gray-200 
                               dark:border-gray-800 hover:border-transparent transition-all duration-300 
                               hover:shadow-md"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white 
                                    dark:from-gray-800 dark:to-gray-900 opacity-0 group-hover:opacity-100 
                                    transition-opacity duration-300" />
                      <div className="relative">
                        <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center 
                                     shadow-sm mb-3`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{action.label}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{action.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Weekly Presence Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Présence Hebdomadaire</h2>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Semaine {new Date().getWeek()}
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { day: "Lun", present: 95, target: 95, color: "from-emerald-500 to-green-500" },
                  { day: "Mar", present: 97, target: 95, color: "from-emerald-500 to-green-500" },
                  { day: "Mer", present: 94, target: 95, color: "from-amber-500 to-orange-500" },
                  { day: "Jeu", present: 96, target: 95, color: "from-emerald-500 to-green-500" },
                  { day: "Ven", present: 98, target: 95, color: "from-emerald-500 to-green-500" },
                  { day: "Sam", present: 60, target: 70, color: "from-rose-500 to-pink-500" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.day}</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">
                        {item.present}% / {item.target}%
                      </span>
                    </div>
                    <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${item.present}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Activité Récente</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 
                             transition-colors cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${activity.color} 
                                  flex items-center justify-center text-sm`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        <span className="font-semibold">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => router.push("/attendance")}
                className="w-full mt-4 py-2 text-xs text-center text-orange-600 dark:text-orange-400 
                         hover:text-orange-700 dark:hover:text-orange-300 font-medium transition-colors"
              >
                Voir toutes les activités →
              </button>
            </div>

            {/* User Profile Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-5">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 
                                flex items-center justify-center shadow-md">
                    <span className="text-white text-base font-bold">{user?.name?.charAt(0) || "A"}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{user?.name || "Admin"}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-amber-500 
                                     text-white text-xs font-semibold rounded-full">
                        {user?.role?.replace('_', ' ') || "Admin RH"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">Matricule</span>
                    <span className="font-semibold text-white">{user?.matricule || "ADMIN001"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">Email</span>
                    <span className="font-semibold text-white truncate max-w-[140px]">
                      {user?.email || "admin@jirama.mg"}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-xs">Statut</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-emerald-400 text-xs font-semibold">En ligne</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Indicateurs</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-lg 
                              bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Productivité</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">+12% cette semaine</p>
                    </div>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">87.5%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg 
                              bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Sécurité</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Aucun incident</p>
                    </div>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

// Extend Date prototype for getWeek if not exists
if (!Date.prototype.getWeek) {
  Date.prototype.getWeek = function() {
    const date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }
}