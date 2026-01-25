// personnel/page.tsx
"use client"

import { useEffect, useState } from "react"
import MainLayout from "@/components/MainLayout"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  User,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Users,
  TrendingUp,
  Shield,
  Award,
  FileText
} from "lucide-react"
import { useSearch } from "@/context/SearchContext"
import { useAuth } from "@/hooks/useAuth"
import PersonnelFormModal from '@/components/personnel/PersonnelFormModal'
import PersonnelDetailModal from '@/components/personnel/PersonnelDetailModal'
import ConfirmDeleteModal from '@/components/personnel/ConfirmDeleteModal'

const statusConfig = {
  "Actif": { 
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    icon: "🟢"
  },
  "Congé": { 
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    icon: "🏖️"
  },
  "Arrêt maladie": { 
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    icon: "🏥"
  },
  "Formation": { 
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    icon: "📚"
  }
}

const departmentColors: Record<string, string> = {
  "Maintenance": "bg-gradient-to-r from-blue-500 to-cyan-500",
  "Ressources Humaines": "bg-gradient-to-r from-emerald-500 to-green-500",
  "Infrastructure": "bg-gradient-to-br from-violet-500 to-purple-500",
  "Finance": "bg-gradient-to-br from-rose-500 to-pink-500",
  "Développement": "bg-gradient-to-br from-amber-500 to-orange-500",
  "Sécurité": "bg-gradient-to-br from-indigo-500 to-blue-500",
  "Vente": "bg-gradient-to-br from-teal-500 to-emerald-500",
  "Production Électrique": "bg-gradient-to-br from-orange-500 to-red-500",
  "Production Eau": "bg-gradient-to-br from-blue-500 to-indigo-500",
  "Support RH": "bg-gradient-to-br from-pink-500 to-rose-500",
  "Médecin": "bg-gradient-to-br from-red-500 to-pink-500",
}

export default function PersonnelPage() {
  const { search } = useSearch()
  const { fetchWithAuth } = useAuth()
  const [personnel, setPersonnel] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState("Tous")
  const [selectedStatus, setSelectedStatus] = useState("Tous")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [current, setCurrent] = useState<any>(null)
  const [departmentsList, setDepartmentsList] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const limit = 9

  const departments = ["Tous", ...(departmentsList.length ? departmentsList : Array.from(new Set(personnel.map((p) => p.department || ''))).filter(Boolean))]
  const statuses = ["Tous", ...new Set(personnel.map((p) => p.status || ''))]

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (selectedDepartment && selectedDepartment !== 'Tous') params.set('department', selectedDepartment)
        if (selectedStatus && selectedStatus !== 'Tous') params.set('status', selectedStatus)
        params.set('page', String(page))
        params.set('limit', String(limit))

        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/personnel?` + params.toString())
        if (!res.ok) throw new Error('Erreur lors du chargement')
        const data = await res.json()
        if (mounted) {
          setPersonnel(data.data)
          setTotal(data.total)
        }
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [search, fetchWithAuth, selectedDepartment, selectedStatus, page, refreshKey])

  useEffect(() => {
    async function loadDeps() {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/departments`)
        if (!res.ok) return
        const d = await res.json()
        setDepartmentsList(d.data || [])
      } catch (e) {
        console.error(e)
      }
    }
    loadDeps()
  }, [fetchWithAuth])

  async function handleSave(payload: any) {
    try {
      if (current && current.id) {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/personnel/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Erreur mise à jour')
      } else {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/personnel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Erreur création')
      }
      setModalOpen(false)
      setCurrent(null)
      setRefreshKey(k => k + 1)
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la sauvegarde')
    }
  }

  async function handleDelete() {
    if (!current) return
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/personnel/${current.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur suppression')
      setDeleteOpen(false)
      setCurrent(null)
      setRefreshKey(k => k + 1)
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la suppression')
    }
  }

  async function handleDownloadReport(personnelId: number, name: string) {
    try {
      const currentDate = new Date()
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/attendance/report/${personnelId}?month=${month}&year=${year}`, { 
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

  function openDetail(person: any) {
    setCurrent(person)
    setDetailOpen(true)
  }

  function openEdit(person: any) {
    setCurrent(person)
    setModalOpen(true)
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))
  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return
    setPage(p)
  }

  const filteredPersonnel = personnel

  // Fetch real stats from backend
  const stats = [
    { label: "Total Personnel", value: total.toString(), change: "", icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "En Congé", value: personnel.filter(p => p.status === "Congé").length.toString(), change: "", icon: Shield, color: "from-amber-500 to-orange-500" },
    { label: "Performance Moy.", value: personnel.length > 0 
      ? `${(personnel.reduce((sum, p) => sum + (p.performance || 0), 0) / personnel.length).toFixed(1)}%` 
      : "0%", 
      change: "", icon: TrendingUp, color: "from-emerald-500 to-green-500" },
    { label: "Top Performers", value: personnel.filter(p => (p.performance || 0) >= 90).length.toString(), change: "", icon: Award, color: "from-violet-500 to-purple-500" },
  ]

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
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
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">Gestion du Personnel</h1>
                    <p className="text-gray-300 text-sm mt-0.5">
                      Gérez vos équipes, performances et mouvements RH
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm max-w-2xl">
                  Suivez les performances, congés et développements de votre équipe JIRAMA
                </p>
              </div>
              <button 
                onClick={() => {
                  setCurrent(null)
                  setModalOpen(true)
                }}
                className="mt-3 md:mt-0 md:mr-2 group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg font-medium text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Nouvel Employé
                </span>
              </button>
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
                className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 hover:shadow-sm cursor-pointer"
              >
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-sm`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    {stat.change && (
                      <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Controls Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
              <div className="relative">
                <select
                  className="appearance-none pl-10 pr-8 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept === "Tous" ? "Tous départements" : dept}
                    </option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              <div className="relative">
                <select
                  className="appearance-none pl-10 pr-8 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "Tous" ? "Tous statuts" : status}
                    </option>
                  ))}
                </select>
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-900 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                  🏢
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-900 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Personnel Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPersonnel.map((person) => (
              <div
                key={person.id}
                className={`group relative overflow-hidden bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 hover:shadow-md`}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${person.avatarColor || 'from-gray-400 to-gray-600'} flex items-center justify-center shadow-sm`}>
                      <span className="text-white text-sm font-bold">{person.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{person.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{person.position}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig[person.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                          {statusConfig[person.status]?.icon || '⚪'} {person.status}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{person.matricule}</span>
                      </div>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="mb-4">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium text-white ${departmentColors[person.department] || 'bg-gradient-to-br from-gray-500 to-gray-700'}`}>
                      {person.department}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-center gap-2.5 text-xs">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300 truncate">{person.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{person.phone}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">Depuis {formatDate(person.joinDate)}</span>
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Performance</span>
                      <span className="font-bold text-gray-900 dark:text-white">{person.performance || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full bg-gradient-to-r ${person.avatarColor || 'from-gray-400 to-gray-600'}`}
                        style={{ width: `${Math.min(100, person.performance || 0)}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => openDetail(person)} 
                        className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Voir
                      </button>
                      <button 
                        onClick={() => handleDownloadReport(person.id, person.name)}
                        className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        PDF
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          openEdit(person)
                        }}
                        className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Modifier
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrent(person)
                          setDeleteOpen(true)
                        }}
                        className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Employé</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Département</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Statut</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Performance</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredPersonnel.map((person) => (
                    <tr 
                      key={person.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${person.avatarColor || 'from-gray-400 to-gray-600'} flex items-center justify-center`}>
                            <span className="text-white text-sm font-bold">{person.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{person.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">{person.position}</p>
                              <span className="text-xs text-gray-400">•</span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{person.matricule}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium text-white ${departmentColors[person.department] || 'bg-gradient-to-br from-gray-500 to-gray-700'}`}>
                          {person.department}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs text-gray-700 dark:text-gray-300">{person.email}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{person.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[person.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                            {statusConfig[person.status]?.icon || '⚪'} {person.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900 dark:text-white text-sm">{person.performance || 0}%</span>
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full bg-gradient-to-r ${person.avatarColor || 'from-gray-400 to-gray-600'}`}
                              style={{ width: `${Math.min(100, person.performance || 0)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => openDetail(person)}
                            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button 
                            onClick={() => handleDownloadReport(person.id, person.name)}
                            className="p-1.5 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          </button>
                          <button 
                            onClick={() => openEdit(person)}
                            className="p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          </button>
                          <button 
                            onClick={() => {
                              setCurrent(person)
                              setDeleteOpen(true)
                            }}
                            className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredPersonnel.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">Aucun employé trouvé</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Essayez de modifier vos filtres de recherche
            </p>
            <button
              onClick={() => {
                setSelectedDepartment("Tous")
                setSelectedStatus("Tous")
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:shadow-md transition-all text-sm"
            >
              Réinitialiser les filtres
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Affichage de <span className="font-semibold text-gray-900 dark:text-white">{(page-1)*limit+1}-{Math.min(page*limit, total)}</span> sur <span className="font-semibold text-gray-900 dark:text-white">{total}</span> employés
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => goToPage(page-1)} 
                disabled={page === 1}
                className="px-2.5 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                ←
              </button>
              {Array.from({ length: Math.min(7, totalPages) }).map((_, idx) => {
                const p = Math.max(1, Math.min(totalPages, page - 3 + idx))
                return (
                  <button 
                    key={p} 
                    onClick={() => goToPage(p)} 
                    className={`px-2.5 py-1.5 rounded-md ${p===page ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    {p}
                  </button>
                )
              })}
              <button 
                onClick={() => goToPage(page+1)} 
                disabled={page === totalPages}
                className="px-2.5 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                →
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        )}

        {/* Modals */}
        <PersonnelFormModal 
          open={modalOpen} 
          onClose={() => setModalOpen(false)} 
          onSave={handleSave} 
          initial={current}
          departments={departmentsList}
        />
        <PersonnelDetailModal 
          open={detailOpen} 
          onClose={() => setDetailOpen(false)} 
          person={current}
        />
        <ConfirmDeleteModal 
          open={deleteOpen} 
          onClose={() => setDeleteOpen(false)} 
          onConfirm={handleDelete}
          name={current?.name}
        />
      </div>
    </MainLayout>
  )
}