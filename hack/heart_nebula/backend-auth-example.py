# Example backend authentication endpoint (Python/Flask)
# This should run on a server - NOT in the browser
#
# pip install flask flask-cors

from flask import Flask, request, jsonify
from flask_cors import CORS
import hmac
import hashlib
import os

app = Flask(__name__)
CORS(app)

# SECRET stored on server only - never exposed to client
PUSHER_SECRET = os.getenv('PUSHER_SECRET', 'b23e8785f7e108dfd7ba')
PUSHER_KEY = os.getenv('PUSHER_KEY', '3b88050d4007e937f6d7')

@app.route('/api/pusher/auth', methods=['POST'])
def pusher_auth():
    try:
        data = request.get_json()
        socket_id = data.get('socketId')
        channel_name = data.get('channelName')
        
        if not socket_id or not channel_name:
            return jsonify({'error': 'Missing socketId or channelName'}), 400
        
        # Generate HMAC signature on the server
        string_to_sign = f"{socket_id}:{channel_name}"
        signature = hmac.new(
            PUSHER_SECRET.encode('utf-8'),
            string_to_sign.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        # Return auth token (key:signature)
        auth = f"{PUSHER_KEY}:{signature}"
        
        return jsonify({'auth': auth})
    except Exception as e:
        print(f'Auth error: {e}')
        return jsonify({'error': 'Authentication failed'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3000))
    app.run(port=port, debug=False)
