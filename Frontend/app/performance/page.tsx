"use client"

import { useEffect, useState } from "react"
import MainLayout from "@/components/MainLayout"
import { TrendingUp, Users, Target, Clock, Award, Calendar, Download, Filter, ChevronRight, BarChart, Calculator } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function PerformancePage() {
  const { fetchWithAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [topPerformers, setTopPerformers] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [config, setConfig] = useState<any>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)

  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ]

  const years = [2023, 2024, 2025, 2026]

  useEffect(() => {
    fetchPerformanceData()
    fetchTopPerformers()
    fetchConfig()
  }, [selectedMonth, selectedYear])

  async function fetchPerformanceData() {
    try {
      setLoading(true)
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/performance/top-performers?month=${selectedMonth}&year=${selectedYear}&limit=50`
      )
      if (!res.ok) throw new Error('Erreur de chargement')
      const data = await res.json()
      setPerformanceData(data.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchTopPerformers() {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/performance/top-performers?month=${selectedMonth}&year=${selectedYear}&limit=5`
      )
      if (res.ok) {
        const data = await res.json()
        setTopPerformers(data.data || [])
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function fetchConfig() {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/performance/config`
      )
      if (res.ok) {
        const data = await res.json()
        setConfig(data.data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function calculateAllPerformance() {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/performance/calculate-all`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ month: selectedMonth, year: selectedYear })
        }
      )
      if (res.ok) {
        alert('Performance calculée pour tous les employés')
        fetchPerformanceData()
        fetchTopPerformers()
      }
    } catch (error) {
      console.error(error)
      alert('Erreur lors du calcul')
    }
  }

  async function updateConfig() {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/performance/config`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        }
      )
      if (res.ok) {
        setShowConfigModal(false)
        alert('Configuration mise à jour')
      }
    } catch (error) {
      console.error(error)
      alert('Erreur lors de la mise à jour')
    }
  }

  const stats = [
    {
      label: "Performance Moyenne",
      value: performanceData.length
        ? (performanceData.reduce((sum, p) => sum + (p.performance_percentage || 0), 0) / performanceData.length).toFixed(1) + "%"
        : "0%",
      icon: TrendingUp,
      color: "from-emerald-500 to-green-500"
    },
    {
      label: "Top Performer",
      value: topPerformers[0]?.performance_percentage
        ? topPerformers[0].performance_percentage + "%"
        : "0%",
      icon: Award,
      color: "from-yellow-500 to-amber-500"
    },
    {
      label: "Heures Moyennes",
      value: performanceData.length
        ? (performanceData.reduce((sum, p) => sum + (p.total_hours_worked || 0), 0) / performanceData.length).toFixed(1) + "h"
        : "0h",
      icon: Clock,
      color: "from-blue-500 to-cyan-500"
    },
    {
      label: "Employés Actifs",
      value: performanceData.length.toString(),
      icon: Users,
      color: "from-violet-500 to-purple-500"
    }
  ]

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return "bg-gradient-to-r from-emerald-500 to-green-500"
    if (percentage >= 75) return "bg-gradient-to-r from-blue-500 to-cyan-500"
    if (percentage >= 60) return "bg-gradient-to-r from-amber-500 to-orange-500"
    return "bg-gradient-to-r from-rose-500 to-pink-500"
  }

  return (
    <MainLayout>
      <div className="p-2 md:p-2 space-y-4 mr-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-5">
          <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px]" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-md">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">Tableau de Performance</h1>
                    <p className="text-gray-300 text-sm mt-0.5">
                      Suivi des performances basées sur les heures de travail
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="bg-black/30 rounded-lg px-4 py-2">
                    <p className="text-xs text-gray-300">Mois</p>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="bg-transparent text-white text-sm focus:outline-none"
                    >
                      {months.map((month, index) => (
                        <option key={index} value={index + 1}>{month}</option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-black/30 rounded-lg px-4 py-2">
                    <p className="text-xs text-gray-300">Année</p>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="bg-transparent text-white text-sm focus:outline-none"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={calculateAllPerformance}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg font-medium hover:shadow-md transition-all flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  Calculer Performance
                </button>
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-md transition-all flex items-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  Configuration
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={idx}
                className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 hover:shadow-sm"
              >
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-sm`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Top 5 Performers */}
        {topPerformers.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4" />
                Top 5 Performers
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {months[selectedMonth - 1]} {selectedYear}
              </span>
            </div>
            <div className="space-y-3">
              {topPerformers.map((performer, index) => (
                <div
                  key={performer.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-lg ${getPerformanceColor(performer.performance_percentage)} flex items-center justify-center`}>
                      <span className="text-white text-sm font-bold">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : performer.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{performer.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{performer.department} • {performer.position}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {performer.performance_percentage}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {performer.total_hours_worked}h travaillées
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${getPerformanceColor(performer.performance_percentage)}`}
                        style={{ width: `${Math.min(100, performer.performance_percentage)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tableau complet des performances */}
        <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Classement des Performances
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {performanceData.length} employés classés
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-5 py-3.5 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Rang</th>
                  <th className="px-5 py-3.5 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Employé</th>
                  <th className="px-5 py-3.5 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Département</th>
                  <th className="px-5 py-3.5 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Heures Travaillées</th>
                  <th className="px-5 py-3.5 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Performance</th>
                  <th className="px-5 py-3.5 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Progression</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading && (
                  <tr><td colSpan={6} className="px-5 py-6 text-center text-gray-500">Chargement...</td></tr>
                )}
                {!loading && performanceData.map((performer) => (
                  <tr
                    key={performer.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${performer.rank === 1 ? 'bg-gradient-to-br from-yellow-500 to-amber-500 text-white' :
                            performer.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white' :
                              performer.rank === 3 ? 'bg-gradient-to-br from-amber-700 to-orange-500 text-white' :
                                'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}>
                          {performer.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center`}>
                          <span className="text-white text-sm font-bold">{performer.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{performer.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{performer.matricule}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-xs">
                        {performer.department}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {performer.total_hours_worked}h
                        </span>
                        <span className="text-xs text-gray-500">
                          sur {config?.monthly_target_hours || 176}h
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${performer.performance_percentage >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
                            performer.performance_percentage >= 75 ? 'text-blue-600 dark:text-blue-400' :
                              performer.performance_percentage >= 60 ? 'text-amber-600 dark:text-amber-400' :
                                'text-rose-600 dark:text-rose-400'
                          }`}>
                          {performer.performance_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${performer.performance_percentage >= 90 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                              performer.performance_percentage >= 75 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                performer.performance_percentage >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                                  'bg-gradient-to-r from-rose-500 to-pink-500'
                            }`}
                          style={{ width: `${Math.min(100, performer.performance_percentage)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de configuration */}
        {showConfigModal && config && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md">
              <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Configuration Performance</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Définissez les paramètres de calcul de performance
                </p>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Heures cible mensuelles
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.monthly_target_hours}
                    onChange={(e) => setConfig({ ...config, monthly_target_hours: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    placeholder="176"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Heures à travailler en 1 mois (22 jours × 8h = 176h)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Heures cible journalières
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.daily_target_hours}
                    onChange={(e) => setConfig({ ...config, daily_target_hours: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    placeholder="8"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Heures à travailler par jour
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jours ouvrables par mois
                  </label>
                  <input
                    type="number"
                    value={config.working_days_per_month}
                    onChange={(e) => setConfig({ ...config, working_days_per_month: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    placeholder="22"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nombre de jours de travail par mois
                  </p>
                </div>
              </div>
              <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  onClick={updateConfig}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}