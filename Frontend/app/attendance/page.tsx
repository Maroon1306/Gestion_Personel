"use client"

import { useState } from "react"
import MainLayout from "@/components/MainLayout"
import { Clock, Calendar, Users, CheckCircle, XCircle, AlertCircle, Download, Filter, Search, Eye, Edit, Trash2 } from "lucide-react"
import { useSearch } from "@/context/SearchContext"

export default function AttendancePage() {
  const { search, setSearch } = useSearch()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  // Données de pointage
  const attendanceRecords = [
    { 
      id: 1, 
      name: "Jean Rakoto", 
      matricule: "EMP001", 
      position: "Technicien Maintenance", 
      checkIn: "07:55", 
      checkOut: "16:05", 
      status: "present", 
      hours: 8.17,
      avatarColor: "from-blue-500 to-cyan-500"
    },
    { 
      id: 2, 
      name: "Marie Rasoa", 
      matricule: "EMP002", 
      position: "Comptable", 
      checkIn: "08:10", 
      checkOut: "17:00", 
      status: "present", 
      hours: 8.83,
      avatarColor: "from-emerald-500 to-green-500"
    },
    { 
      id: 3, 
      name: "Paul Randria", 
      matricule: "EMP003", 
      position: "Ingénieur Réseau", 
      checkIn: "09:30", 
      checkOut: "18:00", 
      status: "late", 
      hours: 8.5,
      avatarColor: "from-violet-500 to-purple-500"
    },
    { 
      id: 4, 
      name: "Sophie Rabe", 
      matricule: "EMP004", 
      position: "Service Client", 
      checkIn: "", 
      checkOut: "", 
      status: "absent", 
      hours: 0,
      avatarColor: "from-rose-500 to-pink-500"
    },
  ]

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'present': return {
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Présent'
      }
      case 'late': return {
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        icon: <AlertCircle className="w-4 h-4" />,
        label: 'Retard'
      }
      case 'absent': return {
        color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
        icon: <XCircle className="w-4 h-4" />,
        label: 'Absent'
      }
      default: return {
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
        icon: <Clock className="w-4 h-4" />,
        label: 'En attente'
      }
    }
  }

  return (
    <MainLayout>
      <div className="p-4 space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pointage du Personnel</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gérez les présences, absences et heures de travail
            </p>
          </div>
          <div className="flex items-center gap-3 mt-3 md:mt-0">
            <button className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </button>
            <button className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:shadow-md transition-all text-sm">
              Pointage Manuel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Présents Aujourd'hui</p>
                <p className="text-2xl font-bold mt-2">2,345</p>
              </div>
              <div className="p-2.5 bg-emerald-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-emerald-400">+2.5%</span>
                <span className="opacity-70">vs hier</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Heures Travail</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">18,756</p>
              </div>
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-600 dark:text-blue-400">+420h</span>
                <span className="text-gray-500 dark:text-gray-400">cette semaine</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Retards</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">89</p>
              </div>
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-amber-600 dark:text-amber-400">-12%</span>
                <span className="text-gray-500 dark:text-gray-400">vs semaine dernière</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Taux Présence</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">94.2%</p>
              </div>
              <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-emerald-600 dark:text-emerald-400">+0.5%</span>
                <span className="text-gray-500 dark:text-gray-400">objectif atteint</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rechercher</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nom, matricule..."
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vue</label>
                <div className="flex gap-2">
                  {['daily', 'weekly', 'monthly'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode as any)}
                      className={`px-4 py-2 rounded-md text-sm capitalize transition-all ${
                        viewMode === mode 
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {mode === 'daily' ? 'Journalier' : mode === 'weekly' ? 'Hebdo' : 'Mensuel'}
                    </button>
                  ))}
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Filter className="w-4 h-4" />
                Filtres
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Pointage du {selectedDate}</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {attendanceRecords.length} employés • {attendanceRecords.filter(r => r.status === 'present').length} présents
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-5 py-3.5 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Employé</th>
                  <th className="px-5 py-3.5 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Poste</th>
                  <th className="px-5 py-3.5 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Entrée</th>
                  <th className="px-5 py-3.5 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Sortie</th>
                  <th className="px-5 py-3.5 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Heures</th>
                  <th className="px-5 py-3.5 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Statut</th>
                  <th className="px-5 py-3.5 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {attendanceRecords.map((record) => {
                  const statusConfig = getStatusConfig(record.status)
                  return (
                    <tr 
                      key={record.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${record.avatarColor} flex items-center justify-center`}>
                            <span className="text-white text-sm font-bold">{record.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{record.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{record.matricule}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{record.position}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm ${record.checkIn ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {record.checkIn || '--:--'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm ${record.checkOut ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {record.checkOut || '--:--'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">{record.hours}h</span>
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full bg-gradient-to-r ${record.avatarColor}`}
                              style={{ width: `${Math.min(100, (record.hours / 8) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.color}`}>
                          {statusConfig.icon}
                          <span className="text-xs font-medium">{statusConfig.label}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button className="p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                            <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                          <button className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}