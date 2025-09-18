require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());

const BOKUN_API_KEY = process.env.BOKUN_API_KEY;
const BOKUN_API_SECRET = process.env.BOKUN_API_SECRET;

if (!BOKUN_API_KEY || !BOKUN_API_SECRET) {
  console.error('ERROR: BOKUN_API_KEY or BOKUN_API_SECRET not set in .env');
  process.exit(1);
}

app.get('/availability', async (req, res) => {
  const { productId, start, end } = req.query;

  if (!productId || !start || !end) {
    return res.status(400).json({ error: 'Missing required query params: productId, start, end' });
  }

  try {
    const httpMethod = 'GET';
    const pathAndQuery = `/activity.json/${productId}/availabilities?start=${start}&end=${end}`;

    const pad = (n) => n.toString().padStart(2, '0');

    const now = new Date();
    const utcDate = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;

    const signatureString = utcDate + BOKUN_API_KEY + httpMethod + pathAndQuery;

    const hmac = crypto.createHmac('sha1', BOKUN_API_SECRET);
    hmac.update(signatureString);
    const signature = hmac.digest('base64');

    const url = `https://api.bokun.io${pathAndQuery}`;

    const response = await axios.get(url, {
      headers: {
        'X-Bokun-Date': utcDate,
        'X-Bokun-AccessKey': BOKUN_API_KEY,
        'X-Bokun-Signature': signature,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching from Bokun:', error.response && error.response.data ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch availability from Bokun' });
  }
}); // end app.get

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); // end app.listen
