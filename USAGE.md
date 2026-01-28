# DND Party Chat - Usage Guide

## Overview
DND Party Chat is a real-time communication platform that combines voice calls and text chat, designed for D&D gaming sessions.

## Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/isayahc/DND-party-chat.git
   cd DND-party-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```
   
   This will start:
   - Frontend server at `http://localhost:5173`
   - Backend server at `http://localhost:3001`

## Using the Application

### Joining a Room

1. Open your browser and navigate to `http://localhost:5173`
2. Enter your desired **Username** (e.g., "Gandalf", "Aragorn")
3. Enter a **Room Name** (e.g., "party-room", "campaign-1")
4. Click **Join Room**

**Note**: Users with the same room name will be able to communicate with each other.

### Text Chat

Once in a room:

1. Type your message in the text input field at the bottom of the chat panel
2. Press **Enter** or click the **Send** button
3. Your message will appear in the chat history
4. Messages from other users will appear in real-time

**Features:**
- Messages show the sender's username and timestamp
- Your messages appear on the right (in blue)
- Other users' messages appear on the left
- System messages (joins/leaves) appear in the center

### Voice Call

To join a voice call:

1. Click the **🎤 Join Voice Call** button
2. Allow microphone access when prompted by your browser
3. You'll see your name in the Participants list
4. Other participants in the room will be able to hear you

**Voice Controls:**
- **🎤 Mute**: Mute your microphone (others can't hear you)
- **🔇 Unmute**: Unmute your microphone (others can hear you)
- **📞 Leave Call**: Disconnect from the voice call

**Participants List:**
- Shows all users currently in the voice call
- Your entry is highlighted
- Shows mute status for each participant

### Leaving a Room

Click the **Leave Room** button in the top-right corner to:
- Disconnect from the voice call
- Leave the text chat
- Return to the login screen

## Multiple Users

To test with multiple users:

1. Open multiple browser windows/tabs
2. Use different usernames in each window
3. Use the same room name to join the same room
4. Test text chat and voice communication between windows

**Note**: For voice testing, use headphones to prevent audio feedback.

## Browser Requirements

### Supported Browsers:
- Chrome/Chromium (recommended)
- Firefox
- Edge
- Safari (with WebRTC support)

### Required Permissions:
- **Microphone access**: Required for voice calls
- **Network access**: Required for WebSocket connections

## Troubleshooting

### "Failed to access microphone" Error

**Possible causes:**
1. Browser hasn't been granted microphone permissions
2. Another application is using the microphone
3. No microphone device is available

**Solutions:**
1. Check browser permissions (click the lock icon in the address bar)
2. Close other applications using the microphone
3. Connect a microphone device

### Cannot Connect to Server

**Check:**
1. Backend server is running on port 3001
2. No firewall blocking the ports
3. Run `npm run dev` to start both servers

### Messages Not Sending

**Check:**
1. You're connected to a room
2. Browser console for connection errors
3. Backend server logs for issues

### Voice Not Working

**Check:**
1. Microphone permissions granted
2. Both users are in the same room
3. Both users have joined the voice call
4. Browser console for WebRTC errors

## Development

### Running in Development Mode

```bash
# Start both frontend and backend
npm run dev

# Or run separately:
npm run dev:client  # Frontend only (port 5173)
npm run dev:server  # Backend only (port 3001)
```

### Building for Production

```bash
npm run build
```

This creates optimized production files in the `dist` directory.

### Linting

```bash
npm run lint
```

## Architecture

### Frontend (React + TypeScript)
- **Components**: Chat, VoiceCall
- **Hooks**: useWebRTC (custom hook for WebRTC management)
- **Libraries**: Socket.IO Client, React 19

### Backend (Node.js + Express)
- **Server**: Express with Socket.IO
- **WebRTC**: Signaling server for peer connections
- **Room Management**: Track users and rooms

### Communication Flow

1. **Text Messages**: Client → Socket.IO → Server → Socket.IO → All Clients in Room
2. **Voice Signaling**: Client → Socket.IO → Server → Socket.IO → Target Client
3. **Voice Audio**: Direct P2P connection between clients (WebRTC)

## Network Ports

- **5173**: Frontend development server (Vite)
- **3001**: Backend WebSocket server (Socket.IO)
- **WebRTC**: Dynamic ports for P2P connections

## Tips for Best Experience

1. **Use headphones** when testing voice calls to prevent echo
2. **Stable internet connection** for best voice quality
3. **Modern browser** for full WebRTC support
4. **Clear room names** to avoid confusion
5. **Descriptive usernames** for easy identification

## Security Considerations

- The current implementation is for local/development use
- For production deployment:
  - Use HTTPS for secure WebSocket connections (WSS)
  - Implement authentication and authorization
  - Use TURN servers for NAT traversal
  - Add rate limiting for messages
  - Sanitize user inputs
  - Implement room passwords or access controls

## Future Enhancements

Possible features to add:
- User authentication
- Persistent message history
- File sharing
- Video calls
- Screen sharing
- Private messaging
- Emoji reactions
- Typing indicators
- User avatars
- Room settings and moderation
