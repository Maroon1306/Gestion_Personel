"use client"

import { useState } from "react"
import MainLayout from "@/components/MainLayout"
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Clock,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  Activity,
  Target,
  DollarSign
} from "lucide-react"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('month')
  const [selectedDepartment, setSelectedDepartment] = useState('all')

  // Données pour les graphiques
  const attendanceData = [
    { month: 'Jan', present: 95, late: 3, absent: 2 },
    { month: 'Fév', present: 96, late: 2, absent: 2 },
    { month: 'Mar', present: 94, late: 4, absent: 2 },
    { month: 'Avr', present: 97, late: 2, absent: 1 },
    { month: 'Mai', present: 95, late: 3, absent: 2 },
    { month: 'Juin', present: 98, late: 1, absent: 1 },
  ]

  const departmentData = [
    { name: 'Production Électrique', value: 35, color: 'bg-orange-500' },
    { name: 'Production Eau', value: 25, color: 'bg-blue-500' },
    { name: 'Vente', value: 15, color: 'bg-emerald-500' },
    { name: 'Finance', value: 10, color: 'bg-purple-500' },
    { name: 'Support RH', value: 10, color: 'bg-cyan-500' },
    { name: 'Médecin', value: 5, color: 'bg-rose-500' },
  ]

  const stats = [
    { label: "Taux de Présence", value: "95.8%", change: "+2.3%", icon: TrendingUp, color: "from-emerald-500 to-green-500" },
    { label: "Heures Travaillées", value: "18,456h", change: "+420h", icon: Clock, color: "from-blue-500 to-cyan-500" },
    { label: "Productivité", value: "87.5%", change: "+1.8%", icon: Activity, color: "from-violet-500 to-purple-500" },
    { label: "Coût Absences", value: "12.4M Ar", change: "-0.5M", icon: DollarSign, color: "from-rose-500 to-pink-500" },
  ]

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
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">Analytics & Rapports</h1>
                    <p className="text-gray-300 text-sm mt-0.5">
                      Analysez les performances et générez des rapports détaillés
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="appearance-none pl-3 pr-7 py-2 text-sm rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                    <option value="quarter">Ce trimestre</option>
                    <option value="year">Cette année</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
                <button className="px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm rounded-lg font-medium hover:shadow-md transition-all flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Exporter PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={idx}
                className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 hover:shadow-sm cursor-pointer"
              >
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-sm`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Attendance Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Taux de Présence Mensuel</h3>
              <Filter className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {attendanceData.map((data, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{data.month}</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{data.present}%</span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <div 
                      className="bg-emerald-500"
                      style={{ width: `${data.present}%` }}
                    />
                    <div 
                      className="bg-amber-500"
                      style={{ width: `${data.late}%` }}
                    />
                    <div 
                      className="bg-rose-500"
                      style={{ width: `${data.absent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Présent: {data.present}%</span>
                    <span>Retard: {data.late}%</span>
                    <span>Absent: {data.absent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Distribution */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Distribution par Département</h3>
              <PieChart className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {departmentData.map((dept, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${dept.color}`} />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{dept.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${dept.color}`}
                        style={{ width: `${dept.value}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white w-6 text-right">{dept.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Indicateurs Clés de Performance</h3>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-2.5 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="all">Tous départements</option>
              <option value="electricite">Production Électrique</option>
              <option value="eau">Production Eau</option>
              <option value="vente">Vente</option>
              <option value="finance">Finance</option>
              <option value="rh">Support RH</option>
              <option value="medical">Médecin</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Performance Card */}
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Productivité</span>
                <Target className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-gray-900 dark:text-white">87.5%</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">+2.3%</span>
              </div>
              <div className="mt-1.5 text-xs text-gray-500">vs mois dernier</div>
            </div>

            {/* Attendance Card */}
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Taux Présence</span>
                <Users className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-gray-900 dark:text-white">95.8%</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">+1.2%</span>
              </div>
              <div className="mt-1.5 text-xs text-gray-500">objectif: 96%</div>
            </div>

            {/* Cost Card */}
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Coût Absences</span>
                <DollarSign className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-gray-900 dark:text-white">12.4M</span>
                <span className="text-xs text-rose-600 dark:text-rose-400">-0.5M</span>
              </div>
              <div className="mt-1.5 text-xs text-gray-500">Ar/mois</div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}