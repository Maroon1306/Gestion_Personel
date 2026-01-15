const express = require('express')
const router = express.Router()
const pool = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

router.use(cookieParser())

// helper to set httpOnly cookie
function setAuthCookie(res, token) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 8, // 8 hours
  }
  res.cookie('jid', token, cookieOptions)
}

// POST /auth/login
router.post('/login', async (req, res) => {
  const { emailOrMatricule, password, useCookie } = req.body
  if (!emailOrMatricule || !password) {
    return res.status(400).json({ message: 'Champs manquants' })
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, matricule, email, name, password_hash, role, active FROM users WHERE email = ? OR matricule = ? LIMIT 1',
      [emailOrMatricule, emailOrMatricule]
    )

    if (!rows.length) return res.status(401).json({ message: 'Identifiants invalides' })

    const user = rows[0]
    if (!user.active) return res.status(403).json({ message: "Utilisateur inactif" })

    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) return res.status(401).json({ message: 'Identifiants invalides' })

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' })

    // remove sensitive
    delete user.password_hash

    if (useCookie) {
      setAuthCookie(res, token)
      return res.json({ user })
    }

    res.json({ user, token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// POST /auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('jid', { httpOnly: true, sameSite: 'lax' })
  res.json({ ok: true })
})

// GET /auth/me  -> return user from token in cookie or Authorization header
router.get('/me', async (req, res) => {
  try {
    let token = null
    if (req.cookies && req.cookies.jid) token = req.cookies.jid
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token) return res.status(401).json({ message: 'No token' })

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const [rows] = await pool.query('SELECT id, matricule, email, name, role, active FROM users WHERE id = ? LIMIT 1', [payload.id])
    if (!rows.length) return res.status(404).json({ message: 'Utilisateur non trouvé' })
    res.json({ user: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(401).json({ message: 'Token invalide' })
  }
})

module.exports = router
