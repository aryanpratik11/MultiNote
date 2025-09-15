require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://*.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Initialize database
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tenants table
      db.run(`CREATE TABLE IF NOT EXISTS tenants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        subscription_plan TEXT DEFAULT 'free',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        tenant_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants (id)
      )`);

      // Notes table
      db.run(`CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        user_id INTEGER NOT NULL,
        tenant_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (tenant_id) REFERENCES tenants (id)
      )`);

      // Insert default tenants
      db.get('SELECT id FROM tenants WHERE slug = ?', ['acme'], (err, row) => {
        if (!row) {
          db.run('INSERT INTO tenants (slug, name) VALUES (?, ?)', ['acme', 'Acme Corporation']);
        }
      });

      db.get('SELECT id FROM tenants WHERE slug = ?', ['globex'], (err, row) => {
        if (!row) {
          db.run('INSERT INTO tenants (slug, name) VALUES (?, ?)', ['globex', 'Globex Corporation']);
        }
      });

      // Insert test users
      const passwordHash = bcrypt.hashSync('password', 10);
      
      setTimeout(() => {
        // Get tenant IDs
        db.get('SELECT id FROM tenants WHERE slug = ?', ['acme'], (err, acmeTenant) => {
          if (acmeTenant) {
            db.get('SELECT id FROM users WHERE email = ?', ['admin@acme.test'], (err, row) => {
              if (!row) {
                db.run('INSERT INTO users (email, password_hash, role, tenant_id) VALUES (?, ?, ?, ?)', 
                  ['admin@acme.test', passwordHash, 'admin', acmeTenant.id]);
              }
            });
            db.get('SELECT id FROM users WHERE email = ?', ['user@acme.test'], (err, row) => {
              if (!row) {
                db.run('INSERT INTO users (email, password_hash, role, tenant_id) VALUES (?, ?, ?, ?)', 
                  ['user@acme.test', passwordHash, 'member', acmeTenant.id]);
              }
            });
          }
        });

        db.get('SELECT id FROM tenants WHERE slug = ?', ['globex'], (err, globexTenant) => {
          if (globexTenant) {
            db.get('SELECT id FROM users WHERE email = ?', ['admin@globex.test'], (err, row) => {
              if (!row) {
                db.run('INSERT INTO users (email, password_hash, role, tenant_id) VALUES (?, ?, ?, ?)', 
                  ['admin@globex.test', passwordHash, 'admin', globexTenant.id]);
              }
            });
            db.get('SELECT id FROM users WHERE email = ?', ['user@globex.test'], (err, row) => {
              if (!row) {
                db.run('INSERT INTO users (email, password_hash, role, tenant_id) VALUES (?, ?, ?, ?)', 
                  ['user@globex.test', passwordHash, 'member', globexTenant.id]);
              }
            });
          }
        });
        resolve();
      }, 100);
    });
  });
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin role middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    db.get(`
      SELECT u.*, t.slug as tenant_slug, t.name as tenant_name, t.subscription_plan 
      FROM users u 
      JOIN tenants t ON u.tenant_id = t.id 
      WHERE u.email = ?
    `, [email], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        tenant_slug: user.tenant_slug
      }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          tenant: {
            id: user.tenant_id,
            slug: user.tenant_slug,
            name: user.tenant_name,
            subscription_plan: user.subscription_plan
          }
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user info
app.get('/auth/me', authenticateToken, (req, res) => {
  db.get(`
    SELECT u.*, t.slug as tenant_slug, t.name as tenant_name, t.subscription_plan 
    FROM users u 
    JOIN tenants t ON u.tenant_id = t.id 
    WHERE u.id = ?
  `, [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      tenant: {
        id: user.tenant_id,
        slug: user.tenant_slug,
        name: user.tenant_name,
        subscription_plan: user.subscription_plan
      }
    });
  });
});

// Upgrade tenant subscription
app.post('/tenants/:slug/upgrade', authenticateToken, requireAdmin, (req, res) => {
  const { slug } = req.params;

  // Verify admin belongs to this tenant
  if (req.user.tenant_slug !== slug) {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.run('UPDATE tenants SET subscription_plan = ? WHERE slug = ?', ['pro', slug], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({ message: 'Subscription upgraded to Pro' });
  });
});

// Create note
app.post('/notes', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Check subscription limits
    db.get('SELECT subscription_plan FROM tenants WHERE id = ?', [req.user.tenant_id], (err, tenant) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (tenant.subscription_plan === 'free') {
        // Check note count for free plan
        db.get('SELECT COUNT(*) as count FROM notes WHERE tenant_id = ?', [req.user.tenant_id], (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          if (result.count >= 3) {
            return res.status(403).json({ error: 'Note limit reached. Upgrade to Pro for unlimited notes.' });
          }

          // Create the note
          createNote();
        });
      } else {
        // Pro plan - no limits
        createNote();
      }
    });

    const createNote = () => {
      db.run(
        'INSERT INTO notes (title, content, user_id, tenant_id) VALUES (?, ?, ?, ?)',
        [title, content || '', req.user.id, req.user.tenant_id],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          // Return the created note
          db.get('SELECT * FROM notes WHERE id = ?', [this.lastID], (err, note) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json(note);
          });
        }
      );
    };
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all notes for current tenant
app.get('/notes', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM notes WHERE tenant_id = ? ORDER BY updated_at DESC',
    [req.user.tenant_id],
    (err, notes) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(notes);
    }
  );
});

// Get specific note
app.get('/notes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get(
    'SELECT * FROM notes WHERE id = ? AND tenant_id = ?',
    [id, req.user.tenant_id],
    (err, note) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      res.json(note);
    }
  );
});

// Update note
app.put('/notes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.run(
    'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?',
    [title, content || '', id, req.user.tenant_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }

      // Return updated note
      db.get('SELECT * FROM notes WHERE id = ?', [id], (err, note) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(note);
      });
    }
  );
});

// Delete note
app.delete('/notes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM notes WHERE id = ? AND tenant_id = ?',
    [id, req.user.tenant_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }

      res.json({ message: 'Note deleted successfully' });
    }
  );
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log('\nTest accounts:');
    console.log('- admin@acme.test (password: password)');
    console.log('- user@acme.test (password: password)');
    console.log('- admin@globex.test (password: password)');
    console.log('- user@globex.test (password: password)');
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});