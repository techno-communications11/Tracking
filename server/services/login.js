const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function  login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Query the database to find the user by email
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.promise().execute(query, [email]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = rows[0];

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email }, // Payload with minimal data
      process.env.JWT_SECRET, // Secret key
      { expiresIn: '1h' } // Expiration time
    );

    // Send the token in the response
    return res.status(200).json({
      message: 'Login successful.',
      token,
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    return res.status(500).json({ error: 'An error occurred during login.' });
  }
}

module.exports = { login };
