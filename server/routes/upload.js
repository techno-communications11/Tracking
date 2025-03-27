// src/routes/upload.js
const express = require('express');
const multer = require('multer');
const { processUpload } = require('../controllers/trackingController');
 const {upsprocessUpload}=require('../controllers/upsController');
 const { getupsindividual } = require('../services/getupsindividual'); // Import the new function

const { getAllTrackingData } = require('../services/getAllTrackingData');

const { gettrackindividual } = require('../services/gettrackindividual'); // Import the new function
const router = express.Router();
const upload = multer({ dest: 'uploads/' });


const {login}= require('../services/login')





// Handle file upload
router.post('/upload-fedex', upload.single('file'), processUpload);
router.post('/upload-ups', upload.single('file'), upsprocessUpload);

// Fetch all tracking data from the database
router.get('/getalltrackingdata',getAllTrackingData);
router.post('/login',login);
router.post('/gettrackindividual',gettrackindividual);
router.post('/getupsindividual',getupsindividual);
module.exports = router;


