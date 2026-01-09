"use client"

import { useState } from "react"
import MainLayout from "@/components/MainLayout"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"

interface Personnel {
  id: string
  name: string
  position: string
  department: string
  email: string
  phone: string
  status: "Actif" | "Congé" | "Arrêt maladie"
  joinDate: string
  avatar: string
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
    avatar: "JR",
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
    avatar: "MC",
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
    avatar: "SR",
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
    avatar: "NR",
  },
]

const statusColors: Record<string, string> = {
  Actif: "bg-green-100 text-green-700",
  Congé: "bg-yellow-100 text-yellow-700",
  "Arrêt maladie": "bg-red-100 text-red-700",
}

export default function PersonnelPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("Tous")

  const filteredPersonnel = mockPersonnel.filter(
    (p) =>
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.position.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedDepartment === "Tous" || p.department === selectedDepartment),
  )

  const departments = ["Tous", ...new Set(mockPersonnel.map((p) => p.department))]

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestion du Personnel</h1>
            <p className="text-muted-foreground">Gestion complète du personnel et des mouvements RH</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-orange-600 transition-colors font-medium">
            <Plus className="w-4 h-4" />
            Ajouter un employé
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-modern p-4">
            <p className="text-sm text-muted-foreground">Total Personnel</p>
            <p className="text-2xl font-bold text-foreground mt-2">2,543</p>
          </div>
          <div className="card-modern p-4">
            <p className="text-sm text-muted-foreground">En Congé</p>
            <p className="text-2xl font-bold text-foreground mt-2">142</p>
          </div>
          <div className="card-modern p-4">
            <p className="text-sm text-muted-foreground">Arrêt Maladie</p>
            <p className="text-2xl font-bold text-foreground mt-2">18</p>
          </div>
          <div className="card-modern p-4">
            <p className="text-sm text-muted-foreground">Nouveaux (30j)</p>
            <p className="text-2xl font-bold text-foreground mt-2">23</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par nom ou position..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Personnel Table */}
        <div className="card-modern overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nom</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Position</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Département</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersonnel.map((person) => (
                  <tr key={person.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                          {person.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{person.name}</p>
                          <p className="text-xs text-muted-foreground">{person.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{person.position}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{person.department}</td>
                    <td className="px-6 py-4 text-sm">
                      <p className="text-foreground">{person.email}</p>
                      <p className="text-muted-foreground">{person.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[person.status]}`}
                      >
                        {person.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-secondary rounded transition-colors">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-1 hover:bg-secondary rounded transition-colors">
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-1 hover:bg-secondary rounded transition-colors">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
