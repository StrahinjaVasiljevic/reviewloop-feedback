require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('./api/routes'));

// Root health check
app.get('/', (req, res) => {
  res.json({
    status: 'ReviewLoop API is running',
    version: '1.0.0',
    endpoints: {
      survey: 'POST /api/survey',
      digest: 'GET /api/digest/:workspaceId',
      health: 'GET /api/health'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ReviewLoop API running on port ${PORT}`);
});
