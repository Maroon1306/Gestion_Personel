require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/auth')
const personnelRoutes = require('./routes/personnel')
const departmentsRoutes = require('./routes/departments')
const attendanceRoutes = require('./routes/attendance')
const performanceRoutes = require('./routes/performance');
// Importez le cron job
//require('./cron');

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

app.use('/auth', authRoutes)
app.use('/personnel', personnelRoutes)
app.use('/departments', departmentsRoutes)
app.use('/attendance', attendanceRoutes)
app.use('/api/performance', performanceRoutes);

app.get('/', (req, res) => res.json({ ok: true, message: 'Backend running' }))

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`)
})
