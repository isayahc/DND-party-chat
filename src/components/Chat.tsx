import { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import './Chat.css';

interface Message {
  userId?: string;
  username: string;
  message: string;
  timestamp: string;
}

interface ChatProps {
  socket: Socket | null;
  room: string;
  username: string;
}

export const Chat = ({ socket, room, username }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on('message', handleMessage);

    return () => {
      socket.off('message', handleMessage);
    };
  }, [socket]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputMessage.trim() && socket && room) {
      socket.emit('send-message', {
        room,
        message: inputMessage.trim(),
      });
      setInputMessage('');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Text Chat - Room: {room}</h3>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.username === username ? 'own-message' : ''} ${
                msg.username === 'System' ? 'system-message' : ''
              }`}
            >
              <div className="message-header">
                <span className="message-username">{msg.username}</span>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-input-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
          disabled={!socket || !room}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!inputMessage.trim() || !socket || !room}
        >
          Send
        </button>
      </form>
    </div>
  );
};
