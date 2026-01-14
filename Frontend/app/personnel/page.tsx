"use client"

import { useState } from "react"
import MainLayout from "@/components/MainLayout"
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  Download,
  User,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Users,
  TrendingUp,
  Shield,
  Award
} from "lucide-react"
import { useSearch } from "@/context/SearchContext"

interface Personnel {
  id: string
  name: string
  position: string
  department: string
  email: string
  phone: string
  status: "Actif" | "Congé" | "Arrêt maladie" | "Formation"
  joinDate: string
  avatarColor: string
  performance: number
  projects: number
}

const mockPersonnel: Personnel[] = [
  {
    id: "P001",
    name: "Jean Michel Rakoto",
    position: "Ingénieur Électrique",
    department: "Maintenance",
    email: "jean.rakoto@jirama.mg",
    phone: "+261 32 123 4567",
    status: "Actif",
    joinDate: "2020-03-15",
    avatarColor: "from-blue-500 to-cyan-500",
    performance: 92,
    projects: 12
  },
  {
    id: "P002",
    name: "Marie Claire Andriamampoinimerina",
    position: "Responsable RH",
    department: "Ressources Humaines",
    email: "marie.andriamampoinimerina@jirama.mg",
    phone: "+261 33 456 7890",
    status: "Actif",
    joinDate: "2019-07-22",
    avatarColor: "from-emerald-500 to-green-500",
    performance: 95,
    projects: 8
  },
  {
    id: "P003",
    name: "Samuel Rabearisoa",
    position: "Technicien Réseau",
    department: "Infrastructure",
    email: "samuel.rabearisoa@jirama.mg",
    phone: "+261 34 789 0123",
    status: "Congé",
    joinDate: "2021-01-10",
    avatarColor: "from-violet-500 to-purple-500",
    performance: 88,
    projects: 15
  },
  {
    id: "P004",
    name: "Nathalie Razafindralambo",
    position: "Comptable Senior",
    department: "Finance",
    email: "nathalie.razafindralambo@jirama.mg",
    phone: "+261 32 345 6789",
    status: "Actif",
    joinDate: "2018-11-05",
    avatarColor: "from-rose-500 to-pink-500",
    performance: 96,
    projects: 20
  },
  {
    id: "P005",
    name: "Robert Andriantsitohaina",
    position: "Chef de Projet",
    department: "Développement",
    email: "robert.andriantsitohaina@jirama.mg",
    phone: "+261 33 987 6543",
    status: "Formation",
    joinDate: "2022-05-18",
    avatarColor: "from-amber-500 to-orange-500",
    performance: 85,
    projects: 25
  },
  {
    id: "P006",
    name: "Sophie Ranarison",
    position: "Analyste Sécurité",
    department: "Sécurité",
    email: "sophie.ranarison@jirama.mg",
    phone: "+261 34 567 8901",
    status: "Actif",
    joinDate: "2020-09-30",
    avatarColor: "from-indigo-500 to-blue-500",
    performance: 94,
    projects: 18
  },
]

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
  "Infrastructure": "bg-gradient-to-r from-violet-500 to-purple-500",
  "Finance": "bg-gradient-to-r from-rose-500 to-pink-500",
  "Développement": "bg-gradient-to-r from-amber-500 to-orange-500",
  "Sécurité": "bg-gradient-to-r from-indigo-500 to-blue-500",
}

export default function PersonnelPage() {
  const { search, setSearch } = useSearch()
  const [selectedDepartment, setSelectedDepartment] = useState("Tous")
  const [selectedStatus, setSelectedStatus] = useState("Tous")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const departments = ["Tous", ...new Set(mockPersonnel.map((p) => p.department))]
  const statuses = ["Tous", ...new Set(mockPersonnel.map((p) => p.status))]

  const filteredPersonnel = mockPersonnel.filter(
    (p) =>
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.position.toLowerCase().includes(search.toLowerCase())) &&
      (selectedDepartment === "Tous" || p.department === selectedDepartment) &&
      (selectedStatus === "Tous" || p.status === selectedStatus)
  )

  const stats = [
    { label: "Total Personnel", value: "2,543", change: "+2.5%", icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "En Congé", value: "142", change: "-0.3%", icon: Shield, color: "from-amber-500 to-orange-500" },
    { label: "Performance Moy.", value: "92.5%", change: "+1.2%", icon: TrendingUp, color: "from-emerald-500 to-green-500" },
    { label: "Top Performers", value: "186", change: "+4.8%", icon: Award, color: "from-violet-500 to-purple-500" },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <MainLayout>
      <div className="p-4 space-y-5">
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
              <button className="mt-3 md:mt-0 group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg font-medium text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                <span className="relative z-10 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nouvel Employé
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

        {/* Controls Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Search */}
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300" />
                <input
                  type="text"
                  placeholder="Rechercher un employé par nom, poste, matricule..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2.5">
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

              <button className="px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exporter
              </button>
            </div>
          </div>
        </div>

        {/* Personnel Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPersonnel.map((person) => (
              <div
                key={person.id}
                className={`group relative overflow-hidden bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 hover:shadow-md cursor-pointer`}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${person.avatarColor} flex items-center justify-center shadow-sm`}>
                      <span className="text-white text-sm font-bold">{person.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{person.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{person.position}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig[person.status].color}`}>
                          {statusConfig[person.status].icon} {person.status}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{person.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="mb-4">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium text-white ${departmentColors[person.department]}`}>
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
                      <span className="font-bold text-gray-900 dark:text-white">{person.performance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full bg-gradient-to-r ${person.avatarColor}`}
                        style={{ width: `${person.performance}%` }}
                      />
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Projets</span>
                      <span className="font-bold text-gray-900 dark:text-white">{person.projects} projets</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <button className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                        <Eye className="w-3.5 h-3.5" />
                        Voir
                      </button>
                      <button className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                        <Edit className="w-3.5 h-3.5" />
                        Modifier
                      </button>
                      <button className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300">
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
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${person.avatarColor} flex items-center justify-center`}>
                            <span className="text-white text-sm font-bold">{person.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{person.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">{person.position}</p>
                              <span className="text-xs text-gray-400">•</span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{person.id}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium text-white ${departmentColors[person.department]}`}>
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
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[person.status].color}`}>
                            {statusConfig[person.status].icon} {person.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900 dark:text-white text-sm">{person.performance}%</span>
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full bg-gradient-to-r ${person.avatarColor}`}
                              style={{ width: `${person.performance}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button className="p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                            <Edit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          </button>
                          <button className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
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
        {filteredPersonnel.length === 0 && (
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
                setSearch("")
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
        {filteredPersonnel.length > 0 && (
          <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Affichage de <span className="font-semibold text-gray-900 dark:text-white">1-{filteredPersonnel.length}</span> sur <span className="font-semibold text-gray-900 dark:text-white">2,543</span> employés
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2.5 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                ←
              </button>
              <button className="px-2.5 py-1.5 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm">
                1
              </button>
              <button className="px-2.5 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                2
              </button>
              <button className="px-2.5 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                3
              </button>
              <span className="px-1.5 text-sm text-gray-500">...</span>
              <button className="px-2.5 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                42
              </button>
              <button className="px-2.5 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}