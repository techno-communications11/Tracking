const db = require('../db');

async function truncateTrackingData() {
  const querdata = `TRUNCATE TABLE TrackingData`;

  try {
    // Clean the table before inserting
    await db.execute(querdata);
  } catch (error) {
    console.error('Error truncating the table:', error.message);
  }
}

async function insertTrackingData(data) {
  const query = `
    INSERT INTO TrackingData 
    (trackingNumber, statusByLocale, description, deliveryDate, deliveryAttempts, receivedByName) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    // Insert the new data
    await db.execute(query, [
      data.trackingNumber,
      data.statusByLocale,
      data.description,
      data.deliveryDate,
      data.deliveryAttempts,
      data.receivedByName,
    ]);
    
    console.log(`Data inserted for tracking number: ${data.trackingNumber}`);
  } catch (error) {
    console.error(`Error inserting data for tracking number ${data.trackingNumber}:`, error.message);
  }
}

module.exports = { truncateTrackingData, insertTrackingData };
