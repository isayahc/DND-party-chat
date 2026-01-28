import { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useWebRTC } from '../hooks/useWebRTC';
import './VoiceCall.css';

interface User {
  userId: string;
  username: string;
}

interface VoiceCallProps {
  socket: Socket | null;
  room: string;
  username: string;
  userId: string;
}

export const VoiceCall = ({ socket, room, username, userId }: VoiceCallProps) => {
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const { peers, createOffer, closeAllConnections } = useWebRTC({
    socket,
    userId,
    localStream,
  });

  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = (data: User) => {
      console.log('User joined:', data);
      setRemoteUsers((prev) => {
        if (prev.some(u => u.userId === data.userId)) return prev;
        return [...prev, data];
      });
      
      // If we're in a call, create an offer to the new user
      if (isInCall && data.userId !== userId) {
        createOffer(data.userId);
      }
    };

    const handleRoomUsers = (users: User[]) => {
      console.log('Room users:', users);
      setRemoteUsers(users.filter(u => u.userId !== userId));
      
      // Create offers to all existing users when joining
      if (isInCall) {
        users.forEach(user => {
          if (user.userId !== userId) {
            createOffer(user.userId);
          }
        });
      }
    };

    const handleUserLeft = (data: User) => {
      console.log('User left:', data);
      setRemoteUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    };

    socket.on('user-joined', handleUserJoined);
    socket.on('room-users', handleRoomUsers);
    socket.on('user-left', handleUserLeft);

    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('room-users', handleRoomUsers);
      socket.off('user-left', handleUserLeft);
    };
  }, [socket, createOffer, isInCall, userId]);

  // Update remote audio elements when peers change
  useEffect(() => {
    peers.forEach((peer, peerId) => {
      if (peer.stream) {
        const audioElement = remoteAudioRefs.current.get(peerId);
        if (audioElement) {
          audioElement.srcObject = peer.stream;
        }
      }
    });
  }, [peers]);

  const joinCall = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setLocalStream(stream);
      setIsInCall(true);

      // Create offers to all existing users
      remoteUsers.forEach(user => {
        createOffer(user.userId);
      });

      console.log('Joined call successfully');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Failed to access microphone. Please check your permissions.');
    }
  };

  const leaveCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    closeAllConnections();
    setIsInCall(false);
    setIsMuted(false);
    console.log('Left call');
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        
        // Notify server about mute status
        if (socket) {
          socket.emit('toggle-mute', { isMuted: !audioTrack.enabled });
        }
      }
    }
  };

  return (
    <div className="voice-call-container">
      <div className="voice-call-header">
        <h3>Voice Call</h3>
        <div className="call-status">
          {isInCall ? (
            <span className="status-indicator active">● In Call</span>
          ) : (
            <span className="status-indicator">○ Not in Call</span>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="controls">
        {!isInCall ? (
          <button onClick={joinCall} className="btn btn-primary">
            🎤 Join Voice Call
          </button>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className={`btn ${isMuted ? 'btn-danger' : 'btn-secondary'}`}
            >
              {isMuted ? '🔇 Unmute' : '🎤 Mute'}
            </button>
            <button onClick={leaveCall} className="btn btn-danger">
              📞 Leave Call
            </button>
          </>
        )}
      </div>

      <div className="participants">
        <h4>Participants ({isInCall ? remoteUsers.length + 1 : 0})</h4>
        <div className="participants-list">
          {isInCall && (
            <div className="participant own-participant">
              <span className="participant-name">{username} (You)</span>
              {isMuted && <span className="muted-badge">🔇 Muted</span>}
            </div>
          )}
          {isInCall && remoteUsers.map((user) => (
            <div key={user.userId} className="participant">
              <span className="participant-name">{user.username}</span>
              <audio
                ref={(el) => {
                  if (el) {
                    remoteAudioRefs.current.set(user.userId, el);
                  } else {
                    remoteAudioRefs.current.delete(user.userId);
                  }
                }}
                autoPlay
              />
            </div>
          ))}
        </div>
        {!isInCall && (
          <div className="no-participants">
            Join the voice call to see participants
          </div>
        )}
      </div>

      {/* Hidden local audio element (for monitoring if needed) */}
      <audio ref={localAudioRef} muted />
    </div>
  );
};
