// Example backend authentication endpoint
// This should run on a server (Node.js, Python, etc.) - NOT in the browser
// 
// Example using Node.js/Express:
// npm install express cors crypto

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// SECRET stored on server only - never exposed to client
const PUSHER_SECRET = process.env.PUSHER_SECRET || 'b23e8785f7e108dfd7ba';
const PUSHER_KEY = process.env.PUSHER_KEY || '3b88050d4007e937f6d7';

// Authentication endpoint
app.post('/api/pusher/auth', async (req, res) => {
  try {
    const { socketId, channelName } = req.body;
    
    if (!socketId || !channelName) {
      return res.status(400).json({ error: 'Missing socketId or channelName' });
    }
    
    // Generate HMAC signature on the server
    const stringToSign = `${socketId}:${channelName}`;
    const signature = crypto
      .createHmac('sha256', PUSHER_SECRET)
      .update(stringToSign)
      .digest('hex');
    
    // Return auth token (key:signature)
    const auth = `${PUSHER_KEY}:${signature}`;
    
    res.json({ auth });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pusher auth server running on port ${PORT}`);
});
