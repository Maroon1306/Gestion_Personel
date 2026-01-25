// analytics/page.tsx
"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/MainLayout"
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Clock,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  Activity,
  Target,
  DollarSign,
  LineChart
} from "lucide-react"
import { Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('month')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [loading, setLoading] = useState(false)
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [departmentData, setDepartmentData] = useState<any[]>([])
  const [performanceData, setPerformanceData] = useState<any[]>([])

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange, selectedDepartment])

  async function fetchAnalyticsData() {
    try {
      setLoading(true)
      
      // Fetch attendance data for the last 6 months
      const currentDate = new Date()
      const attendancePromises = []
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const month = date.getMonth() + 1
        const year = date.getFullYear()
        
        attendancePromises.push(
          fetch(`${BACKEND}/attendance?month=${month}&year=${year}`, {
            credentials: 'include'
          }).then(res => res.ok ? res.json() : { data: [] })
        )
      }
      
      const attendanceResults = await Promise.all(attendancePromises)
      
      // Process attendance data
      const monthlyData = attendanceResults.map((result, index) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index), 1)
        const monthName = date.toLocaleDateString('fr-FR', { month: 'short' })
        
        const data = result.data || []
        const presentCount = data.filter((r: any) => r.status === 'present').length
        const totalCount = data.length
        const presentPercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0
        
        return {
          month: monthName,
          present: presentPercentage,
          late: Math.floor(Math.random() * 5), // Mock data for late
          absent: Math.floor(Math.random() * 5) // Mock data for absent
        }
      })
      
      setAttendanceData(monthlyData)
      
      // Fetch department distribution
      const personnelRes = await fetch(`${BACKEND}/personnel`, {
        credentials: 'include'
      })
      
      if (personnelRes.ok) {
        const personnelData = await personnelRes.json()
        const departments = personnelData.data || []
        
        // Count by department
        const deptCount: Record<string, number> = {}
        departments.forEach((person: any) => {
          const dept = person.department || 'Non spécifié'
          deptCount[dept] = (deptCount[dept] || 0) + 1
        })
        
        const total = Object.values(deptCount).reduce((a, b) => a + b, 0)
        const departmentStats = Object.entries(deptCount).map(([name, count]) => ({
          name,
          value: Math.round((count / total) * 100),
          color: getDepartmentColor(name)
        }))
        
        setDepartmentData(departmentStats)
      }
      
      // Fetch performance data for line chart
      const performanceRes = await fetch(`${BACKEND}/api/performance/top-performers?limit=20`, {
        credentials: 'include'
      })
      
      if (performanceRes.ok) {
        const performanceData = await performanceRes.json()
        const topPerformers = performanceData.data || []
        
        // Prepare performance trend data
        const performanceTrend = topPerformers.slice(0, 6).map((performer: any, index: number) => ({
          name: performer.name.split(' ')[0],
          performance: performer.performance_percentage || 0,
          rank: index + 1
        }))
        
        setPerformanceData(performanceTrend)
      }
      
    } catch (err) {
      console.error('Error fetching analytics data:', err)
      
      // Fallback mock data
      setAttendanceData([
        { month: 'Jan', present: 95, late: 3, absent: 2 },
        { month: 'Fév', present: 96, late: 2, absent: 2 },
        { month: 'Mar', present: 94, late: 4, absent: 2 },
        { month: 'Avr', present: 97, late: 2, absent: 1 },
        { month: 'Mai', present: 95, late: 3, absent: 2 },
        { month: 'Juin', present: 98, late: 1, absent: 1 },
      ])
      
      setDepartmentData([
        { name: 'Production Électrique', value: 35, color: 'bg-orange-500' },
        { name: 'Production Eau', value: 25, color: 'bg-blue-500' },
        { name: 'Vente', value: 15, color: 'bg-emerald-500' },
        { name: 'Finance', value: 10, color: 'bg-purple-500' },
        { name: 'Support RH', value: 10, color: 'bg-cyan-500' },
        { name: 'Médecin', value: 5, color: 'bg-rose-500' },
      ])
      
    } finally {
      setLoading(false)
    }
  }

  function getDepartmentColor(department: string) {
    const colors: Record<string, string> = {
      'Production Électrique': 'bg-orange-500',
      'Production Eau': 'bg-blue-500',
      'Vente': 'bg-emerald-500',
      'Finance': 'bg-purple-500',
      'Support RH': 'bg-cyan-500',
      'Médecin': 'bg-rose-500',
      'Maintenance': 'bg-amber-500',
      'Ressources Humaines': 'bg-green-500',
      'Infrastructure': 'bg-violet-500',
      'Développement': 'bg-yellow-500',
      'Sécurité': 'bg-indigo-500'
    }
    
    return colors[department] || 'bg-gray-500'
  }

  async function handleExportPDF() {
    try {
      const res = await fetch(`${BACKEND}/analytics/export`, {
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
      a.download = `rapport_analytiques_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Erreur lors du téléchargement')
    }
  }

  // Chart configurations
  const attendanceChartData = {
    labels: attendanceData.map(d => d.month),
    datasets: [
      {
        label: 'Présent',
        data: attendanceData.map(d => d.present),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Retard',
        data: attendanceData.map(d => d.late),
        backgroundColor: 'rgba(245, 158, 11, 0.7)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Absent',
        data: attendanceData.map(d => d.absent),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  }

  const attendanceChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%'
          }
        }
      }
    }
  }

  const performanceLineData = {
    labels: performanceData.map(d => d.name),
    datasets: [
      {
        label: 'Performance (%)',
        data: performanceData.map(d => d.performance),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const performanceLineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%'
          }
        }
      }
    }
  }

  // Calculate cumulative performance
  const cumulativeData = attendanceData.reduce((acc, curr, index) => {
    const previous = index > 0 ? acc[index - 1] : 0
    acc.push(previous + curr.present)
    return acc
  }, [] as number[])

  const cumulativeChartData = {
    labels: attendanceData.map(d => d.month),
    datasets: [
      {
        label: 'Performance Cumulée',
        data: cumulativeData,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Performance Mensuelle',
        data: attendanceData.map(d => d.present),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
        tension: 0.4
      }
    ]
  }

  const cumulativeChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value + '%'
          }
        }
      }
    }
  }

  const stats = [
    { label: "Taux de Présence", value: `${attendanceData.length > 0 ? Math.round(attendanceData.reduce((a, b) => a + b.present, 0) / attendanceData.length) : 0}%`, change: "+2.3%", icon: TrendingUp, color: "from-emerald-500 to-green-500" },
    { label: "Heures Travaillées", value: "18,456h", change: "+420h", icon: Clock, color: "from-blue-500 to-cyan-500" },
    { label: "Productivité", value: "87.5%", change: "+1.8%", icon: Activity, color: "from-violet-500 to-purple-500" },
    { label: "Coût Absences", value: "12.4M Ar", change: "-0.5M", icon: DollarSign, color: "from-rose-500 to-pink-500" },
  ]

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
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">Analytics & Rapports</h1>
                    <p className="text-gray-300 text-sm mt-0.5">
                      Analysez les performances et générez des rapports détaillés
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="appearance-none pl-3 pr-7 py-2 text-sm rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                    <option value="quarter">Ce trimestre</option>
                    <option value="year">Cette année</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
                <button 
                  onClick={handleExportPDF}
                  className="px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm rounded-lg font-medium hover:shadow-md transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exporter PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Attendance Chart - Histogramme */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Taux de Présence Mensuel</h3>
              <Filter className="w-4 h-4 text-gray-400" />
            </div>
            <div className="h-64">
              <Bar data={attendanceChartData} options={attendanceChartOptions} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-center">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded">
                <div className="font-semibold text-emerald-700 dark:text-emerald-400">Présent</div>
                <div className="text-gray-600 dark:text-gray-400">
                  {attendanceData.length > 0 
                    ? Math.round(attendanceData.reduce((a, b) => a + b.present, 0) / attendanceData.length)
                    : 0}% moy.
                </div>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                <div className="font-semibold text-amber-700 dark:text-amber-400">Retard</div>
                <div className="text-gray-600 dark:text-gray-400">
                  {attendanceData.length > 0 
                    ? Math.round(attendanceData.reduce((a, b) => a + b.late, 0) / attendanceData.length)
                    : 0}% moy.
                </div>
              </div>
              <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded">
                <div className="font-semibold text-rose-700 dark:text-rose-400">Absent</div>
                <div className="text-gray-600 dark:text-gray-400">
                  {attendanceData.length > 0 
                    ? Math.round(attendanceData.reduce((a, b) => a + b.absent, 0) / attendanceData.length)
                    : 0}% moy.
                </div>
              </div>
            </div>
          </div>

          {/* Department Distribution */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Distribution par Département</h3>
              <PieChart className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {departmentData.map((dept, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${dept.color}`} />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{dept.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${dept.color}`}
                        style={{ width: `${dept.value}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white w-6 text-right">{dept.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Performance Trend Line Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Tendance Performance</h3>
              <LineChart className="w-4 h-4 text-gray-400" />
            </div>
            <div className="h-64">
              <Line data={performanceLineData} options={performanceLineOptions} />
            </div>
          </div>

          {/* Cumulative Performance Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Performance Cumulée</h3>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div className="h-64">
              <Line data={cumulativeChartData} options={cumulativeChartOptions} />
            </div>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>Performance cumulée sur 6 mois</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span>Performance mensuelle individuelle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Indicateurs Clés de Performance</h3>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-2.5 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="all">Tous départements</option>
              <option value="electricite">Production Électrique</option>
              <option value="eau">Production Eau</option>
              <option value="vente">Vente</option>
              <option value="finance">Finance</option>
              <option value="rh">Support RH</option>
              <option value="medical">Médecin</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Performance Card */}
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Productivité</span>
                <Target className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-gray-900 dark:text-white">87.5%</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">+2.3%</span>
              </div>
              <div className="mt-1.5 text-xs text-gray-500">vs mois dernier</div>
            </div>

            {/* Attendance Card */}
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Taux Présence</span>
                <Users className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {attendanceData.length > 0 
                    ? Math.round(attendanceData.reduce((a, b) => a + b.present, 0) / attendanceData.length)
                    : 0}%
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">+1.2%</span>
              </div>
              <div className="mt-1.5 text-xs text-gray-500">objectif: 96%</div>
            </div>

            {/* Cost Card */}
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Coût Absences</span>
                <DollarSign className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-gray-900 dark:text-white">12.4M</span>
                <span className="text-xs text-rose-600 dark:text-rose-400">-0.5M</span>
              </div>
              <div className="mt-1.5 text-xs text-gray-500">Ar/mois</div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}