const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2; // Directly require cloudinary.v2
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log Cloudinary configuration
console.log('Cloudinary configuration:', {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key,
  api_secret: cloudinary.config().api_secret ? '[REDACTED]' : undefined
});

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdir(uploadDir, { recursive: true }).catch((err) => {
  console.error('Failed to create uploads directory:', err);
});

// SQLite database setup
const db = new sqlite3.Database('./db.sqlite');

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patientName TEXT,
    patientId TEXT,
    scanType TEXT,
    region TEXT,
    imageUrl TEXT,
    uploadDate TEXT
)`);

// Helper: JWT validation middleware
function authenticateRole(requiredRole) {
  return (req, res, next) => {
    const header = req.headers['authorization'];
    console.log('Authorization header:', header);
    if (!header) return res.status(401).json({ error: 'No token provided' });
    const tokenParts = header.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Malformed token' });
    }
    const token = tokenParts[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.log('JWT verify error:', err);
        return res.status(403).json({ error: 'Token invalid or expired' });
      }
      console.log('Decoded user:', user);
      if (requiredRole && user.role !== requiredRole) {
        console.log('Role mismatch. Needed:', requiredRole, 'but was:', user.role);
        return res.status(403).json({ error: 'User not authorized' });
      }
      req.user = user;
      next();
    });
  };
}

// Multer setup: upload to temp with file size limit and timeout
const upload = multer({
  dest: 'uploads/',
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    fieldSize: 10 * 1024 * 1024 // 10MB limit for fields
  },
  timeout: 30000 // 30 seconds timeout
});

// Log Multer initialization to verify
console.log('Multer upload object initialized:', upload);

// Registration route
app.post('/register', (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ error: 'Error hashing password' });
    }
    db.run(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint')) {
            return res.status(400).json({ error: 'User already exists' });
          }
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ id: this.lastID, email, role });
      }
    );
  });
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) {
      console.error('User lookup error:', err);
      return res.status(401).json({ error: 'User not found' });
    }
    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        console.error('Password comparison error:', err);
        return res.status(403).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ token });
    });
  });
});

// Technician Upload Scan
app.post(
  '/upload',
  authenticateRole('Technician'),
  (req, res, next) => {
    if (!upload) {
      console.error('Multer upload object is undefined');
      return res.status(500).json({ error: 'Multer upload middleware is undefined' });
    }
    console.log('Applying Multer middleware for file upload');
    upload.single('image')(req, res, next);
  },
  async (req, res) => {
    console.log('Headers:', req.headers);
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    console.log('Authorization header:', req.headers['authorization']);
    console.log('req.user from JWT:', req.user);

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded. Ensure your form field name is "image" and a file is selected.',
      });
    }

    const { patientName, patientId, scanType, region } = req.body;
    const imagePath = req.file.path;

    try {
      if (!cloudinary.uploader) {
        throw new Error('Cloudinary uploader is not initialized');
      }
      const result = await cloudinary.uploader.upload(imagePath, { folder: 'oralvis_scans' });
      console.log('Cloudinary upload success:', result.secure_url);

      db.run(
        `INSERT INTO scans (patientName, patientId, scanType, region, imageUrl, uploadDate)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`,
        [patientName, patientId, scanType, region, result.secure_url],
        function (err) {
          if (err) {
            console.error('DB insert error:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          console.log('Scan inserted with ID:', this.lastID);
          // Clean up temp file
          fs.unlink(imagePath).catch((err) => console.error('Failed to delete temp file:', err));
          res.json({ id: this.lastID, imageUrl: result.secure_url });
        }
      );
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      // Clean up temp file on error
      fs.unlink(imagePath).catch((err) => console.error('Failed to delete temp file:', err));
      res.status(500).json({ error: 'Cloudinary upload error', details: error.message });
    }
  }
);

// Dentist View Scans
app.get('/scans', authenticateRole('Dentist'), (req, res) => {
  db.all('SELECT * FROM scans ORDER BY uploadDate DESC', [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`OralVis backend running on ${PORT}`));