const express = require('express')
const router = express.Router()
const pool = require('../db')
const PDFDocument = require('pdfkit')

// Helper to count weekdays in a month
function countWeekdaysInMonth(year, month) {
  // month: 1-12
  const first = new Date(year, month - 1, 1)
  const last = new Date(year, month, 0)
  let count = 0
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) count++ // Mon-Fri
  }
  return count
}

// Ensure attendance tables exist and add ISO columns for segments to avoid timezone issues
async function ensureAttendanceTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      personnel_id INT NOT NULL,
      date DATE NOT NULL,
      hours_worked DECIMAL(6,2) DEFAULT 0,
      overtime_hours DECIMAL(6,2) DEFAULT 0,
      status VARCHAR(50) DEFAULT 'present',
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

  // In case older deployments had the table but not ISO columns, try to add them (MySQL 8+ supports IF NOT EXISTS)
  try {
    await pool.query("ALTER TABLE attendance_segments ADD COLUMN IF NOT EXISTS start_iso VARCHAR(64) NULL;")
    await pool.query("ALTER TABLE attendance_segments ADD COLUMN IF NOT EXISTS end_iso VARCHAR(64) NULL;")
  } catch (e) {
    // ignore if DB older or doesn't support IF NOT EXISTS
  }
}

function toISOStringIfDate(v) {
  if (!v) return null
  // prefer ISO columns (strings) when present
  if (typeof v === 'string') {
    // assume it's already an ISO-like string
    return v
  }
  const d = (v instanceof Date) ? v : new Date(v)
  if (isNaN(d.getTime())) return null
  return d.toISOString()
}

// GET /attendance?date=YYYY-MM-DD -> list all personnel and attendance for that date
router.get('/', async (req, res) => {
  try {
    await ensureAttendanceTables()
    const { date } = req.query
    if (!date) return res.status(400).json({ message: 'Date requise (YYYY-MM-DD)' })

    const [rows] = await pool.query(
      `SELECT p.id as personnelId, p.matricule, p.name, p.position, p.department, p.avatar_color as avatarColor, p.salary,
              a.id as attendanceId, a.hours_worked as hoursWorked, a.overtime_hours as overtimeHours, a.status
       FROM personnel p
       LEFT JOIN attendance a ON a.personnel_id = p.id AND a.date = ?
       ORDER BY p.name ASC`,
      [date]
    )

    // collect attendance ids to fetch segments
    const attendanceIds = rows.filter(r => r.attendanceId).map(r => r.attendanceId)
    let segmentsByAttendance = {}
    if (attendanceIds.length) {
      const [segRows] = await pool.query(`SELECT id, attendance_id, start_time, end_time, start_iso, end_iso FROM attendance_segments WHERE attendance_id IN (${attendanceIds.map(() => '?').join(',')}) ORDER BY id ASC`, attendanceIds)
      segmentsByAttendance = segRows.reduce((acc, s) => {
        if (!acc[s.attendance_id]) acc[s.attendance_id] = []
        const start = s.start_iso || toISOStringIfDate(s.start_time)
        const end = s.end_iso || toISOStringIfDate(s.end_time)
        acc[s.attendance_id].push({ id: s.id, start_time: start, end_time: end })
        return acc
      }, {})
    }

    const data = rows.map(r => {
      const segs = r.attendanceId ? (segmentsByAttendance[r.attendanceId] || []) : []
      const checkIn = segs.length ? segs[0].start_time : null
      const checkOut = segs.length ? (segs[segs.length - 1].end_time || null) : null
      return {
        personnelId: r.personnelId,
        matricule: r.matricule,
        name: r.name,
        position: r.position,
        department: r.department,
        avatarColor: r.avatarColor,
        salary: Number(r.salary || 0),
        attendanceId: r.attendanceId || null,
        checkIn,
        checkOut,
        segments: segs,
        hoursWorked: Number(r.hoursWorked || 0),
        overtimeHours: Number(r.overtimeHours || 0),
        status: r.status || 'pending'
      }
    })

    res.json({ data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// helper to compute totals from segments
function computeTotalsFromSegments(segments) {
  // segments: array of {start_time ISO, end_time ISO}
  let totalMs = 0
  for (const s of segments) {
    if (s.start_time && s.end_time) {
      const st = new Date(s.start_time).getTime()
      const en = new Date(s.end_time).getTime()
      if (!isNaN(st) && !isNaN(en) && en > st) totalMs += (en - st)
    }
  }
  const hours = totalMs / (1000 * 60 * 60)
  const overtime = Math.max(0, hours - 8)
  const status = hours >= 8 ? 'present' : (hours > 0 ? 'partial' : 'absent')
  return { hours: Number(hours.toFixed(2)), overtime: Number(overtime.toFixed(2)), status }
}

// POST /attendance/checkin { personnelId, date?, checkInTime }
router.post('/checkin', async (req, res) => {
  try {
    await ensureAttendanceTables()
    const { personnelId, date, checkInTime } = req.body
    if (!personnelId) return res.status(400).json({ message: 'personnelId requis' })
    const d = date || new Date().toISOString().split('T')[0]
    const checkIn = checkInTime || new Date().toISOString()

    // get or create attendance
    const [rows] = await pool.query('SELECT * FROM attendance WHERE personnel_id = ? AND date = ? LIMIT 1', [personnelId, d])
    let attendanceId
    if (rows.length) {
      attendanceId = rows[0].id
    } else {
      const [r] = await pool.query('INSERT INTO attendance (personnel_id, date) VALUES (?, ?)', [personnelId, d])
      attendanceId = r.insertId
    }

    // find last segment
    const [lastSegRows] = await pool.query('SELECT * FROM attendance_segments WHERE attendance_id = ? ORDER BY id DESC LIMIT 1', [attendanceId])
    if (lastSegRows.length && (lastSegRows[0].end_time === null && !lastSegRows[0].end_iso)) {
      // there's already an open segment -> don't create duplicate
      const seg = lastSegRows[0]
      const segData = { id: seg.id, start_time: seg.start_iso || toISOStringIfDate(seg.start_time), end_time: seg.end_iso || toISOStringIfDate(seg.end_time) }
      return res.json({ data: { attendanceId, segment: segData } })
    }

    // insert new segment with start_time and start_iso
    const [ins] = await pool.query('INSERT INTO attendance_segments (attendance_id, start_time, start_iso) VALUES (?, ?, ?)', [attendanceId, checkIn, checkIn])
    const [segRows] = await pool.query('SELECT * FROM attendance_segments WHERE id = ? LIMIT 1', [ins.insertId])
    const seg = segRows[0]

    res.status(201).json({ data: { attendanceId, segment: { id: seg.id, start_time: seg.start_iso || toISOStringIfDate(seg.start_time), end_time: seg.end_iso || toISOStringIfDate(seg.end_time) } } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// POST /attendance/checkout { personnelId, date?, checkOutTime }
router.post('/checkout', async (req, res) => {
  try {
    await ensureAttendanceTables()
    const { personnelId, date, checkOutTime } = req.body
    if (!personnelId) return res.status(400).json({ message: 'personnelId requis' })
    const d = date || new Date().toISOString().split('T')[0]
    const checkOut = checkOutTime || new Date().toISOString()

    const [rows] = await pool.query('SELECT * FROM attendance WHERE personnel_id = ? AND date = ? LIMIT 1', [personnelId, d])
    let attendanceId
    if (!rows.length) {
      // create attendance record
      const [r] = await pool.query('INSERT INTO attendance (personnel_id, date) VALUES (?, ?)', [personnelId, d])
      attendanceId = r.insertId
    } else {
      attendanceId = rows[0].id
    }

    // find last open segment
    const [lastSegRows] = await pool.query('SELECT * FROM attendance_segments WHERE attendance_id = ? ORDER BY id DESC LIMIT 1', [attendanceId])
    if (!lastSegRows.length) {
      // no segment exists -> create a segment with only end_time (partial)
      const [ins] = await pool.query('INSERT INTO attendance_segments (attendance_id, end_time, end_iso) VALUES (?, ?, ?)', [attendanceId, checkOut, checkOut])
    } else {
      const last = lastSegRows[0]
      if ((last.end_time === null && !last.end_iso)) {
        // close this open segment
        await pool.query('UPDATE attendance_segments SET end_time = ?, end_iso = ? WHERE id = ?', [checkOut, checkOut, last.id])
      } else {
        // last segment already closed -> create a new segment with end_time only (rare)
        await pool.query('INSERT INTO attendance_segments (attendance_id, end_time, end_iso) VALUES (?, ?, ?)', [attendanceId, checkOut, checkOut])
      }
    }

    // recompute totals
    const [segRows] = await pool.query('SELECT * FROM attendance_segments WHERE attendance_id = ? ORDER BY id ASC', [attendanceId])
    const segs = segRows.map(s => ({ id: s.id, start_time: s.start_iso || toISOStringIfDate(s.start_time), end_time: s.end_iso || toISOStringIfDate(s.end_time) }))
    const totals = computeTotalsFromSegments(segs)

    await pool.query('UPDATE attendance SET hours_worked = ?, overtime_hours = ?, status = ? WHERE id = ?', [totals.hours, totals.overtime, totals.status, attendanceId])

    const [aRows] = await pool.query('SELECT * FROM attendance WHERE id = ? LIMIT 1', [attendanceId])
    res.json({ data: { attendance: aRows[0], segments: segs, totals } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// POST /attendance/absent { personnelId, date? }
router.post('/absent', async (req, res) => {
  try {
    await ensureAttendanceTables()
    const { personnelId, date } = req.body
    if (!personnelId) return res.status(400).json({ message: 'personnelId requis' })
    const d = date || new Date().toISOString().split('T')[0]

    const [rows] = await pool.query('SELECT * FROM attendance WHERE personnel_id = ? AND date = ? LIMIT 1', [personnelId, d])
    let attendanceId
    if (rows.length) {
      attendanceId = rows[0].id
      // delete any segments and set absent
      await pool.query('DELETE FROM attendance_segments WHERE attendance_id = ?', [attendanceId])
      await pool.query('UPDATE attendance SET status = ?, hours_worked = 0, overtime_hours = 0 WHERE id = ?', ['absent', attendanceId])
      const [r] = await pool.query('SELECT * FROM attendance WHERE id = ? LIMIT 1', [attendanceId])
      return res.json({ data: r[0] })
    } else {
      const [result] = await pool.query('INSERT INTO attendance (personnel_id, date, status, hours_worked, overtime_hours) VALUES (?, ?, ?, ?, ?)', [personnelId, d, 'absent', 0, 0])
      const [r] = await pool.query('SELECT * FROM attendance WHERE id = ? LIMIT 1', [result.insertId])
      return res.status(201).json({ data: r[0] })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// GET /attendance/monthly-stats?personnelId=&month=&year=
router.get('/monthly-stats', async (req, res) => {
  try {
    await ensureAttendanceTables()
    const { personnelId, month, year } = req.query
    if (!personnelId || !month || !year) return res.status(400).json({ message: 'personnelId, month et year requis' })
    const m = Number(month)
    const y = Number(year)
    const totalWorkingDays = countWeekdaysInMonth(y, m)

    const [presentRows] = await pool.query('SELECT COUNT(DISTINCT date) as presentDays FROM attendance WHERE personnel_id = ? AND MONTH(date) = ? AND YEAR(date) = ? AND status = ?', [personnelId, m, y, 'present'])
    const [absentRows] = await pool.query('SELECT COUNT(DISTINCT date) as absentDays FROM attendance WHERE personnel_id = ? AND MONTH(date) = ? AND YEAR(date) = ? AND status = ?', [personnelId, m, y, 'absent'])
    const [hoursRows] = await pool.query('SELECT IFNULL(SUM(hours_worked),0) as totalHours, IFNULL(SUM(overtime_hours),0) as totalOvertime FROM attendance WHERE personnel_id = ? AND MONTH(date) = ? AND YEAR(date) = ?', [personnelId, m, y])

    const presentDays = presentRows[0].presentDays || 0
    const absentDays = absentRows[0].absentDays || 0
    const totalHours = Number(hoursRows[0].totalHours || 0)
    const totalOvertime = Number(hoursRows[0].totalOvertime || 0)

    const performance = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0

    res.json({ data: { totalWorkingDays, presentDays, absentDays, totalHours, totalOvertime, performance } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// GET /attendance/report/:personnelId?month=&year= -> PDF report
router.get('/report/:personnelId', async (req, res) => {
  try {
    await ensureAttendanceTables()
    const personnelId = req.params.personnelId
    const month = Number(req.query.month)
    const year = Number(req.query.year)
    if (!personnelId || !month || !year) return res.status(400).json({ message: 'personnelId, month et year requis' })

    // get personnel
    const [pRows] = await pool.query('SELECT id, matricule, name, position, department, salary FROM personnel WHERE id = ? LIMIT 1', [personnelId])
    if (!pRows.length) return res.status(404).json({ message: 'Personnel non trouvé' })
    const person = pRows[0]

    // stats
    const [statsRes] = await pool.query('SELECT COUNT(DISTINCT date) as presentDays, IFNULL(SUM(hours_worked),0) as totalHours, IFNULL(SUM(overtime_hours),0) as totalOvertime, COUNT(CASE WHEN status = "absent" THEN 1 END) as absentDays FROM attendance WHERE personnel_id = ? AND MONTH(date) = ? AND YEAR(date) = ?', [personnelId, month, year])
    const presentDays = statsRes[0].presentDays || 0
    const absentDays = statsRes[0].absentDays || 0
    const totalHours = Number(statsRes[0].totalHours || 0)
    const totalOvertime = Number(statsRes[0].totalOvertime || 0)
    const totalWorkingDays = countWeekdaysInMonth(year, month)
    const performance = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0

    // salary calculations
    const baseSalary = Number(person.salary || 0)
    // assume hourly rate = baseSalary / (totalWorkingDays * 8)
    const hourlyRate = totalWorkingDays > 0 ? (baseSalary / (totalWorkingDays * 8)) : 0
    const absenceHours = absentDays * 8
    const absenceDeduction = absenceHours * hourlyRate
    const overtimePay = totalOvertime * hourlyRate * 1.5 // 1.5x for overtime
    const totalSalary = Math.max(0, baseSalary - absenceDeduction + overtimePay)

    // Build PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const buffers = []
    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename=${person.name.replace(/\s+/g,'_')}_report_${year}_${month}.pdf`)
      res.send(pdfData)
    })

    doc.fontSize(18).text('Rapport de pointage', { align: 'center' })
    doc.moveDown()
    doc.fontSize(12).text(`Nom: ${person.name}`)
    doc.text(`Matricule: ${person.matricule}`)
    doc.text(`Poste: ${person.position}`)
    doc.text(`Mois/Année: ${month}/${year}`)
    doc.moveDown()

    doc.text(`Jours ouvrables: ${totalWorkingDays}`)
    doc.text(`Jours présents: ${presentDays}`)
    doc.text(`Jours absents: ${absentDays}`)
    doc.text(`Performance: ${performance}%`)
    doc.moveDown()

    doc.text(`Total heures travaillées: ${totalHours.toFixed(2)} h`)
    doc.text(`Heures supplémentaires: ${totalOvertime.toFixed(2)} h`)
    doc.moveDown()

    doc.text(`Salaire de base: ${baseSalary.toFixed(2)} Ar`)
    doc.text(`Déduction pour absence: -${absenceDeduction.toFixed(2)} Ar`)
    doc.text(`Paiement heures sup: +${overtimePay.toFixed(2)} Ar`)
    doc.moveDown()

    doc.fontSize(14).text(`Salaire net: ${totalSalary.toFixed(2)} Ar`, { underline: true })

    doc.end()

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

module.exports = router
