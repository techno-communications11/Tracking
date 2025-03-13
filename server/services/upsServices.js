const axios = require("axios");
const { truncateTrackingData, insertTrackingData } = require("./databaseService");
require("dotenv").config();

function getAccessToken(callback) {
    const credentials = `${process.env.UPS_API_KEY}:${process.env.UPS_SECRET_KEY}`;
    const encodedCredentials = Buffer.from(credentials).toString("base64");

    const authData = new URLSearchParams();
    authData.append("grant_type", "client_credentials");

    axios.post(
        "https://onlinetools.ups.com/security/v1/oauth/token",
        authData,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${encodedCredentials}`,
            },
        }
    )
    .then(response => callback(null, response.data.access_token))
    .catch(error => {
        console.error("Error fetching UPS access token:", error.response?.data || error.message);
        callback(error);
    });
}


function getUpsTrackingDetails(trackingNumbers, callback) {
  if (!Array.isArray(trackingNumbers) || trackingNumbers.length === 0) {
    return callback ? callback(new Error("Please provide an array of tracking numbers")) : null;
  }

  const trackingDetails = [];
  let completed = 0;
  const total = trackingNumbers.length;

  function checkComplete(err) {
    if (err) {
      console.error("Error in processing:", err);
    }
    completed++;
    if (completed === total && callback) {
      callback(null, trackingDetails);
    }
  }

  getAccessToken((error, accessToken) => {
    if (error) return callback ? callback(error) : null;

    truncateTrackingData((truncateError) => {
      if (truncateError) return callback ? callback(truncateError) : null;

      trackingNumbers.forEach(trackingNumber => {
        if (!trackingNumber || typeof trackingNumber !== 'string' || trackingNumber.trim() === '') {
          console.error('Skipping invalid or empty tracking number:', trackingNumber);
          checkComplete(new Error('Invalid tracking number'));
          return;
        }

        axios.get(
          `https://onlinetools.ups.com/api/track/v1/details/${trackingNumber}`,
          {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "transId": `${Date.now()}`,
              "transactionSrc": "tracking_app",
              "Content-Type": "application/json",
            },
          }
        )
        .then(response => {
          const shipment = response.data?.trackResponse?.shipment?.[0];
          if (!shipment) throw new Error("No shipment data found");

          const packageDetails = shipment.package?.[0] || {};
          const latestStatus = packageDetails.currentStatus || {};
          const dateAndTimes = packageDetails.deliveryDate.map( x=>x.date) || [];
           console.log(dateAndTimes)


          let deliveryDate = null;
          const status = latestStatus.description?.toLowerCase() || "unknown";

          if (status.includes("delivered")) {
            deliveryDate = dateAndTimes.find(item => item.type === "ACTUAL_DELIVERY")?.dateTime;
          } else if (status.includes("out for delivery") || status.includes("on the way")) {
            deliveryDate = dateAndTimes.find(item => item.type === "ESTIMATED_DELIVERY")?.dateTime;
          }

          const trackingData = {
            trackingNumber: trackingNumber, // Ensure trackingNumber is never null
            statusByLocale: latestStatus.description || "Unknown",
            description: latestStatus.description || "No description available",
            deliveryDate: deliveryDate || null,
            deliveryAttempts: packageDetails?.deliveryAttempts || 0,
            receivedByName: packageDetails?.receivedBy || null
          };

          insertTrackingData(trackingData, (insertError) => {
            if (insertError) {
              console.error(`Error inserting data for ${trackingNumber}:`, insertError);
              checkComplete(insertError);
              return;
            }
            trackingDetails.push(trackingData);
            checkComplete(null);
          });
        })
        .catch(error => {
          console.error(`Error for ${trackingNumber}:`, error.response?.data || error.message);
          const errorData = {
            trackingNumber: trackingNumber, // Ensure trackingNumber is never null
            statusByLocale: "Error",
            description: error.message,
            deliveryDate: null,
            deliveryAttempts: 0,
            receivedByName: null
          };
          insertTrackingData(errorData, (insertError) => {
            if (insertError) {
              console.error(`Error inserting error data for ${trackingNumber}:`, insertError);
              checkComplete(insertError);
              return;
            }
            trackingDetails.push(errorData);
            checkComplete(null);
          });
        });
      });
    });
  });
}

module.exports = { getUpsTrackingDetails };