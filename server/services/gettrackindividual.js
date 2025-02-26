const axios = require('axios');

async function gettrackindividual(req, res) {
  const { trackingNumber } = req.body;
  const authData = new URLSearchParams();
  authData.append('grant_type', 'client_credentials');
  authData.append('client_id', process.env.FEDEX_API_KEY);
  authData.append('client_secret', process.env.FEDEX_SECRET_KEY);

  try {
    // Get access token
    const authResponse = await axios.post('https://apis.fedex.com/oauth/token', authData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = authResponse.data.access_token;

    // Fetch tracking details
    const trackResponse = await axios.post(
      'https://apis.fedex.com/track/v1/trackingnumbers',
      {
        trackingInfo: [
          {
            trackingNumberInfo: { trackingNumber },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const trackResult = trackResponse.data.output.completeTrackResults[0].trackResults[0];
    const latestStatus = trackResult.latestStatusDetail;
    const dateAndTimes = trackResult.dateAndTimes || [];

    let relevantDeliveryDate = null;
    const status = latestStatus.statusByLocale.toLowerCase();

    if (status.includes("delivered")) {
      relevantDeliveryDate =
        dateAndTimes.find((item) => item.type === "ACTUAL_DELIVERY")
          ?.dateTime || null;
    } else if (status.includes("out for delivery")) {
      relevantDeliveryDate =
        dateAndTimes.find((item) => item.type === "ESTIMATED_DELIVERY")
          ?.dateTime || null;
    } else if (status.includes("on the way")) {
      relevantDeliveryDate =
        dateAndTimes.find((item) => item.type === "ESTIMATED_DELIVERY")
          ?.dateTime || null;
    }

    const deliveryDetails = trackResult.deliveryDetails || {};
    const trackingData = {
      trackingNumber,
      statusByLocale: latestStatus.statusByLocale,
      description: latestStatus.description,
      deliveryDate: relevantDeliveryDate,
      deliveryAttempts: deliveryDetails.deliveryAttempts || 0,
      receivedByName: deliveryDetails.receivedByName || null,
    };

    res.status(200).json(trackingData);
  } catch (error) {
    console.error('Error fetching tracking details:', error.message);
    res.status(500).json({ error: 'Failed to fetch tracking details' });
  }
}

module.exports = { gettrackindividual };
