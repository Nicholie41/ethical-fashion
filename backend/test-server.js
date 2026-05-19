const express = require('express');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Test routes
app.get('/', (req, res) => {
  res.json({ message: 'Test server is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Test server started on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
}); 