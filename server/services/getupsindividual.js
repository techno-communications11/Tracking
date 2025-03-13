const axios = require('axios');
require('dotenv').config();


function formatDeliveryDate(rawDate) {
    if (!rawDate) return null; // Return null if the date is missing or invalid
  
    // Extract year, month, and day from the raw date string
    const year = rawDate.slice(0, 4);
    const month = rawDate.slice(4, 6);
    const day = rawDate.slice(6, 8);
  
    // Construct a valid MySQL DATETIME string (YYYY-MM-DD HH:MM:SS)
    // If time is not provided, default to 00:00:00
    return `${year}-${month}-${day} 00:00:00`;
  }

async function getupsindividual(req, res) {
  const { trackingNumber } = req.body;

  if (!trackingNumber) {
    return res.status(400).json({ error: 'Tracking number is required' });
  }

  const authData = new URLSearchParams();
  authData.append('grant_type', 'client_credentials');

  try {
    // Get access token
    const credentials = `${process.env.UPS_API_KEY}:${process.env.UPS_SECRET_KEY}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');

    const authResponse = await axios.post(
      'https://onlinetools.ups.com/security/v1/oauth/token',
      authData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${encodedCredentials}`,
        },
      }
    );

    const accessToken = authResponse.data.access_token;

    // Fetch tracking details using GET request (UPS API uses GET for tracking)
    const trackResponse = await axios.get(
      `https://onlinetools.ups.com/api/track/v1/details/${trackingNumber}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'transId': `${Date.now()}`,
          'transactionSrc': 'tracking_app',
          'Content-Type': 'application/json',
        },
      }
    );

    

    // Process UPS API response
    const shipment = trackResponse.data?.trackResponse?.shipment?.[0];
     console.log(shipment,'ss');
    if (!shipment) {
      throw new Error('No shipment data found');
    }

    const packageDetails = shipment.package?.[0];
    if (!packageDetails) {
      throw new Error('No package details available');
    }

    const latestStatus = packageDetails.currentStatus || {};
    const dateAndTimes = packageDetails.deliveryDate || [];

    let relevantDeliveryDate = null;
    const status = latestStatus.description?.toLowerCase() || 'unknown';

    if (status.includes('delivered')) {
      relevantDeliveryDate = dateAndTimes.find(item => item.type === 'ACTUAL_DELIVERY')?.dateTime || null;
    } else if (status.includes('out for delivery') || status.includes('on the way')) {
      relevantDeliveryDate = dateAndTimes.find(item => item.type === 'ESTIMATED_DELIVERY')?.dateTime || null;
    }

    const trackingData = {
      trackingNumber,
      statusByLocale: latestStatus.description || 'Unknown',
      description: latestStatus.description || 'No description available',
      deliveryDate: relevantDeliveryDate,
      deliveryAttempts: packageDetails.deliveryAttempts || 0,
      receivedByName: packageDetails.receivedBy || null,
    };

    res.status(200).json(trackingData);
  } catch (error) {
    console.error('Error fetching UPS tracking details:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch tracking details',
      details: error.message 
    });
  }
}

module.exports = { getupsindividual };