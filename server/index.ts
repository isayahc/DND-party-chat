import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

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

const rooms = new Map<string, Room>();
const users = new Map<string, User>();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a room
  socket.on('join-room', ({ room, username }: { room: string; username: string }) => {
    console.log(`${username} joining room: ${room}`);
    
    socket.join(room);
    
    // Store user info
    users.set(socket.id, {
      id: socket.id,
      username,
      room,
      isMuted: false,
    });

    // Update or create room
    if (!rooms.has(room)) {
      rooms.set(room, { name: room, users: new Set() });
    }
    rooms.get(room)!.users.add(socket.id);

    // Notify others in the room
    socket.to(room).emit('user-joined', {
      userId: socket.id,
      username,
    });

    // Send current users to the new user
    const roomUsers = Array.from(rooms.get(room)!.users)
      .filter(id => id !== socket.id)
      .map(id => ({
        userId: id,
        username: users.get(id)?.username,
      }));
    
    socket.emit('room-users', roomUsers);

    // Send join confirmation
    io.to(room).emit('message', {
      username: 'System',
      message: `${username} has joined the room`,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle text chat messages
  socket.on('send-message', ({ room, message }: { room: string; message: string }) => {
    const user = users.get(socket.id);
    if (user) {
      io.to(room).emit('message', {
        userId: socket.id,
        username: user.username,
        message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // WebRTC Signaling - Offer
  socket.on('webrtc-offer', ({ targetId, offer }: { targetId: string; offer: any }) => {
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
  socket.on('webrtc-answer', ({ targetId, answer }: { targetId: string; answer: any }) => {
    io.to(targetId).emit('webrtc-answer', {
      userId: socket.id,
      answer,
    });
  });

  // WebRTC Signaling - ICE Candidate
  socket.on('webrtc-ice-candidate', ({ targetId, candidate }: { targetId: string; candidate: any }) => {
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

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
