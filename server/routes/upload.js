// src/routes/upload.js
const express = require('express');
const multer = require('multer');
const { processUpload } = require('../controllers/trackingController');
const { getAllTrackingData } = require('../services/getAllTrackingData');
const {login}= require('../services/login')
const { gettrackindividual } = require('../services/gettrackindividual'); // Import the new function
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Handle file upload
router.post('/', upload.single('file'), processUpload);

// Fetch all tracking data from the database
router.get('/getalltrackingdata',getAllTrackingData);
router.post('/login',login);
router.post('/gettrackindividual',gettrackindividual);

module.exports = router;
