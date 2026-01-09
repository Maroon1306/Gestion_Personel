"use client"

import { useState } from "react"
import MainLayout from "@/components/MainLayout"
import { Search, Plus, Shield, Edit, Trash2, Eye } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "ADMIN_USER" | "ADMIN_RH" | "USER"
  status: "Actif" | "Inactif"
  lastLogin: string
  avatar: string
}

const mockUsers: User[] = [
  {
    id: "U001",
    name: "Admin Utilisateurs",
    email: "admin@jirama.mg",
    role: "ADMIN_USER",
    status: "Actif",
    lastLogin: "2024-01-07 14:30",
    avatar: "AU",
  },
  {
    id: "U002",
    name: "Admin RH",
    email: "admin.rh@jirama.mg",
    role: "ADMIN_RH",
    status: "Actif",
    lastLogin: "2024-01-07 13:15",
    avatar: "AR",
  },
  {
    id: "U003",
    name: "Utilisateur Standard",
    email: "user@jirama.mg",
    role: "USER",
    status: "Actif",
    lastLogin: "2024-01-06 11:45",
    avatar: "US",
  },
]

const roleColors: Record<string, string> = {
  ADMIN_USER: "bg-purple-100 text-purple-700",
  ADMIN_RH: "bg-blue-100 text-blue-700",
  USER: "bg-gray-100 text-gray-700",
}

const roleLabels: Record<string, string> = {
  ADMIN_USER: "Admin Utilisateurs",
  ADMIN_RH: "Admin RH",
  USER: "Utilisateur",
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("Tous")

  const filteredUsers = mockUsers.filter(
    (u) =>
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedRole === "Tous" || u.role === selectedRole),
  )

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des Utilisateurs</h1>
            <p className="text-muted-foreground">Créez et gérez les comptes utilisateurs de l'application</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-orange-600 transition-colors font-medium">
            <Plus className="w-4 h-4" />
            Nouvel utilisateur
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-modern p-4">
            <p className="text-sm text-muted-foreground">Total Utilisateurs</p>
            <p className="text-2xl font-bold text-foreground mt-2">{mockUsers.length}</p>
          </div>
          <div className="card-modern p-4">
            <p className="text-sm text-muted-foreground">Utilisateurs Actifs</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {mockUsers.filter((u) => u.status === "Actif").length}
            </p>
          </div>
          <div className="card-modern p-4">
            <p className="text-sm text-muted-foreground">Admins</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {mockUsers.filter((u) => u.role.startsWith("ADMIN")).length}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="Tous">Tous les rôles</option>
            <option value="ADMIN_USER">Admin Utilisateurs</option>
            <option value="ADMIN_RH">Admin RH</option>
            <option value="USER">Utilisateur</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="card-modern overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nom</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Rôle</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Dernière Connexion</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                          {user.avatar}
                        </div>
                        <p className="font-medium text-foreground">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}
                      >
                        <Shield className="w-3 h-3" />
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${user.status === "Actif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{user.lastLogin}</td>
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
