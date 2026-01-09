"use client"

import MainLayout from "@/components/MainLayout"
import { Plus, AlertCircle } from "lucide-react"

interface MedicalRecord {
  id: string
  name: string
  date: string
  type: "Visite médicale" | "Vaccination" | "Examen"
  doctor: string
  status: "Complété" | "Pending" | "Urgent"
}

const mockRecords: MedicalRecord[] = [
  {
    id: "M001",
    name: "Jean Michel Rakoto",
    date: "2024-01-05",
    type: "Visite médicale",
    doctor: "Dr. Rakoto",
    status: "Complété",
  },
  {
    id: "M002",
    name: "Marie Claire Andriamampoinimerina",
    date: "2024-01-04",
    type: "Vaccination",
    doctor: "Dr. Jean",
    status: "Complété",
  },
  {
    id: "M003",
    name: "Samuel Rabearisoa",
    date: "2024-01-06",
    type: "Examen",
    doctor: "Dr. Rakoto",
    status: "Pending",
  },
  {
    id: "M004",
    name: "Nathalie Razafindralambo",
    date: "2024-01-02",
    type: "Visite médicale",
    doctor: "Dr. Jean",
    status: "Complété",
  },
]

const statusColors: Record<string, string> = {
  Complété: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Urgent: "bg-red-100 text-red-700",
}

export default function MedicalPage() {
  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Suivi Médical</h1>
            <p className="text-muted-foreground">Gestion des dossiers médicaux et santé des employés</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-orange-600 transition-colors font-medium">
            <Plus className="w-4 h-4" />
            Ajouter un dossier
          </button>
        </div>

        {/* Alert */}
        <div className="card-modern p-4 bg-yellow-50 border-yellow-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-900">Attention requise</p>
            <p className="text-sm text-yellow-800">3 dossiers en attente de traitement</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-modern p-4">
            <p className="text-sm text-muted-foreground">Total Dossiers</p>
            <p className="text-2xl font-bold text-foreground mt-2">2,543</p>
          </div>
          <div className="card-modern p-4">
            <p className="text-sm text-muted-foreground">À Jour</p>
            <p className="text-2xl font-bold text-foreground mt-2">2,320</p>
          </div>
          <div className="card-modern p-4">
            <p className="text-sm text-muted-foreground">En Attente</p>
            <p className="text-2xl font-bold text-foreground mt-2">150</p>
          </div>
          <div className="card-modern p-4">
            <p className="text-sm text-muted-foreground">Urgent</p>
            <p className="text-2xl font-bold text-foreground mt-2">73</p>
          </div>
        </div>

        {/* Medical Records */}
        <div className="card-modern overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Employé</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Médecin</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Statut</th>
                </tr>
              </thead>
              <tbody>
                {mockRecords.map((record) => (
                  <tr key={record.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{record.name}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{record.type}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{record.date}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{record.doctor}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[record.status]}`}
                      >
                        {record.status}
                      </span>
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
