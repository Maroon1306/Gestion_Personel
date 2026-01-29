// routes/attendance.js - SECTION À CORRIGER
const express = require('express')
const router = express.Router()
const pool = require('../db')
const PDFDocument = require('pdfkit')

// Helper to count weekdays in a month
function countWeekdaysInMonth(year, month) {
  const first = new Date(year, month - 1, 1)
  const last = new Date(year, month, 0)
  let count = 0
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) count++ // Monday to Friday
  }
  return count
}

// Ensure attendance tables exist
async function ensureAttendanceTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      personnel_id INT NOT NULL,
      date DATE NOT NULL,
      hours_worked DECIMAL(6,2) DEFAULT 0,
      overtime_hours DECIMAL(6,2) DEFAULT 0,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY person_date (personnel_id, date),
      INDEX(personnel_id),
      INDEX(date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS attendance_segments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      attendance_id INT NOT NULL,
      start_time DATETIME NULL,
      end_time DATETIME NULL,
      start_iso VARCHAR(64) NULL,
      end_iso VARCHAR(64) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX(attendance_id),
      CONSTRAINT fk_attendance FOREIGN KEY (attendance_id) REFERENCES attendance(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)

  // Add ISO columns if they don't exist
  try {
    await pool.query("ALTER TABLE attendance_segments ADD COLUMN IF NOT EXISTS start_iso VARCHAR(64) NULL;")
    await pool.query("ALTER TABLE attendance_segments ADD COLUMN IF NOT EXISTS end_iso VARCHAR(64) NULL;")
  } catch (e) {
    console.warn('ISO columns may already exist:', e.message)
  }
}

function toISOStringIfDate(v) {
  if (!v) return null
  if (typeof v === 'string') {
    return v
  }
  const d = (v instanceof Date) ? v : new Date(v)
  if (isNaN(d.getTime())) return null
  return d.toISOString()
}

function computeTotalsFromSegments(segments) {
  let totalMs = 0
  for (const s of segments) {
    if (s.start_time && s.end_time) {
      const st = new Date(s.start_time).getTime()
      const en = new Date(s.end_time).getTime()
      if (!isNaN(st) && !isNaN(en) && en > st) {
        totalMs += (en - st)
      }
    }
  }
  const hours = totalMs / (1000 * 60 * 60)
  const overtime = Math.max(0, hours - 8)
  const status = hours >= 8 ? 'present' : (hours > 0 ? 'partial' : 'absent')
  
  return { 
    hours: Number(parseFloat(hours).toFixed(2)), 
    overtime: Number(parseFloat(overtime).toFixed(2)), 
    status 
  }
}

// CORRECTION IMPORTANTE ICI : GET /attendance?date=YYYY-MM-DD&month=&year=
router.get('/', async (req, res) => {
  try {
    await ensureAttendanceTables()
    const { date, month, year } = req.query
    
    if (!date && !month && !year) {
      // Si aucune date n'est spécifiée, utiliser aujourd'hui
      const today = new Date().toISOString().split('T')[0]
      return res.redirect(`/attendance?date=${today}`)
    }

    let queryDate
    if (date) {
      queryDate = date
    } else if (month && year) {
      // Pour les requêtes mensuelles, on prend le premier jour du mois comme date de référence
      queryDate = `${year}-${String(month).padStart(2, '0')}-01`
    } else {
      queryDate = new Date().toISOString().split('T')[0]
    }

    console.log(`Fetching attendance for date: ${queryDate}, original params:`, { date, month, year })

    // 1. Récupérer TOUS les personnels actifs
    const [allPersonnel] = await pool.query(
      `SELECT id, matricule, name, position, department, avatar_color, salary, performance 
       FROM personnel 
       WHERE active = 1 
       ORDER BY name ASC`
    )

    console.log(`Found ${allPersonnel.length} active personnel`)

    // 2. Pour chaque personnel, vérifier/insérer un enregistrement d'attendance pour la date
    const personnelIds = allPersonnel.map(p => p.id)
    const attendanceRecords = []

    for (const person of allPersonnel) {
      try {
        // Vérifier si un enregistrement existe déjà pour cette date
        const [existingRows] = await pool.query(
          'SELECT id FROM attendance WHERE personnel_id = ? AND date = ? LIMIT 1',
          [person.id, queryDate]
        )

        let attendanceId
        if (existingRows.length > 0) {
          attendanceId = existingRows[0].id
        } else {
          // Créer un nouvel enregistrement avec status 'pending'
          const [insertResult] = await pool.query(
            'INSERT INTO attendance (personnel_id, date, status, hours_worked, overtime_hours) VALUES (?, ?, ?, ?, ?)',
            [person.id, queryDate, 'pending', 0, 0]
          )
          attendanceId = insertResult.insertId
        }

        // Récupérer les détails complets de l'attendance
        const [attendanceRows] = await pool.query(
          'SELECT id, hours_worked, overtime_hours, status FROM attendance WHERE id = ? LIMIT 1',
          [attendanceId]
        )

        const attendance = attendanceRows[0]

        // Récupérer les segments pour cette attendance
        const [segmentRows] = await pool.query(
          `SELECT id, start_time, end_time, start_iso, end_iso 
           FROM attendance_segments 
           WHERE attendance_id = ? 
           ORDER BY id ASC`,
          [attendanceId]
        )

        const segments = segmentRows.map(s => ({
          id: s.id,
          start_time: s.start_iso || toISOStringIfDate(s.start_time),
          end_time: s.end_iso || toISOStringIfDate(s.end_time)
        }))

        // Calculer checkIn et checkOut à partir des segments
        const checkIn = segments.length > 0 ? segments[0].start_time : null
        const checkOut = segments.length > 0 ? 
          (segments[segments.length - 1].end_time || null) : null

        attendanceRecords.push({
          personnelId: person.id,
          matricule: person.matricule,
          name: person.name,
          position: person.position,
          department: person.department,
          avatarColor: person.avatar_color || 'from-gray-400 to-gray-600',
          salary: Number(person.salary || 0),
          performance: Number(person.performance || 0),
          attendanceId: attendance.id,
          checkIn,
          checkOut,
          segments,
          hoursWorked: Number(attendance.hours_worked || 0),
          overtimeHours: Number(attendance.overtime_hours || 0),
          status: attendance.status || 'pending'
        })

      } catch (err) {
        console.error(`Error processing personnel ${person.id}:`, err)
      }
    }

    console.log(`Returning ${attendanceRecords.length} attendance records`)

    // 3. Filtrer par recherche si nécessaire (maintenant côté serveur)
    let filteredData = attendanceRecords
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase()
      filteredData = attendanceRecords.filter(r => 
        (r.name && r.name.toLowerCase().includes(searchTerm)) ||
        (r.matricule && r.matricule.toLowerCase().includes(searchTerm)) ||
        (r.department && r.department.toLowerCase().includes(searchTerm)) ||
        (r.position && r.position.toLowerCase().includes(searchTerm))
      )
    }

    res.json({ 
      data: filteredData,
      total: filteredData.length,
      date: queryDate
    })
  } catch (err) {
    console.error('Error in GET /attendance:', err)
    res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
})

// POST /attendance/checkin
router.post('/checkin', async (req, res) => {
  try {
    await ensureAttendanceTables()
    const { personnelId, date, checkInTime } = req.body
    if (!personnelId) {
      return res.status(400).json({ message: 'personnelId requis' })
    }
    
    const d = date || new Date().toISOString().split('T')[0]
    const checkIn = checkInTime || new Date().toISOString()

    // Get or create attendance record
    const [rows] = await pool.query(
      'SELECT id, status FROM attendance WHERE personnel_id = ? AND date = ? LIMIT 1',
      [personnelId, d]
    )
    
    let attendanceId
    if (rows.length) {
      attendanceId = rows[0].id
      // If already marked absent, change to present
      if (rows[0].status === 'absent') {
        await pool.query(
          'UPDATE attendance SET status = ? WHERE id = ?',
          ['present', attendanceId]
        )
      }
    } else {
      const [r] = await pool.query(
        'INSERT INTO attendance (personnel_id, date, status) VALUES (?, ?, ?)',
        [personnelId, d, 'present']
      )
      attendanceId = r.insertId
    }

    // Check if there's an open segment
    const [lastSegRows] = await pool.query(
      'SELECT * FROM attendance_segments WHERE attendance_id = ? ORDER BY id DESC LIMIT 1',
      [attendanceId]
    )
    
    if (lastSegRows.length && (lastSegRows[0].end_time === null && !lastSegRows[0].end_iso)) {
      // There's already an open segment
      const seg = lastSegRows[0]
      const segData = {
        id: seg.id,
        start_time: seg.start_iso || toISOStringIfDate(seg.start_time),
        end_time: seg.end_iso || toISOStringIfDate(seg.end_time)
      }
      return res.json({ data: { attendanceId, segment: segData } })
    }

    // Insert new segment
    const [ins] = await pool.query(
      'INSERT INTO attendance_segments (attendance_id, start_time, start_iso) VALUES (?, ?, ?)',
      [attendanceId, checkIn, checkIn]
    )
    
    const [segRows] = await pool.query(
      'SELECT * FROM attendance_segments WHERE id = ? LIMIT 1',
      [ins.insertId]
    )
    
    const seg = segRows[0]
    const segmentData = {
      id: seg.id,
      start_time: seg.start_iso || toISOStringIfDate(seg.start_time),
      end_time: seg.end_iso || toISOStringIfDate(seg.end_time)
    }

    // Update attendance status to present
    await pool.query(
      'UPDATE attendance SET status = ? WHERE id = ?',
      ['present', attendanceId]
    )

    res.status(201).json({ 
      data: { 
        attendanceId, 
        segment: segmentData,
        message: 'Check-in enregistré avec succès'
      } 
    })
  } catch (err) {
    console.error('Error in POST /attendance/checkin:', err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// POST /attendance/checkout
router.post('/checkout', async (req, res) => {
  try {
    await ensureAttendanceTables()
    const { personnelId, date, checkOutTime } = req.body
    if (!personnelId) {
      return res.status(400).json({ message: 'personnelId requis' })
    }
    
    const d = date || new Date().toISOString().split('T')[0]
    const checkOut = checkOutTime || new Date().toISOString()

    const [rows] = await pool.query(
      'SELECT id FROM attendance WHERE personnel_id = ? AND date = ? LIMIT 1',
      [personnelId, d]
    )
    
    let attendanceId
    if (!rows.length) {
      // Create attendance record if doesn't exist
      const [r] = await pool.query(
        'INSERT INTO attendance (personnel_id, date, status) VALUES (?, ?, ?)',
        [personnelId, d, 'partial']
      )
      attendanceId = r.insertId
    } else {
      attendanceId = rows[0].id
    }

    // Find last open segment
    const [lastSegRows] = await pool.query(
      'SELECT * FROM attendance_segments WHERE attendance_id = ? ORDER BY id DESC LIMIT 1',
      [attendanceId]
    )
    
    if (!lastSegRows.length) {
      // No segment exists, create one with only end_time
      await pool.query(
        'INSERT INTO attendance_segments (attendance_id, end_time, end_iso) VALUES (?, ?, ?)',
        [attendanceId, checkOut, checkOut]
      )
    } else {
      const last = lastSegRows[0]
      if ((last.end_time === null && !last.end_iso)) {
        // Close this open segment
        await pool.query(
          'UPDATE attendance_segments SET end_time = ?, end_iso = ? WHERE id = ?',
          [checkOut, checkOut, last.id]
        )
      } else {
        // Create new segment with end_time only
        await pool.query(
          'INSERT INTO attendance_segments (attendance_id, end_time, end_iso) VALUES (?, ?, ?)',
          [attendanceId, checkOut, checkOut]
        )
      }
    }

    // Recompute totals
    const [segRows] = await pool.query(
      'SELECT * FROM attendance_segments WHERE attendance_id = ? ORDER BY id ASC',
      [attendanceId]
    )
    
    const segs = segRows.map(s => ({
      id: s.id,
      start_time: s.start_iso || toISOStringIfDate(s.start_time),
      end_time: s.end_iso || toISOStringIfDate(s.end_time)
    }))
    
    const totals = computeTotalsFromSegments(segs)

    // Update attendance record
    await pool.query(
      'UPDATE attendance SET hours_worked = ?, overtime_hours = ?, status = ? WHERE id = ?',
      [totals.hours, totals.overtime, totals.status, attendanceId]
    )

    const [aRows] = await pool.query(
      'SELECT * FROM attendance WHERE id = ? LIMIT 1',
      [attendanceId]
    )
    
    res.json({ 
      data: { 
        attendance: aRows[0], 
        segments: segs, 
        totals,
        message: 'Check-out enregistré avec succès'
      } 
    })
  } catch (err) {
    console.error('Error in POST /attendance/checkout:', err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// POST /attendance/absent
router.post('/absent', async (req, res) => {
  try {
    await ensureAttendanceTables()
    const { personnelId, date } = req.body
    if (!personnelId) {
      return res.status(400).json({ message: 'personnelId requis' })
    }
    
    const d = date || new Date().toISOString().split('T')[0]

    const [rows] = await pool.query(
      'SELECT id FROM attendance WHERE personnel_id = ? AND date = ? LIMIT 1',
      [personnelId, d]
    )
    
    let attendanceId
    if (rows.length) {
      attendanceId = rows[0].id
      // Delete any segments and set absent
      await pool.query('DELETE FROM attendance_segments WHERE attendance_id = ?', [attendanceId])
      await pool.query(
        'UPDATE attendance SET status = ?, hours_worked = 0, overtime_hours = 0 WHERE id = ?',
        ['absent', attendanceId]
      )
      
      const [r] = await pool.query('SELECT * FROM attendance WHERE id = ? LIMIT 1', [attendanceId])
      return res.json({ 
        data: r[0],
        message: 'Absence enregistrée avec succès'
      })
    } else {
      const [result] = await pool.query(
        'INSERT INTO attendance (personnel_id, date, status, hours_worked, overtime_hours) VALUES (?, ?, ?, ?, ?)',
        [personnelId, d, 'absent', 0, 0]
      )
      
      const [r] = await pool.query('SELECT * FROM attendance WHERE id = ? LIMIT 1', [result.insertId])
      return res.status(201).json({ 
        data: r[0],
        message: 'Absence enregistrée avec succès'
      })
    }
  } catch (err) {
    console.error('Error in POST /attendance/absent:', err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// GET /attendance/monthly-stats
router.get('/monthly-stats', async (req, res) => {
  try {
    await ensureAttendanceTables()
    const { personnelId, month, year } = req.query
    if (!personnelId || !month || !year) {
      return res.status(400).json({ message: 'personnelId, month et year requis' })
    }
    
    const m = Number(month)
    const y = Number(year)
    const totalWorkingDays = countWeekdaysInMonth(y, m)

    const [presentRows] = await pool.query(
      `SELECT COUNT(DISTINCT date) as presentDays 
       FROM attendance 
       WHERE personnel_id = ? 
         AND MONTH(date) = ? 
         AND YEAR(date) = ? 
         AND status = ?`,
      [personnelId, m, y, 'present']
    )
    
    const [absentRows] = await pool.query(
      `SELECT COUNT(DISTINCT date) as absentDays 
       FROM attendance 
       WHERE personnel_id = ? 
         AND MONTH(date) = ? 
         AND YEAR(date) = ? 
         AND status = ?`,
      [personnelId, m, y, 'absent']
    )
    
    const [hoursRows] = await pool.query(
      `SELECT IFNULL(SUM(hours_worked),0) as totalHours, 
              IFNULL(SUM(overtime_hours),0) as totalOvertime 
       FROM attendance 
       WHERE personnel_id = ? 
         AND MONTH(date) = ? 
         AND YEAR(date) = ?`,
      [personnelId, m, y]
    )

    const presentDays = presentRows[0].presentDays || 0
    const absentDays = absentRows[0].absentDays || 0
    const totalHours = Number(hoursRows[0].totalHours || 0)
    const totalOvertime = Number(hoursRows[0].totalOvertime || 0)
    const performance = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0

    res.json({ 
      data: { 
        totalWorkingDays, 
        presentDays, 
        absentDays, 
        totalHours, 
        totalOvertime, 
        performance 
      } 
    })
  } catch (err) {
    console.error('Error in GET /attendance/monthly-stats:', err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// GET /attendance/report/:personnelId?month=&year=
router.get('/report/:personnelId', async (req, res) => {
  try {
    await ensureAttendanceTables()
    const personnelId = req.params.personnelId
    const month = Number(req.query.month)
    const year = Number(req.query.year)
    
    if (!personnelId || !month || !year) {
      return res.status(400).json({ message: 'personnelId, month et year requis' })
    }

    // Get personnel info
    const [pRows] = await pool.query(
      `SELECT id, matricule, name, position, department, salary 
       FROM personnel 
       WHERE id = ? LIMIT 1`,
      [personnelId]
    )
    
    if (!pRows.length) {
      return res.status(404).json({ message: 'Personnel non trouvé' })
    }
    
    const person = pRows[0]

    // Get stats for the month
    const [statsRes] = await pool.query(
      `SELECT 
         COUNT(DISTINCT date) as presentDays,
         IFNULL(SUM(hours_worked),0) as totalHours,
         IFNULL(SUM(overtime_hours),0) as totalOvertime,
         COUNT(CASE WHEN status = 'absent' THEN 1 END) as absentDays
       FROM attendance 
       WHERE personnel_id = ? 
         AND MONTH(date) = ? 
         AND YEAR(date) = ?`,
      [personnelId, month, year]
    )
    
    const presentDays = statsRes[0].presentDays || 0
    const absentDays = statsRes[0].absentDays || 0
    const totalHours = Number(statsRes[0].totalHours || 0)
    const totalOvertime = Number(statsRes[0].totalOvertime || 0)
    const totalWorkingDays = countWeekdaysInMonth(year, month)
    const performance = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0

    // Salary calculations
    const baseSalary = Number(person.salary || 0)
    const hourlyRate = totalWorkingDays > 0 ? (baseSalary / (totalWorkingDays * 8)) : 0
    const absenceHours = absentDays * 8
    const absenceDeduction = absenceHours * hourlyRate
    const overtimePay = totalOvertime * hourlyRate * 1.5 // 1.5x for overtime
    const totalSalary = Math.max(0, baseSalary - absenceDeduction + overtimePay)

    // Build PDF
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 50,
      info: {
        Title: `Rapport de pointage - ${person.name}`,
        Author: 'Système JIRAMA',
        Subject: `Rapport ${month}/${year}`,
        Keywords: 'pointage, performance, salaire, JIRAMA',
        Creator: 'JIRAMA Gestion Personnel',
        CreationDate: new Date()
      }
    })
    
    const buffers = []
    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename=${person.name.replace(/\s+/g,'_')}_report_${year}_${month}.pdf`)
      res.send(pdfData)
    })

    // Header
    doc.fontSize(20).fillColor('#333333').text('JIRAMA - Rapport de Pointage', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#666666').text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' })
    doc.moveDown(1)
    
    // Employee info
    doc.fontSize(14).fillColor('#222222').text('Informations Employé', { underline: true })
    doc.moveDown(0.5)
    
    doc.fontSize(11)
    doc.fillColor('#333333').text(`Nom: ${person.name}`)
    doc.text(`Matricule: ${person.matricule}`)
    doc.text(`Poste: ${person.position}`)
    doc.text(`Département: ${person.department}`)
    doc.text(`Période: ${month}/${year}`)
    doc.moveDown(1)
    
    // Attendance stats
    doc.fontSize(14).fillColor('#222222').text('Statistiques de Pointage', { underline: true })
    doc.moveDown(0.5)
    
    doc.fontSize(11)
    doc.text(`Jours ouvrables: ${totalWorkingDays}`)
    doc.text(`Jours présents: ${presentDays}`)
    doc.text(`Jours absents: ${absentDays}`)
    doc.text(`Performance: ${performance}%`)
    doc.moveDown(0.5)
    
    doc.text(`Total heures travaillées: ${totalHours.toFixed(2)} h`)
    doc.text(`Heures supplémentaires: ${totalOvertime.toFixed(2)} h`)
    doc.moveDown(1)
    
    // Salary calculations
    doc.fontSize(14).fillColor('#222222').text('Calcul du Salaire', { underline: true })
    doc.moveDown(0.5)
    
    doc.fontSize(11)
    doc.text(`Salaire de base: ${baseSalary.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ar`)
    doc.text(`Déduction pour absence: -${absenceDeduction.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ar`)
    doc.text(`Paiement heures supplémentaires: +${overtimePay.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ar`)
    doc.moveDown(0.5)
    
    // Total salary
    doc.fontSize(16).fillColor('#2E7D32').text(`Salaire net: ${totalSalary.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ar`, { underline: true })
    doc.moveDown(2)
    
    // Footer
    doc.fontSize(9).fillColor('#666666')
    doc.text('Ce document a été généré automatiquement par le système de gestion du personnel JIRAMA.', { align: 'center' })
    doc.text('Pour toute question, contactez le service RH.', { align: 'center' })
    doc.text(`Page ${doc.pageNumber}`, { align: 'center' })

    doc.end()

  } catch (err) {
    console.error('Error in GET /attendance/report:', err)
    res.status(500).json({ message: 'Erreur lors de la génération du rapport' })
  }
})

module.exports = router