const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['https://sentra-6zqa.onrender.com', 'http://localhost:3000'], // Frontend + local dev
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory storage (Render free tier - no persistent DB)
let incidents = [];

// 🧪 ROOT ROUTE - Test server is live
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Sentra Backend Live!', 
    version: '1.0.0',
    endpoints: ['/api/incidents', '/api/health'],
    port: process.env.PORT || 5000
  });
});

// ✅ INCIDENTS API ROUTES
app.get('/api/incidents', (req, res) => {
  res.json({ success: true, data: incidents });
});

app.post('/api/incidents', (req, res) => {
  const incident = { 
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...req.body 
  };
  incidents.unshift(incident); // Add to beginning (newest first)
  console.log('➕ New incident:', incident.title || 'Untitled');
  res.status(201).json({ success: true, data: incident });
});

app.put('/api/incidents/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = incidents.findIndex(i => i.id === id);
  
  if (index !== -1) {
    incidents[index] = { ...incidents[index], ...req.body };
    res.json({ success: true, data: incidents[index] });
  } else {
    res.status(404).json({ success: false, error: 'Incident not found' });
  }
});

// ✅ DELETE endpoint
app.delete('/api/incidents/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = incidents.findIndex(i => i.id === id);
  
  if (index !== -1) {
    const deleted = incidents.splice(index, 1)[0];
    res.json({ success: true, data: deleted });
  } else {
    res.status(404).json({ success: false, error: 'Incident not found' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    uptime: process.uptime(),
    incidentsCount: incidents.length,
    port: process.env.PORT || 5000
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// 🚀 Render requires PORT from env
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sentra Backend running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Public: https://your-app.onrender.com/api/health`);
});

module.exports = app;
