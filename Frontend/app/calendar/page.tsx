"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/MainLayout"
import { Calendar, Clock, MapPin, Users, Filter, Plus, ChevronLeft, ChevronRight, Download, Search, MoreVertical, Edit, Trash2, Eye } from "lucide-react"
import { useSearch } from "@/context/SearchContext"

interface WorkEvent {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  participants: string[]
  status: "planifié" | "en cours" | "terminé" | "annulé"
  department: string
  priority: "basse" | "moyenne" | "haute"
  createdBy: string
}

export default function CalendarPage() {
  const router = useRouter()
  const { search, setSearch } = useSearch()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  const [events, setEvents] = useState<WorkEvent[]>([])
  const [filterDepartment, setFilterDepartment] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Données de démonstration pour les événements
  const demoEvents: WorkEvent[] = [
    {
      id: "1",
      title: "Maintenance Réseau Électrique",
      description: "Maintenance préventive du réseau électrique principal dans la zone industrielle",
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 8, 0),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 17, 0),
      location: "Zone Industrielle Antananarivo",
      participants: ["Jean Dupont", "Marie Lambert", "Paul Martin"],
      status: "planifié",
      department: "Maintenance",
      priority: "haute",
      createdBy: "admin@jirama.mg"
    },
    {
      id: "2",
      title: "Formation Sécurité",
      description: "Formation sur les procédures de sécurité électrique",
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 18, 9, 0),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 18, 12, 0),
      location: "Salle de Conférence - Siège",
      participants: ["Tous les techniciens"],
      status: "planifié",
      department: "RH",
      priority: "moyenne",
      createdBy: "admin.rh@jirama.mg"
    },
    {
      id: "3",
      title: "Réunion Équipe Maintenance",
      description: "Revue hebdomadaire des opérations de maintenance",
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 20, 14, 0),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 20, 16, 0),
      location: "Bureau Chef Maintenance",
      participants: ["Équipe Maintenance"],
      status: "en cours",
      department: "Maintenance",
      priority: "moyenne",
      createdBy: "user@jirama.mg"
    },
    {
      id: "4",
      title: "Contrôle Qualité Eau",
      description: "Contrôle périodique de la qualité de l'eau dans les stations",
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 22, 10, 0),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 22, 15, 0),
      location: "Station de Traitement Eau",
      participants: ["Sophie Bernard", "Luc Dubois"],
      status: "terminé",
      department: "Qualité",
      priority: "basse",
      createdBy: "admin@jirama.mg"
    },
    {
      id: "5",
      title: "Audit Comptable",
      description: "Audit trimestriel des comptes financiers",
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25, 9, 0),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 27, 17, 0),
      location: "Service Comptabilité",
      participants: ["Équipe Comptabilité", "Auditeurs externes"],
      status: "planifié",
      department: "Finance",
      priority: "haute",
      createdBy: "admin@jirama.mg"
    }
  ]

  useEffect(() => {
    setEvents(demoEvents)
  }, [])

  const getStatusColor = (status: WorkEvent["status"]) => {
    switch (status) {
      case "planifié": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "en cours": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      case "terminé": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
      case "annulé": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    }
  }

  const getPriorityColor = (priority: WorkEvent["priority"]) => {
    switch (priority) {
      case "haute": return "border-l-4 border-l-red-500"
      case "moyenne": return "border-l-4 border-l-amber-500"
      case "basse": return "border-l-4 border-l-emerald-500"
    }
  }

  const getDayEvents = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear()
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const today = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)
    
    const days = []
    
    // Jours du mois précédent
    const prevMonthDays = getDaysInMonth(year, month - 1)
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = prevMonthDays - i
      days.push({
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
        events: getDayEvents(new Date(year, month - 1, day))
      })
    }
    
    // Jours du mois courant
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({
        date,
        isCurrentMonth: true,
        events: getDayEvents(date)
      })
    }
    
    // Jours du mois suivant
    const totalCells = 42 // 6 semaines * 7 jours
    const nextMonthStart = days.length
    for (let i = 1; i <= totalCells - nextMonthStart; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        events: getDayEvents(new Date(year, month + 1, i))
      })
    }
    
    return days
  }

  return (
    <MainLayout>
      <div className="p-2 md:p-2 space-y-4 mr-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Calendrier des Événements</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gérez les événements et rendez-vous de travail JIRAMA
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-3 md:mt-0">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Download className="w-4 h-4" />
              Exporter
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:shadow-md transition-all text-sm">
              <Plus className="w-4 h-4" />
              Nouvel Événement
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Événements Planifiés</p>
                <p className="text-2xl font-bold mt-2">
                  {events.filter(e => e.status === 'planifié').length}
                </p>
              </div>
              <div className="p-2.5 bg-blue-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-400">+{events.filter(e => e.status === 'planifié').length}</span>
                <span className="opacity-70">ce mois-ci</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">En Cours</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {events.filter(e => e.status === 'en cours').length}
                </p>
              </div>
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-amber-600 dark:text-amber-400">{events.filter(e => e.status === 'en cours').length}</span>
                <span className="text-gray-500 dark:text-gray-400">actifs</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Terminés</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {events.filter(e => e.status === 'terminé').length}
                </p>
              </div>
              <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-emerald-600 dark:text-emerald-400">{events.filter(e => e.status === 'terminé').length}</span>
                <span className="text-gray-500 dark:text-gray-400">ce mois</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Priorité Haute</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {events.filter(e => e.priority === 'haute').length}
                </p>
              </div>
              <div className="p-2.5 bg-red-500/10 rounded-lg">
                <Filter className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-red-600 dark:text-red-400">{events.filter(e => e.priority === 'haute').length}</span>
                <span className="text-gray-500 dark:text-gray-400">urgents</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rechercher</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un événement..."
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <h2 className="text-base font-semibold text-gray-900 dark:text-white min-w-[140px] text-center">
                  {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </h2>
                
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vue</label>
                <div className="flex gap-2">
                  {(['month', 'week', 'day'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-4 py-2 rounded-md text-sm capitalize transition-all ${
                        viewMode === mode 
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {mode === 'month' ? 'Mois' : mode === 'week' ? 'Semaine' : 'Jour'}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={today}
                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Aujourd'hui
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Filter className="w-4 h-4" />
                Filtres
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {renderCalendar().map((day, index) => {
                  const isToday = day.date.toDateString() === new Date().toDateString()
                  const isSelected = day.date.toDateString() === selectedDate.toDateString()
                  
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedDate(day.date)}
                      className={`min-h-24 p-2 rounded-lg border transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-300 dark:border-orange-700'
                          : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      } ${!day.isCurrentMonth ? 'opacity-40' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${
                          isToday 
                            ? 'w-6 h-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full flex items-center justify-center'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {day.date.getDate()}
                        </span>
                        {day.events.length > 0 && (
                          <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></span>
                        )}
                      </div>
                      
                      {/* Events for the day */}
                      <div className="space-y-1">
                        {day.events.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded truncate ${getPriorityColor(event.priority)} ${
                              getStatusColor(event.status).split(' ')[0]
                            }`}
                            title={event.title}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-xs opacity-75">{formatTime(new Date(event.startDate))}</div>
                          </div>
                        ))}
                        {day.events.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            +{day.events.length - 2} autres
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          
          {/* Selected Day Details */}
          <div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 h-full">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                {formatDate(selectedDate)}
              </h3>
              
              <div className="space-y-3">
                {getDayEvents(selectedDate).length > 0 ? (
                  getDayEvents(selectedDate).map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border border-gray-200 dark:border-gray-800 ${getPriorityColor(event.priority)}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {event.title}
                          </h4>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs mt-1 ${
                            getStatusColor(event.status)
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(new Date(event.startDate))} - {formatTime(new Date(event.endDate))}
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.location}
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Users className="w-3.5 h-3.5" />
                          {event.participants.length} participant(s)
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                          {event.department}
                        </span>
                        <div className="flex items-center gap-1">
                          <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                            <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30">
                            <Edit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          </button>
                          <button className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30">
                            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Aucun événement prévu pour cette journée
                    </p>
                  </div>
                )}
              </div>
              
              {/* Statistics */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Statistiques du mois
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2.5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {events.filter(e => e.status === 'planifié').length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Planifiés</div>
                  </div>
                  <div className="text-center p-2.5 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg">
                    <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {events.filter(e => e.status === 'en cours').length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">En cours</div>
                  </div>
                  <div className="text-center p-2.5 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {events.filter(e => e.status === 'terminé').length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Terminés</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}