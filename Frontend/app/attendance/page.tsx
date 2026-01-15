"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/MainLayout"
import { Clock, Calendar, Users, CheckCircle, XCircle, AlertCircle, Download, Filter, Search, Eye } from "lucide-react"
import { useSearch } from "@/context/SearchContext"

export default function AttendancePage() {
  const { search } = useSearch()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [statsFor, setStatsFor] = useState<any | null>(null)

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
      // apply client-side search from navbar
      if (search && search.trim()) {
        const q = search.toLowerCase()
        data = data.filter((r: any) => (r.name || '').toLowerCase().includes(q) || (r.matricule || '').toLowerCase().includes(q))
      }
      setAttendanceData(data)
    } catch (err) {
      console.error(err)
      setAttendanceData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, search])

  async function handleCheckIn(personnelId: number) {
    try {
      const payload = { personnelId, date: selectedDate, checkInTime: new Date().toISOString() }
      const res = await fetch(`${BACKEND}/attendance/checkin`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) await fetchAttendance()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleCheckOut(personnelId: number) {
    try {
      // default pauseMinutes 60; you could prompt for different pause length
      const payload = { personnelId, date: selectedDate, checkOutTime: new Date().toISOString(), pauseMinutes: 60 }
      const res = await fetch(`${BACKEND}/attendance/checkout`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) await fetchAttendance()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleAbsent(personnelId: number) {
    try {
      const payload = { personnelId, date: selectedDate }
      const res = await fetch(`${BACKEND}/attendance/absent`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) await fetchAttendance()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDownloadReport(personnelId: number) {
    try {
      const month = new Date(selectedDate).getMonth() + 1
      const year = new Date(selectedDate).getFullYear()
      const res = await fetch(`${BACKEND}/attendance/report/${personnelId}?month=${month}&year=${year}`, { credentials: 'include' })
      if (!res.ok) return
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report_${personnelId}_${year}_${month}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleShowStats(personnelId: number) {
    try {
      const month = new Date(selectedDate).getMonth() + 1
      const year = new Date(selectedDate).getFullYear()
      const res = await fetch(`${BACKEND}/attendance/monthly-stats?personnelId=${personnelId}&month=${month}&year=${year}`, { credentials: 'include' })
      if (!res.ok) return
      const body = await res.json()
      setStatsFor({ personnelId, ...body.data })
    } catch (err) {
      console.error(err)
    }
  }

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
            <button onClick={() => { /* export full day - optional */ }} className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </button>
            <button className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:shadow-md transition-all text-sm">
              Pointage Manuel
            </button>
          </div>
        </div>

        {/* Stats Cards - kept as static for now */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Présents Aujourd'hui</p>
                <p className="text-2xl font-bold mt-2">{attendanceData.filter(r => r.status === 'present').length}</p>
              </div>
              <div className="p-2.5 bg-emerald-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-emerald-400">&nbsp;</span>
                <span className="opacity-70">&nbsp;</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Heures Travail</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{(attendanceData.reduce((s, r) => s + Number(r.hoursWorked || 0), 0)).toFixed(2)}</p>
              </div>
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Retards</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{attendanceData.filter(r => r.status === 'partial').length}</p>
              </div>
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Taux Présence</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{attendanceData.length ? Math.round((attendanceData.filter(r => r.status === 'present').length / attendanceData.length) * 100) : 0}%</p>
              </div>
              <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls - removed local search input to keep search only in navbar */}
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
                {attendanceData.length} employés • {attendanceData.filter(r => r.status === 'present').length} présents
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
                {loading && (
                  <tr><td colSpan={7} className="px-5 py-6 text-center text-gray-500">Chargement...</td></tr>
                )}
                {!loading && attendanceData.map((record) => {
                  const statusConfig = getStatusConfig(record.status)
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
                          <span className="font-medium text-gray-900 dark:text-white">{(Number(record.hoursWorked || 0)).toFixed(2)}h</span>
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full bg-gradient-to-r ${record.avatarColor || 'from-gray-400 to-gray-600'}`}
                              style={{ width: `${Math.min(100, (Number(record.hoursWorked || 0) / 8) * 100)}%` }}
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
                          <button onClick={() => handleCheckIn(record.personnelId)} className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-sm">Entrée</button>
                          <button onClick={() => handleCheckOut(record.personnelId)} className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm">Sortie</button>
                          <button onClick={() => handleAbsent(record.personnelId)} className="px-3 py-1 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 text-sm">Absent</button>
                          <button onClick={() => handleShowStats(record.personnelId)} className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm">Stats</button>
                          <button onClick={() => handleDownloadReport(record.personnelId)} className="px-2 py-1 rounded-md bg-white border text-sm">PDF</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Simple stats panel when statsFor is set */}
        {statsFor && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Statistiques - Personnel ID: {statsFor.personnelId}</h3>
                <p className="text-xs text-gray-500">Jours ouvrables: {statsFor.totalWorkingDays} • Présents: {statsFor.presentDays} • Absents: {statsFor.absentDays}</p>
                <p className="text-xs text-gray-500">Heures totales: {statsFor.totalHours} • Heures sup: {statsFor.totalOvertime}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">Performance: {statsFor.performance}%</p>
                <button onClick={() => setStatsFor(null)} className="text-xs text-gray-500">Fermer</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  )
}