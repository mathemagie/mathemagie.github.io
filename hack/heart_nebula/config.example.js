// Pusher Configuration Template
// Copy this file to config.js and fill in your actual Pusher credentials
// DO NOT commit config.js to version control
//
// IMPORTANT: For production, use a backend authentication endpoint instead!
// The secret should NEVER be in client-side code - it's always visible to users.
// See backend-auth-example.js or backend-auth-example.py for server-side auth.

const PUSHER_CONFIG = {
  key: 'YOUR_PUSHER_KEY_HERE',  // Public key - safe to expose
  cluster: 'YOUR_PUSHER_CLUSTER_HERE',  // Public info - safe to expose
  authEndpoint: 'https://your-backend.com/api/pusher/auth'  // Backend endpoint for auth
  // secret: 'NEVER PUT SECRET HERE' - Only use backend auth endpoint!
};
