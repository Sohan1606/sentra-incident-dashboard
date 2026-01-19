const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'https://sentra-6zqa.onrender.com', // Your frontend domain
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory storage (Render free tier - no persistent DB)
let incidents = [];

// ✅ INCIDENTS API ROUTES
app.get('/api/incidents', (req, res) => {
  res.json(incidents);
});

app.post('/api/incidents', (req, res) => {
  const incident = { 
    id: Date.now(),
    ...req.body 
  };
  incidents.unshift(incident); // Add to beginning (newest first)
  res.status(201).json(incident);
});

app.put('/api/incidents/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = incidents.findIndex(i => i.id === id);
  
  if (index !== -1) {
    incidents[index] = { ...incidents[index], ...req.body };
    res.json(incidents[index]);
  } else {
    res.status(404).json({ error: 'Incident not found' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', incidentsCount: incidents.length });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Sentra Backend running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;
