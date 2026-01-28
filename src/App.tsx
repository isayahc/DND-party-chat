import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Chat } from './components/Chat';
import { VoiceCall } from './components/VoiceCall';
import './App.css';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [inputUsername, setInputUsername] = useState('');
  const [inputRoom, setInputRoom] = useState('');

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputUsername.trim() && inputRoom.trim() && socket) {
      setUsername(inputUsername.trim());
      setRoom(inputRoom.trim());
      
      socket.emit('join-room', {
        room: inputRoom.trim(),
        username: inputUsername.trim(),
      });
      
      setIsJoined(true);
    }
  };

  const leaveRoom = () => {
    setIsJoined(false);
    setUsername('');
    setRoom('');
    
    // Reconnect to clear state
    if (socket) {
      socket.close();
      const newSocket = io('http://localhost:3001');
      setSocket(newSocket);
    }
  };

  if (!isJoined) {
    return (
      <div className="app">
        <div className="login-container">
          <h1>🎲 DND Party Chat</h1>
          <p className="subtitle">Connect with your party for voice and text chat</p>
          
          <form onSubmit={joinRoom} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="room">Room Name</label>
              <input
                id="room"
                type="text"
                value={inputRoom}
                onChange={(e) => setInputRoom(e.target.value)}
                placeholder="Enter room name"
                required
              />
            </div>
            
            <button type="submit" className="join-button">
              Join Room
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-header">
        <div className="header-left">
          <h1>🎲 DND Party Chat</h1>
          <div className="user-info">
            <span className="username-badge">{username}</span>
            <span className="room-badge">Room: {room}</span>
          </div>
        </div>
        <button onClick={leaveRoom} className="leave-room-button">
          Leave Room
        </button>
      </div>

      <div className="app-content">
        <div className="voice-section">
          <VoiceCall
            socket={socket}
            room={room}
            username={username}
            userId={socket?.id || ''}
          />
        </div>
        
        <div className="chat-section">
          <Chat
            socket={socket}
            room={room}
            username={username}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
