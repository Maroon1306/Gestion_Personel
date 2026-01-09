"use client"

import MainLayout from "@/components/MainLayout"
import { BarChart3, PieChartIcon, Download, Plus } from "lucide-react"

export default function ReportsPage() {
  const reports = [
    { id: "R001", name: "Rapport Mensuel RH", date: "2024-01-07", type: "PDF", size: "2.5 MB" },
    { id: "R002", name: "Statistiques Département", date: "2024-01-05", type: "Excel", size: "1.2 MB" },
    { id: "R003", name: "Analyse Salaires", date: "2024-01-03", type: "PDF", size: "3.1 MB" },
    { id: "R004", name: "Turnover Annuel", date: "2024-01-01", type: "Excel", size: "850 KB" },
  ]

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Rapports et Statistiques</h1>
            <p className="text-muted-foreground">Génération et gestion des rapports RH</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-orange-600 transition-colors font-medium">
            <Plus className="w-4 h-4" />
            Nouveau rapport
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-modern p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rapports Générés</p>
                <p className="text-2xl font-bold text-foreground mt-2">47</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="card-modern p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ce Mois</p>
                <p className="text-2xl font-bold text-foreground mt-2">8</p>
              </div>
              <PieChartIcon className="w-8 h-8 text-accent" />
            </div>
          </div>
          <div className="card-modern p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs</p>
                <p className="text-2xl font-bold text-foreground mt-2">12</p>
              </div>
              <Download className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="card-modern">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Rapports Récents</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nom</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Taille</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{report.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{report.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-medium ${report.type === "PDF" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                      >
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{report.size}</td>
                    <td className="px-6 py-4">
                      <button className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-orange-600 transition-colors">
                        <Download className="w-4 h-4" />
                        Télécharger
                      </button>
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
