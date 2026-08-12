const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();

const DB_PATH = path.join(__dirname, 'database.sqlite');

// Default portfolio configuration settings
const DEFAULT_PORTFOLIO_DATA = {
  hero: {
    firstName: "Mohamed Asik",
    lastName: "K",
    role: "Flutter Developer",
    bio: "I craft stunning digital experiences that merge elegant design with powerful functionality. Let's build something extraordinary together.",
    resumeUrl: "#",
    avatarUrl: "",
    socials: {
      github: "#",
      linkedin: "#",
      instagram: "#",
      twitter: "#"
    }
  },
  about: {
    name: "MOHAMED ASIK K",
    location: "Chennai, Tamil Nadu, India",
    email: "mohamedasik.in@gmail.com",
    experience: "Fresher",
    headline: "Building things that are both beautiful and blazing fast.",
    bio: "I craft stunning digital experiences that merge elegant design with powerful functionality. Let's build something extraordinary together.",
    resumeUrl: "#",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=600&h=800&q=80"
  },
  contact: {
    email: "mohamedasik.in@gmail.com",
    phone: "+91 63825 55230",
    location: "India, Earth",
    whatsappUrl: "https://wa.me/916382555230?text=Hi%20Mohamed%20Asik%2C%20I%27d%20like%20to%20get%20in%20touch!"
  },
  skills: {
    frontend: [
      { name: "React", sub: "Library", pct: 90, bg: "#0b2a3a", fg: "#61dafb", glyph: "⚛" },
      { name: "JavaScript", sub: "Language", pct: 88, bg: "#3a3410", fg: "#f2d43b", glyph: "JS" },
      { name: "HTML5", sub: "Markup", pct: 92, bg: "#3a1a10", fg: "#ff7a52", glyph: "◐" },
      { name: "Tailwind CSS", sub: "Styling", pct: 85, bg: "#0b2a3a", fg: "#38bdf8", glyph: "~" }
    ],
    backend: [
      { name: "Node.js", sub: "Runtime", pct: 82, bg: "#0d3b1f", fg: "#83cd29", glyph: "⬡" },
      { name: "Express.js", sub: "Framework", pct: 80, bg: "#20242e", fg: "#f1f3f9", glyph: "ex" },
      { name: "MongoDB", sub: "Database", pct: 85, bg: "#0d3b2e", fg: "#35d68a", glyph: "🍃" },
      { name: "REST APIs", sub: "Architecture", pct: 84, bg: "#2a1636", fg: "#c084fc", glyph: "⇄" }
    ]
  },
  certificates: [
    {
      issuer: "INNOSAS INFOTECH PVT LTD",
      title: "Internship in IT Infrastructure",
      date: "Jun 2026",
      id: "HRD/REF/049/2026",
      desc: "Completed a comprehensive 5-month hands-on industrial internship in IT Infrastructure and Systems at InnoSAS Infotech Pvt Ltd. Gained experience working with IT infrastructure, network setup, troubleshooting, and team collaboration.",
      tags: ["IT Infrastructure", "Networking", "System Administration", "Troubleshooting"]
    },
    {
      issuer: "EDUBRIDGE & NIRMAAN (INFOSYS FOUNDATION)",
      title: "Certification Program in Artificial Intelligence",
      date: "Jun 2025",
      id: "EBEON05251093557",
      desc: "Successfully completed the intensive Certification Program in Artificial Intelligence with an outstanding score of 96% (Grade A+). Covered fundamental concepts of AI, Machine Learning algorithms, Python programming for AI, and real-world project implementations.",
      tags: ["Artificial Intelligence", "Machine Learning", "Python", "Data Science"]
    },
    {
      issuer: "NOVITECH R&D PRIVATE LIMITED",
      title: "Internship in Full Stack Development",
      date: "Feb 2025",
      id: "FSDIN2655",
      desc: "Completed a comprehensive 1-month hands-on industrial internship in Full Stack Development. Gained practical experience in architecting, developing, and deploying end-to-end web applications, focusing on scalable backend APIs, database design, and responsive, interactive frontend interfaces.",
      tags: ["PHP", "MySQL", "JavaScript", "HTML5"]
    }
  ],
  projects: [
    {
      num: "08",
      title: "E-Commerce Website",
      category: "Web",
      tech: "HTML, CSS, & JavaScript",
      type: "ecommerce"
    },
    {
      num: "01",
      title: "Real-time Chat Application",
      category: "Web",
      tech: "React JS, Tailwind CSS, React Hot Toast and Supabase",
      type: "chat"
    },
    {
      num: "02",
      title: "Ek Chup Chai",
      category: "Web",
      tech: "React JS, Tailwind CSS, Framer Motion, React Parallax Tilt, and React Intersection Observer",
      type: "chai"
    }
  ]
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // support large payloads for base64 images/resumes
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Setup
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // 1. Settings Table
    db.run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`, (err) => {
      if (err) console.error('Error creating settings table:', err.message);
      else {
        // Seed default config if empty
        db.get("SELECT value FROM settings WHERE key = 'portfolio_data'", (err, row) => {
          if (!row) {
            db.run("INSERT INTO settings (key, value) VALUES ('portfolio_data', ?)", [JSON.stringify(DEFAULT_PORTFOLIO_DATA)], (err) => {
              if (err) console.error('Error seeding settings:', err.message);
              else console.log('Successfully seeded default settings.');
            });
          }
        });
      }
    });

    // 2. Leads Table
    db.run(`CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      date TEXT,
      name TEXT,
      email TEXT,
      subject TEXT,
      message TEXT
    )`, (err) => {
      if (err) console.error('Error creating leads table:', err.message);
    });

    // 3. Admin Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password TEXT
    )`, (err) => {
      if (err) console.error('Error creating users table:', err.message);
      else {
        // Seed admin user credentials
        db.get("SELECT username FROM users WHERE username = 'admin'", (err, row) => {
          if (!row) {
            db.run("INSERT INTO users (username, password) VALUES ('admin', 'asik2004')", (err) => {
              if (err) console.error('Error seeding admin user:', err.message);
              else console.log('Successfully seeded admin user.');
            });
          }
        });
      }
    });
  });
}

// API Routes

// Admin Authentication endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.json({ success: true, username: row.username });
    } else {
      res.status(401).json({ error: 'Invalid admin credentials' });
    }
  });
});

// Settings Endpoints
app.get('/api/portfolio-data', (req, res) => {
  db.get("SELECT value FROM settings WHERE key = 'portfolio_data'", (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.json(JSON.parse(row.value));
    } else {
      res.status(404).json({ error: 'Portfolio data not found' });
    }
  });
});

// Real-time Event Stream (Server-Sent Events)
let sseClients = [];

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});

const notifyClientsOfDataUpdate = (data) => {
  sseClients.forEach(client => {
    try {
      client.write(`data: ${JSON.stringify({ type: 'PORTFOLIO_UPDATED', data })}\n\n`);
    } catch (e) {
      console.error("Error broadcasting SSE:", e);
    }
  });
};

app.post('/api/portfolio-data', (req, res) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ error: 'Portfolio data payload is required' });
  }

  const dataStr = JSON.stringify(data);
  db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('portfolio_data', ?)", [dataStr], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    notifyClientsOfDataUpdate(data);
    res.json({ success: true, data });
  });
});

// Leads Endpoints
app.get('/api/leads', (req, res) => {
  db.all("SELECT * FROM leads ORDER BY date DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/leads', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All message fields are required' });
  }

  const id = Date.now().toString();
  const date = new Date().toLocaleString();

  db.run("INSERT INTO leads (id, date, name, email, subject, message) VALUES (?, ?, ?, ?, ?, ?)",
    [id, date, name, email, subject, message],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, lead: { id, date, name, email, subject, message } });
    }
  );
});

app.delete('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM leads WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, deletedCount: this.changes });
  });
});

app.delete('/api/leads', (req, res) => {
  db.run("DELETE FROM leads", [], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, deletedCount: this.changes });
  });
});

// Serve static frontend files
app.use(express.static(__dirname));

// Serve standalone admin portal route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});