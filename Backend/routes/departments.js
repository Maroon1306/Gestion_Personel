const express = require('express')
const router = express.Router()
const pool = require('../db')

// GET /departments -> return distinct departments from personnel
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT department FROM personnel WHERE department IS NOT NULL AND department <> ""')
    const departments = rows.map(r => r.department)
    res.json({ data: departments })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

module.exports = router
