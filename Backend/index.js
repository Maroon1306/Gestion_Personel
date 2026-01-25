// backend/index.js
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/auth')
const personnelRoutes = require('./routes/personnel')
const departmentsRoutes = require('./routes/departments')
const attendanceRoutes = require('./routes/attendance')
const performanceRoutes = require('./routes/performance')
const analyticsRoutes = require('./routes/analytics')

const app = express()
const PORT = process.env.PORT || 4000

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000'

app.use(express.json())
app.use(cookieParser())

// enable CORS with credentials so cookie-based auth works
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

// preflight handler for older browsers
app.options('*', cors())

// Routes
app.use('/auth', authRoutes)
app.use('/personnel', personnelRoutes)
app.use('/departments', departmentsRoutes)
app.use('/attendance', attendanceRoutes)
app.use('/api/performance', performanceRoutes)
app.use('/analytics', analyticsRoutes)

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.get('/', (req, res) => res.json({ 
  ok: true, 
  message: 'Backend JIRAMA Gestion Personnel',
  version: '1.0.0',
  endpoints: {
    auth: '/auth',
    personnel: '/personnel',
    departments: '/departments',
    attendance: '/attendance',
    performance: '/api/performance',
    analytics: '/analytics'
  }
}))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    message: 'Erreur serveur interne',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route non trouvée' })
})

app.listen(PORT, () => {
  console.log(`Backend JIRAMA démarré sur le port ${PORT}`)
  console.log(`Frontend origin: ${FRONTEND_ORIGIN}`)
  console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`)
})