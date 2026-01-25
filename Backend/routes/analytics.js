// routes/analytics.js
const express = require('express')
const router = express.Router()
const pool = require('../db')
const PDFDocument = require('pdfkit')

// Helper function to safely convert MySQL values to numbers
function safeToNumber(value) {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'object' && value.toString) {
    return parseFloat(value.toString()) || 0
  }
  return 0
}

// GET /analytics/export - Export PDF des analytics
router.get('/export', async (req, res) => {
  try {
    const currentDate = new Date()
    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear()
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    
    // Récupérer les statistiques réelles
    const [attendanceStats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT personnel_id) as total_personnel,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
        COALESCE(SUM(hours_worked), 0) as total_hours,
        COALESCE(SUM(overtime_hours), 0) as total_overtime
      FROM attendance 
      WHERE MONTH(date) = ? AND YEAR(date) = ?
    `, [month, year])
    
    const [departmentStats] = await pool.query(`
      SELECT department, 
        COUNT(*) as count,
        COALESCE(AVG(performance), 0) as avg_performance
      FROM personnel 
      WHERE active = 1 AND department IS NOT NULL AND department != ''
      GROUP BY department
      ORDER BY count DESC
    `)
    
    const [topPerformers] = await pool.query(`
      SELECT p.name, p.department, COALESCE(p.performance, 0) as performance
      FROM personnel p
      WHERE p.active = 1
      ORDER BY p.performance DESC
      LIMIT 10
    `)
    
    // Convertir les valeurs MySQL en nombres JavaScript
    const stats = attendanceStats[0] || {}
    const totalPersonnel = safeToNumber(stats.total_personnel)
    const presentCount = safeToNumber(stats.present_count)
    const absentCount = safeToNumber(stats.absent_count)
    const totalHours = safeToNumber(stats.total_hours)
    const totalOvertime = safeToNumber(stats.total_overtime)
    
    // Build PDF
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 50,
      info: {
        Title: `Rapport Analytique JIRAMA - ${monthNames[month-1]} ${year}`,
        Author: 'Système JIRAMA',
        Subject: 'Rapport analytique mensuel',
        Keywords: 'analytics, performance, statistiques, JIRAMA',
        Creator: 'JIRAMA Gestion Personnel',
        CreationDate: new Date()
      }
    })
    
    const buffers = []
    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename=rapport_analytiques_${year}_${month}.pdf`)
      res.send(pdfData)
    })
    
    // En-tête
    doc.fontSize(24).fillColor('#1E3A8A').text('JIRAMA', { align: 'center' })
    doc.fontSize(18).fillColor('#333333').text('Rapport Analytique Mensuel', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(12).fillColor('#666666').text(`${monthNames[month-1]} ${year}`, { align: 'center' })
    doc.moveDown(1)
    
    // Statistiques Globales
    doc.fontSize(16).fillColor('#222222').text('Statistiques Globales', { underline: true })
    doc.moveDown(0.5)
    
    doc.fontSize(11)
    doc.fillColor('#333333').text(`• Personnel total: ${totalPersonnel}`)
    doc.text(`• Présences enregistrées: ${presentCount}`)
    doc.text(`• Absences: ${absentCount}`)
    doc.text(`• Heures travaillées: ${totalHours.toFixed(2)}h`)
    doc.text(`• Heures supplémentaires: ${totalOvertime.toFixed(2)}h`)
    
    // Calcul du taux de présence
    const presenceRate = totalPersonnel > 0 
      ? Math.round((presentCount / totalPersonnel) * 100) 
      : 0
    doc.text(`• Taux de présence: ${presenceRate}%`)
    doc.moveDown(1)
    
    // Répartition par Département
    doc.addPage()
    doc.fontSize(16).fillColor('#222222').text('Répartition par Département', { underline: true })
    doc.moveDown(0.5)
    
    if (departmentStats.length > 0) {
      doc.fontSize(11)
      departmentStats.forEach((dept, index) => {
        const count = safeToNumber(dept.count)
        const avgPerformance = safeToNumber(dept.avg_performance)
        doc.text(`${index + 1}. ${dept.department}: ${count} employés (${avgPerformance.toFixed(1)}% performance)`)
      })
    } else {
      doc.text('Aucune donnée de département disponible.')
    }
    doc.moveDown(1)
    
    // Graphique circulaire simulé (texte)
    doc.fontSize(14).fillColor('#222222').text('Distribution par Département', { underline: true })
    doc.moveDown(0.5)
    
    if (departmentStats.length > 0) {
      const total = departmentStats.reduce((sum, dept) => sum + safeToNumber(dept.count), 0)
      departmentStats.forEach((dept, index) => {
        const count = safeToNumber(dept.count)
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0
        const bar = '█'.repeat(Math.round(percentage / 5)) // Barre ASCII
        doc.fontSize(10).text(`${dept.department.padEnd(25, ' ')} ${bar} ${percentage}%`)
      })
    }
    doc.moveDown(1)
    
    // Top Performers
    doc.addPage()
    doc.fontSize(16).fillColor('#222222').text('Top 10 Performers', { underline: true })
    doc.moveDown(0.5)
    
    if (topPerformers.length > 0) {
      doc.fontSize(11)
      topPerformers.forEach((performer, index) => {
        const performance = safeToNumber(performer.performance)
        doc.text(`${index + 1}. ${performer.name} - ${performer.department}: ${performance.toFixed(1)}%`)
      })
    } else {
      doc.text('Aucun top performer disponible.')
    }
    doc.moveDown(1)
    
    // Graphique de performance (texte)
    doc.fontSize(14).fillColor('#222222').text('Performance par Employé', { underline: true })
    doc.moveDown(0.5)
    
    if (topPerformers.length > 0) {
      topPerformers.forEach((performer, index) => {
        const performance = safeToNumber(performer.performance)
        const barLength = Math.round(performance / 5)
        const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength)
        doc.fontSize(10).text(`${performer.name.substring(0, 20).padEnd(22, ' ')} ${bar} ${performance.toFixed(1)}%`)
      })
    }
    doc.moveDown(2)
    
    // Conclusion
    doc.fontSize(14).fillColor('#222222').text('Analyse et Recommandations', { underline: true })
    doc.moveDown(0.5)
    
    doc.fontSize(11)
    doc.text('1. Performance globale: ' + (presenceRate >= 90 ? 'Excellente' : presenceRate >= 80 ? 'Bonne' : 'À améliorer'))
    doc.text('2. Heures supplémentaires: ' + (totalOvertime > 50 ? 'Élevées, à surveiller' : 'Dans la norme'))
    doc.text('3. Distribution: Équilibre ' + (departmentStats.length >= 5 ? 'adéquat' : 'à revoir') + ' entre départements')
    doc.moveDown(1)
    
    // Pied de page
    doc.fontSize(9).fillColor('#666666')
    doc.text('---', { align: 'center' })
    doc.text('Ce rapport analytique a été généré automatiquement par le système JIRAMA.', { align: 'center' })
    doc.text('Les données sont basées sur les enregistrements du système de pointage.', { align: 'center' })
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, { align: 'center' })
    doc.text(`Page ${doc.pageNumber}`, { align: 'center' })

    doc.end()

  } catch (err) {
    console.error('Error in /analytics/export:', err)
    console.error(err.stack)
    res.status(500).json({ 
      message: 'Erreur lors de la génération du PDF',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
})

// GET /analytics/data - Données pour les graphiques
router.get('/data', async (req, res) => {
  try {
    const { range = '6' } = req.query
    const months = parseInt(range)
    const currentDate = new Date()
    
    const monthlyData = []
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthNum = date.getMonth() + 1
      const yearNum = date.getFullYear()
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' })
      
      const [stats] = await pool.query(`
        SELECT 
          COUNT(DISTINCT personnel_id) as total,
          COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
          COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
          COALESCE(SUM(hours_worked), 0) as hours,
          COALESCE(SUM(overtime_hours), 0) as overtime
        FROM attendance 
        WHERE MONTH(date) = ? AND YEAR(date) = ?
      `, [monthNum, yearNum])
      
      const data = stats[0] || {}
      const total = safeToNumber(data.total)
      const present = safeToNumber(data.present)
      const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0
      
      monthlyData.push({
        month: monthName,
        present: presentPercentage,
        late: Math.floor(Math.random() * 5), // Mock data
        absent: Math.floor(Math.random() * 5), // Mock data
        total: total,
        hours: safeToNumber(data.hours).toFixed(2),
        overtime: safeToNumber(data.overtime).toFixed(2)
      })
    }
    
    // Department data
    const [departmentData] = await pool.query(`
      SELECT department, COUNT(*) as count
      FROM personnel 
      WHERE active = 1 AND department IS NOT NULL AND department != ''
      GROUP BY department
      ORDER BY count DESC
      LIMIT 10
    `)
    
    // Performance data
    const [performanceData] = await pool.query(`
      SELECT name, COALESCE(performance, 0) as performance
      FROM personnel 
      WHERE active = 1
      ORDER BY performance DESC
      LIMIT 15
    `)
    
    res.json({
      success: true,
      data: {
        monthly: monthlyData,
        departments: departmentData.map(dept => ({
          ...dept,
          count: safeToNumber(dept.count)
        })),
        performance: performanceData.map(perf => ({
          ...perf,
          performance: safeToNumber(perf.performance)
        }))
      }
    })
    
  } catch (err) {
    console.error('Error in /analytics/data:', err)
    console.error(err.stack)
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des données analytiques' 
    })
  }
})

// GET /analytics/stats - Statistiques rapides pour le dashboard
router.get('/stats', async (req, res) => {
  try {
    const currentDate = new Date()
    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear()
    const today = currentDate.toISOString().split('T')[0]
    
    // Today's stats
    const [todayStats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT personnel_id) as total_today,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_today,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_today
      FROM attendance 
      WHERE date = ?
    `, [today])
    
    // Monthly stats
    const [monthStats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT personnel_id) as total_month,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_month,
        COALESCE(SUM(hours_worked), 0) as hours_month,
        COALESCE(SUM(overtime_hours), 0) as overtime_month
      FROM attendance 
      WHERE MONTH(date) = ? AND YEAR(date) = ?
    `, [month, year])
    
    // Personnel count
    const [personnelCount] = await pool.query(`
      SELECT COUNT(*) as total FROM personnel WHERE active = 1
    `)
    
    const todayData = todayStats[0] || {}
    const monthData = monthStats[0] || {}
    const personnelData = personnelCount[0] || {}
    
    res.json({
      success: true,
      data: {
        today: {
          total: safeToNumber(todayData.total_today),
          present: safeToNumber(todayData.present_today),
          absent: safeToNumber(todayData.absent_today)
        },
        month: {
          total: safeToNumber(monthData.total_month),
          present: safeToNumber(monthData.present_month),
          hours: safeToNumber(monthData.hours_month).toFixed(2),
          overtime: safeToNumber(monthData.overtime_month).toFixed(2)
        },
        personnel: {
          total: safeToNumber(personnelData.total)
        }
      }
    })
    
  } catch (err) {
    console.error('Error in /analytics/stats:', err)
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des statistiques' 
    })
  }
})

module.exports = router