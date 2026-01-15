require('dotenv').config()
const pool = require('./db')
const bcrypt = require('bcrypt')

async function setup() {
  try {
    // create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        matricule VARCHAR(100) UNIQUE,
        email VARCHAR(255) UNIQUE,
        name VARCHAR(255),
        password_hash VARCHAR(255),
        role VARCHAR(50),
        active TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // seed users
    const seeds = [
      { matricule: 'ADMIN001', email: 'admin@jirama.mg', name: 'Admin Utilisateurs', role: 'ADMIN_USER' },
      { matricule: 'ADMIN002', email: 'admin.rh@jirama.mg', name: 'Admin RH', role: 'ADMIN_RH' },
    ]

    for (const s of seeds) {
      const [rows] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [s.email])
      if (!rows.length) {
        const hash = await bcrypt.hash('admin123', 10)
        await pool.query(
          'INSERT INTO users (matricule, email, name, password_hash, role, active) VALUES (?, ?, ?, ?, ?, 1)',
          [s.matricule, s.email, s.name, hash, s.role],
        )
        console.log(`Seeded user: ${s.email} (password: admin123)`)
      } else {
        console.log(`${s.email} already exists`)
      }
    }

    console.log('Setup complete')

    // Ensure personnel table exists, then seed sample (chef and agent)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS personnel (
        id INT AUTO_INCREMENT PRIMARY KEY,
        matricule VARCHAR(100) UNIQUE,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        position VARCHAR(255),
        department VARCHAR(255),
        status VARCHAR(50),
        join_date DATE,
        avatar_color VARCHAR(255),
        performance INT DEFAULT 0,
        projects INT DEFAULT 0,
        active TINYINT DEFAULT 1,
        salary DECIMAL(12,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    const [pRows] = await pool.query('SELECT id FROM personnel LIMIT 1')
    if (!pRows.length) {
      await pool.query('INSERT INTO personnel (matricule, name, email, phone, position, department, status, join_date, avatar_color, performance, projects, active, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        'P001', 'Jean Michel Rakoto', 'jean.rakoto@jirama.mg', '+261321234567', 'Chef de Maintenance', 'Maintenance', 'Actif', '2020-03-15', 'from-blue-500 to-cyan-500', 92, 12, 1, 1200000.00
      ])

      await pool.query('INSERT INTO personnel (matricule, name, email, phone, position, department, status, join_date, avatar_color, performance, projects, active, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        'P002', 'Agent Rakotovao', 'agent.rakotovao@jirama.mg', '+261331234568', 'Agent de Terrain', 'Maintenance', 'Actif', '2021-06-01', 'from-emerald-500 to-green-500', 85, 5, 1, 800000.00
      ])

      console.log('Seeded sample personnel (P001, P002)')
    } else {
      console.log('Personnel table already has data')
    }

    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

setup()
