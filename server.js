require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const BOKUN_API_KEY = process.env.BOKUN_API_KEY;
const BOKUN_API_SECRET = process.env.BOKUN_API_SECRET;

// Root route - simple check
app.get('/', (req, res) => {
  res.send('Bokun backend API is running.');
});

// Availability endpoint
app.get('/availability', async (req, res) => {
  const { productId, start, end } = req.query;

  if (!productId || !start || !end) {
    return res.status(400).json({ error: 'Missing required query params: productId, start, end' });
  }

  try {
    const url = `https://api.bokun.io/activity.json/${productId}/availabilities?start=${start}&end=${end}`;

    const response = await axios.get(url, {
      headers: {
        'X-Bokun-AccessKey': BOKUN_API_KEY,
        'X-Bokun-AccessSecret': BOKUN_API_SECRET,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching from Bokun:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch availability from Bokun' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
