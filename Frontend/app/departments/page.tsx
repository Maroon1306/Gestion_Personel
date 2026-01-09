"use client"

import MainLayout from "@/components/MainLayout"
import { Users, TrendingUp, Plus } from "lucide-react"

interface Department {
  id: string
  name: string
  head: string
  employees: number
  budget: string
  status: "Actif" | "Inactif"
}

const mockDepartments: Department[] = [
  { id: "D001", name: "Maintenance", head: "Jean Rakoto", employees: 125, budget: "450,000", status: "Actif" },
  {
    id: "D002",
    name: "Ressources Humaines",
    head: "Marie Andriamampoinimerina",
    employees: 8,
    budget: "80,000",
    status: "Actif",
  },
  { id: "D003", name: "Infrastructure", head: "Samuel Rabearisoa", employees: 42, budget: "250,000", status: "Actif" },
  { id: "D004", name: "Finance", head: "Nathalie Razafindralambo", employees: 15, budget: "150,000", status: "Actif" },
]

export default function DepartmentsPage() {
  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des Départements</h1>
            <p className="text-muted-foreground">Vue d'ensemble des départements et du personnel</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-orange-600 transition-colors font-medium">
            <Plus className="w-4 h-4" />
            Nouveau département
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-modern p-4">
            <p className="text-sm text-muted-foreground">Total Départements</p>
            <p className="text-2xl font-bold text-foreground mt-2">{mockDepartments.length}</p>
          </div>
          <div className="card-modern p-4">
            <p className="text-sm text-muted-foreground">Total Employés</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {mockDepartments.reduce((sum, d) => sum + d.employees, 0)}
            </p>
          </div>
          <div className="card-modern p-4">
            <p className="text-sm text-muted-foreground">Budget Annuel</p>
            <p className="text-2xl font-bold text-foreground mt-2">930,000</p>
          </div>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockDepartments.map((dept) => (
            <div key={dept.id} className="card-modern p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{dept.name}</h3>
                  <p className="text-sm text-muted-foreground">Chef: {dept.head}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${dept.status === "Actif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {dept.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Employés</span>
                  </div>
                  <span className="font-semibold text-foreground">{dept.employees}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Budget Annuel</span>
                  </div>
                  <span className="font-semibold text-foreground">{dept.budget}</span>
                </div>

                <div className="pt-4 border-t border-border">
                  <button className="w-full px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium">
                    Voir les détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
