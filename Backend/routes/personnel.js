const express = require('express')
const router = express.Router()
const pool = require('../db')

// ensure personnel has salary and sex columns (best-effort)
async function ensurePersonnelColumns() {
  try {
    await pool.query("ALTER TABLE personnel ADD COLUMN IF NOT EXISTS salary DECIMAL(12,2) DEFAULT 0;")
    await pool.query("ALTER TABLE personnel ADD COLUMN IF NOT EXISTS sex VARCHAR(10) DEFAULT NULL;")
  } catch (err) {
    // some MySQL versions may not support IF NOT EXISTS for ALTER; ignore errors
    console.warn('ensurePersonnelColumns warning', err.message)
  }
}

// GET /personnel?search=&department=&status=&page=&limit=
router.get('/', async (req, res) => {
  try {
    await ensurePersonnelColumns()
    const { search = '', department, status, page = 1, limit = 20 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const where = []
    const params = []

    if (search) {
      where.push("(name LIKE ? OR email LIKE ? OR matricule LIKE ? OR position LIKE ?)")
      const q = `%${search}%`
      params.push(q, q, q, q)
    }
    if (department && department !== 'Tous') {
      where.push('department = ?')
      params.push(department)
    }
    if (status && status !== 'Tous') {
      where.push('status = ?')
      params.push(status)
    }

    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : ''

    const [rows] = await pool.query(
      `SELECT id, matricule, name, email, phone, position, department, status, join_date as joinDate, avatar_color as avatarColor, performance, projects, active, salary, sex FROM personnel ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    )

    // total count
    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM personnel ${whereSql}`, params)
    const total = countRows[0].total

    res.json({ data: rows, total })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// GET /personnel/:id
router.get('/:id', async (req, res) => {
  try {
    await ensurePersonnelColumns()
    const [rows] = await pool.query('SELECT id, matricule, name, email, phone, position, department, status, join_date as joinDate, avatar_color as avatarColor, performance, projects, active, salary, sex FROM personnel WHERE id = ? LIMIT 1', [req.params.id])
    if (!rows.length) return res.status(404).json({ message: 'Personnel non trouvé' })
    res.json({ data: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// POST /personnel
router.post('/', async (req, res) => {
  try {
    await ensurePersonnelColumns()
    const { matricule, name, email, phone, position, department, status = 'Actif', joinDate, avatarColor = '', performance = 0, projects = 0, active = 1, salary = 0, sex = null } = req.body
    const [result] = await pool.query('INSERT INTO personnel (matricule, name, email, phone, position, department, status, join_date, avatar_color, performance, projects, active, salary, sex) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      matricule, name, email, phone, position, department, status, joinDate, avatarColor, performance, projects, active, salary, sex
    ])
    const insertId = result.insertId
    const [rows] = await pool.query('SELECT id, matricule, name, email, phone, position, department, status, join_date as joinDate, avatar_color as avatarColor, performance, projects, active, salary, sex FROM personnel WHERE id = ? LIMIT 1', [insertId])
    res.status(201).json({ data: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// PUT /personnel/:id
router.put('/:id', async (req, res) => {
  try {
    await ensurePersonnelColumns()
    const id = req.params.id
    const fields = ['matricule','name','email','phone','position','department','status','join_date','avatar_color','performance','projects','active','salary','sex']
    const updates = []
    const params = []
    for (const f of fields) {
      if (f in req.body) {
        updates.push(`${f} = ?`)
        params.push(req.body[f])
      }
    }
    if (!updates.length) return res.status(400).json({ message: 'Aucun champ à mettre à jour' })
    params.push(id)
    await pool.query(`UPDATE personnel SET ${updates.join(', ')} WHERE id = ?`, params)
    const [rows] = await pool.query('SELECT id, matricule, name, email, phone, position, department, status, join_date as joinDate, avatar_color as avatarColor, performance, projects, active, salary, sex FROM personnel WHERE id = ? LIMIT 1', [id])
    res.json({ data: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// DELETE /personnel/:id
router.delete('/:id', async (req, res) => {
  try {
    await ensurePersonnelColumns()
    await pool.query('DELETE FROM personnel WHERE id = ?', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

module.exports = router
