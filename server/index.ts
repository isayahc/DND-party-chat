import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const httpServer = createServer(app);

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure allowed origins for CORS
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = CLIENT_URL.split(',').map(url => url.trim());

// CORS origin validation function
const validateOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin) return callback(null, true);
  
  // Allow same-origin requests (when frontend is served from same server)
  const serverPort = process.env.PORT || '3001';
  const sameOriginUrls = [
    `http://localhost:${serverPort}`,
  ];
  
  // Check if the origin is in the allowed list or is same-origin
  if (allowedOrigins.includes(origin) || sameOriginUrls.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

const io = new Server(httpServer, {
  cors: {
    origin: validateOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: validateOrigin,
  credentials: true,
}));
app.use(express.json());

// Serve static files from the dist directory in production (but not index.html at root)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Store active rooms and users
interface User {
  id: string;
  username: string;
  room: string;
  isMuted: boolean;
}

interface Room {
  name: string;
  users: Set<string>;
}

// WebRTC signaling types
interface RTCSessionDescriptionLike {
  type: 'offer' | 'answer';
  sdp: string;
}

interface RTCIceCandidateLike {
  candidate: string;
  sdpMLineIndex: number | null;
  sdpMid: string | null;
}

const rooms = new Map<string, Room>();
const users = new Map<string, User>();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a room
  socket.on('join-room', ({ room, username }: { room: string; username: string }) => {
    // Validate inputs
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      socket.emit('error', { message: 'Invalid username' });
      return;
    }
    if (!room || typeof room !== 'string' || room.trim().length === 0) {
      socket.emit('error', { message: 'Invalid room name' });
      return;
    }
    if (username.length > 50) {
      socket.emit('error', { message: 'Username too long (max 50 characters)' });
      return;
    }
    if (room.length > 50) {
      socket.emit('error', { message: 'Room name too long (max 50 characters)' });
      return;
    }

    const sanitizedUsername = username.trim().substring(0, 50);
    const sanitizedRoom = room.trim().substring(0, 50);
    
    console.log(`${sanitizedUsername} joining room: ${sanitizedRoom}`);
    
    socket.join(sanitizedRoom);
    
    // Store user info
    users.set(socket.id, {
      id: socket.id,
      username: sanitizedUsername,
      room: sanitizedRoom,
      isMuted: false,
    });

    // Update or create room
    if (!rooms.has(sanitizedRoom)) {
      rooms.set(sanitizedRoom, { name: sanitizedRoom, users: new Set() });
    }
    rooms.get(sanitizedRoom)!.users.add(socket.id);

    // Notify others in the room
    socket.to(sanitizedRoom).emit('user-joined', {
      userId: socket.id,
      username: sanitizedUsername,
    });

    // Send current users to the new user
    const roomUsers = Array.from(rooms.get(sanitizedRoom)!.users)
      .filter(id => id !== socket.id)
      .map(id => {
        const user = users.get(id);
        return user ? { userId: id, username: user.username } : null;
      })
      .filter((user): user is { userId: string; username: string } => user !== null);
    
    socket.emit('room-users', roomUsers);

    // Send join confirmation
    io.to(sanitizedRoom).emit('message', {
      username: 'System',
      message: `${sanitizedUsername} has joined the room`,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle text chat messages
  socket.on('send-message', ({ room, message }: { room: string; message: string }) => {
    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return; // Silently ignore empty messages
    }
    if (message.length > 1000) {
      socket.emit('error', { message: 'Message too long (max 1000 characters)' });
      return;
    }

    const user = users.get(socket.id);
    if (user) {
      const sanitizedMessage = message.trim().substring(0, 1000);
      io.to(room).emit('message', {
        userId: socket.id,
        username: user.username,
        message: sanitizedMessage,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // WebRTC Signaling - Offer
  socket.on('webrtc-offer', ({ targetId, offer }: { targetId: string; offer: RTCSessionDescriptionLike }) => {
    const user = users.get(socket.id);
    if (user) {
      io.to(targetId).emit('webrtc-offer', {
        userId: socket.id,
        username: user.username,
        offer,
      });
    }
  });

  // WebRTC Signaling - Answer
  socket.on('webrtc-answer', ({ targetId, answer }: { targetId: string; answer: RTCSessionDescriptionLike }) => {
    io.to(targetId).emit('webrtc-answer', {
      userId: socket.id,
      answer,
    });
  });

  // WebRTC Signaling - ICE Candidate
  socket.on('webrtc-ice-candidate', ({ targetId, candidate }: { targetId: string; candidate: RTCIceCandidateLike }) => {
    io.to(targetId).emit('webrtc-ice-candidate', {
      userId: socket.id,
      candidate,
    });
  });

  // Mute/Unmute
  socket.on('toggle-mute', ({ isMuted }: { isMuted: boolean }) => {
    const user = users.get(socket.id);
    if (user) {
      user.isMuted = isMuted;
      socket.to(user.room).emit('user-muted', {
        userId: socket.id,
        isMuted,
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      const room = rooms.get(user.room);
      if (room) {
        room.users.delete(socket.id);
        
        // Notify others
        io.to(user.room).emit('user-left', {
          userId: socket.id,
          username: user.username,
        });

        io.to(user.room).emit('message', {
          username: 'System',
          message: `${user.username} has left the room`,
          timestamp: new Date().toISOString(),
        });

        // Clean up empty rooms
        if (room.users.size === 0) {
          rooms.delete(user.room);
        }
      }
      users.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root route handler
app.get('/', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    // Only send fallback if headers haven't been sent yet
    if (err && !res.headersSent) {
      // If the file doesn't exist (development mode), send a welcome message
      res.status(200).send('Welcome to the DND Party Chat server!');
    }
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
