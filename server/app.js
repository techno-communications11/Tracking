const express = require('express');
const path = require('path');
const uploadRoutes = require('./routes/upload');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:3001',  // Allow only requests from this domain
    methods: ['GET', 'POST'],        // Allow specific HTTP methods
    allowedHeaders: ['Content-Type'], // Allow specific headers
  };
  
  app.use(cors(corsOptions));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Use routes
app.use('/upload', uploadRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
