// attendance/page.tsx
"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/MainLayout"
import { Clock, Calendar, Users, CheckCircle, XCircle, AlertCircle, Download, Filter, Eye, Calculator, TrendingUp, BarChart, FileText } from "lucide-react"
import { useSearch } from "@/context/SearchContext"

export default function AttendancePage() {
  const { search } = useSearch()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [statsFor, setStatsFor] = useState<any | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [performanceStats, setPerformanceStats] = useState<any>(null)

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'present': return {
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Présent'
      }
      case 'partial': return {
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        icon: <AlertCircle className="w-4 h-4" />,
        label: 'Partiel'
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

  async function fetchAttendance() {
    try {
      setLoading(true)
      const res = await fetch(`${BACKEND}/attendance?date=${selectedDate}`, { credentials: 'include' })
      if (!res.ok) {
        console.error('Failed to fetch attendance')
        setAttendanceData([])
        setLoading(false)
        return
      }
      const body = await res.json()
      let data = body.data || []
      
      // Apply search from context
      if (search && search.trim()) {
        const q = search.toLowerCase()
        data = data.filter((r: any) => 
          (r.name || '').toLowerCase().includes(q) || 
          (r.matricule || '').toLowerCase().includes(q) ||
          (r.department || '').toLowerCase().includes(q)
        )
      }
      
      setAttendanceData(data)
    } catch (err) {
      console.error(err)
      setAttendanceData([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchPerformanceStats() {
    try {
      const currentDate = new Date(selectedDate)
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      
      const res = await fetch(`${BACKEND}/api/performance/top-performers?month=${month}&year=${year}&limit=5`, { 
        credentials: 'include' 
      })
      if (!res.ok) return
      const body = await res.json()
      setPerformanceStats(body.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchAttendance()
    fetchPerformanceStats()
  }, [selectedDate, search])

  async function handleCheckIn(personnelId: number) {
    try {
      const payload = { 
        personnelId, 
        date: selectedDate, 
        checkInTime: new Date().toISOString() 
      }
      const res = await fetch(`${BACKEND}/attendance/checkin`, { 
        method: 'POST', 
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      })
      if (res.ok) {
        await fetchAttendance()
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleCheckOut(personnelId: number) {
    try {
      const payload = { 
        personnelId, 
        date: selectedDate, 
        checkOutTime: new Date().toISOString()
      }
      const res = await fetch(`${BACKEND}/attendance/checkout`, { 
        method: 'POST', 
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      })
      if (res.ok) {
        await fetchAttendance()
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleAbsent(personnelId: number) {
    try {
      const payload = { personnelId, date: selectedDate }
      const res = await fetch(`${BACKEND}/attendance/absent`, { 
        method: 'POST', 
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      })
      if (res.ok) {
        await fetchAttendance()
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function calculateAllPerformance() {
    try {
      setCalculating(true)
      const currentDate = new Date()
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      
      const res = await fetch(`${BACKEND}/api/performance/calculate-all`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year })
      })
      
      if (res.ok) {
        const data = await res.json()
        alert(`Performance calculée pour ${data.data.length} employés`)
        fetchPerformanceStats()
      }
    } catch (err) {
      console.error('Error calculating all performance:', err)
      alert('Erreur lors du calcul de performance')
    } finally {
      setCalculating(false)
    }
  }

  async function handleDownloadPersonalReport(personnelId: number, name: string) {
    try {
      const month = new Date(selectedDate).getMonth() + 1
      const year = new Date(selectedDate).getFullYear()
      const res = await fetch(`${BACKEND}/attendance/report/${personnelId}?month=${month}&year=${year}`, { 
        credentials: 'include' 
      })
      if (!res.ok) {
        alert('Erreur lors de la génération du PDF')
        return
      }
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport_${name.replace(/\s+/g, '_')}_${year}_${month}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Erreur lors du téléchargement')
    }
  }

  async function handleShowStats(personnelId: number) {
    try {
      const month = new Date(selectedDate).getMonth() + 1
      const year = new Date(selectedDate).getFullYear()
      const res = await fetch(`${BACKEND}/api/performance/monthly-stats/${personnelId}?month=${month}&year=${year}`, { 
        credentials: 'include' 
      })
      if (!res.ok) return
      const body = await res.json()
      setStatsFor({ personnelId, ...body.data })
    } catch (err) {
      console.error(err)
    }
  }

  // Fonction pour calculer la performance quotidienne
  const calculateDailyPerformance = (hoursWorked: number) => {
    // 8h = 100% de la journée = 4.6% du mois (100% / 22 jours)
    const dailyPercentage = (hoursWorked / 8) * 4.6
    return parseFloat(dailyPercentage.toFixed(2))
  }

  // Calculer les statistiques réelles
  const presentCount = attendanceData.filter(r => r.status === 'present').length
  const totalHours = attendanceData.reduce((s, r) => s + Number(r.hoursWorked || 0), 0)
  const avgPerformance = attendanceData.length > 0 
    ? ((attendanceData.reduce((s, r) => s + calculateDailyPerformance(Number(r.hoursWorked || 0)), 0)) / attendanceData.length).toFixed(1)
    : '0'
  const presenceRate = attendanceData.length 
    ? Math.round((presentCount / attendanceData.length) * 100)
    : 0

  return (
    <MainLayout>
      <div className="p-2 md:p-2 space-y-4 mr-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pointage du Personnel</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gérez les présences, absences et heures de travail
            </p>
          </div>
          <div className="flex items-center gap-3 mt-3 md:mt-0">
            <button 
              onClick={calculateAllPerformance}
              disabled={calculating}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg font-medium hover:shadow-md transition-all text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calculator className="w-4 h-4" />
              {calculating ? 'Calcul en cours...' : 'Calculer Performance'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Présents Aujourd'hui</p>
                <p className="text-2xl font-bold mt-2">{presentCount}</p>
              </div>
              <div className="p-2.5 bg-emerald-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="text-xs opacity-70">
                sur {attendanceData.length} employés
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Heures Travail</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {totalHours.toFixed(2)}h
                </p>
              </div>
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Performance du jour: {calculateDailyPerformance(totalHours)}%
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Performance Moy.</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {avgPerformance}%
                </p>
              </div>
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Taux Présence</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {presenceRate}%
                </p>
              </div>
              <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        {performanceStats && performanceStats.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart className="w-4 h-4" />
                Top Performers du Mois
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Basé sur les heures travaillées
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {performanceStats.slice(0, 5).map((performer: any, index: number) => (
                <div 
                  key={performer.id} 
                  className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                        index === 0 ? 'from-yellow-500 to-amber-500' :
                        index === 1 ? 'from-gray-400 to-gray-600' :
                        index === 2 ? 'from-amber-700 to-orange-500' :
                        'from-blue-500 to-cyan-500'
                      } flex items-center justify-center`}>
                        <span className="text-white text-xs font-bold">{performer.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{performer.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{performer.department}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {performer.performance_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                        index === 2 ? 'bg-gradient-to-r from-amber-700 to-orange-500' :
                        'bg-gradient-to-r from-blue-500 to-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, performer.performance_percentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>#{index + 1}</span>
                    <span>{performer.total_hours_worked}h travaillées</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
            </div>
            <div className="flex items-end gap-3">
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
                {attendanceData.length} employés • {presentCount} présents
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
                  <th className="px-5 py-3.5 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Perf. Jour</th>
                  <th className="px-5 py-3.5 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Statut</th>
                  <th className="px-5 py-3.5 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading && (
                  <tr><td colSpan={8} className="px-5 py-6 text-center text-gray-500">Chargement...</td></tr>
                )}
                {!loading && attendanceData.map((record) => {
                  const statusConfig = getStatusConfig(record.status)
                  const dailyPerformance = calculateDailyPerformance(Number(record.hoursWorked || 0))
                  
                  return (
                    <tr 
                      key={record.personnelId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${record.avatarColor || 'from-gray-400 to-gray-600'} flex items-center justify-center`}>
                            <span className="text-white text-sm font-bold">{(record.name || '').charAt(0)}</span>
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
                            {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm ${record.checkOut ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {(Number(record.hoursWorked || 0)).toFixed(2)}h
                          </span>
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full bg-gradient-to-r ${record.avatarColor || 'from-gray-400 to-gray-600'}`}
                              style={{ width: `${Math.min(100, (Number(record.hoursWorked || 0) / 8) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium text-sm ${
                            dailyPerformance >= 4.6 ? 'text-emerald-600 dark:text-emerald-400' :
                            dailyPerformance >= 3.0 ? 'text-amber-600 dark:text-amber-400' :
                            'text-rose-600 dark:text-rose-400'
                          }`}>
                            {dailyPerformance}%
                          </span>
                          <div className="text-xs text-gray-500">
                            sur 4.6%
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
                          <button 
                            onClick={() => handleCheckIn(record.personnelId)} 
                            className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-sm"
                          >
                            Entrée
                          </button>
                          <button 
                            onClick={() => handleCheckOut(record.personnelId)} 
                            className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm"
                          >
                            Sortie
                          </button>
                          <button 
                            onClick={() => handleAbsent(record.personnelId)} 
                            className="px-3 py-1 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 text-sm"
                          >
                            Absent
                          </button>
                          <button 
                            onClick={() => handleShowStats(record.personnelId)} 
                            className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
                          >
                            Stats
                          </button>
                          <button 
                            onClick={() => handleDownloadPersonalReport(record.personnelId, record.name)} 
                            className="px-2 py-1 rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 text-sm flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            PDF
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

        {/* Détails des statistiques */}
        {statsFor && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Statistiques de Performance - {statsFor.personnel?.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {statsFor.personnel?.matricule} • {statsFor.personnel?.department}
                </p>
              </div>
              <button 
                onClick={() => setStatsFor(null)} 
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Fermer
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Performance Mensuelle</p>
                <p className="text-2xl font-bold mt-2">
                  {statsFor.performance?.performance_percentage || 0}%
                </p>
                <div className="text-xs mt-1 opacity-80">
                  sur {statsFor.targets?.monthly_target_hours || 176}h cible
                </div>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Heures Travaillées</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {statsFor.attendance?.total_hours || 0}h
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  {statsFor.attendance?.present_days || 0} jours présents
                </div>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Jours d'absence</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {statsFor.attendance?.absent_days || 0}
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  Performance quotidienne: {statsFor.calculations?.daily_performance?.toFixed(2) || 0}%
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium mb-2">Calcul de performance :</p>
              <ul className="space-y-1 text-xs">
                <li>• Heures cible mensuelle: {statsFor.targets?.monthly_target_hours || 176}h (22 jours × 8h)</li>
                <li>• Heures travaillées: {statsFor.attendance?.total_hours || 0}h</li>
                <li>• Performance: ({statsFor.attendance?.total_hours || 0} ÷ {statsFor.targets?.monthly_target_hours || 176}) × 100 = {statsFor.performance?.performance_percentage || 0}%</li>
                <li>• Performance quotidienne cible: 4.6% (100% ÷ 22 jours)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}