import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { useWebRTC } from "../hooks/useWebRTC";
import "./VoiceCall.css";

interface User {
  userId: string;
  username: string;
}

interface VoiceCallProps {
  socket: Socket | null;
  username: string;
  userId: string;
}

export const VoiceCall = ({ socket, username, userId }: VoiceCallProps) => {
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const { peers, createOffer, closeAllConnections } = useWebRTC({
    socket,
    localStream,
  });

  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = (data: User) => {
      console.log("User joined:", data);
      setRemoteUsers((prev) => {
        if (prev.some((u) => u.userId === data.userId)) return prev;
        return [...prev, data];
      });

      // If we're in a call and have a local stream, create an offer to the new user
      if (isInCall && localStream && data.userId !== userId) {
        console.log(`Creating offer to newly joined user: ${data.username}`);
        // Small delay to ensure everything is set up
        setTimeout(() => {
          createOffer(data.userId);
        }, 100);
      }
    };

    const handleRoomUsers = (users: User[]) => {
      console.log("Room users:", users);
      setRemoteUsers(users.filter((u) => u.userId !== userId));

      // Create offers to all existing users when joining (only if we have local stream)
      if (isInCall && localStream) {
        console.log('Creating offers to existing room users:', users.length - 1);
        users.forEach((user) => {
          if (user.userId !== userId) {
            setTimeout(() => {
              createOffer(user.userId);
            }, 100);
          }
        });
      }
    };

    const handleUserLeft = (data: User) => {
      console.log("User left:", data);
      setRemoteUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    };

    socket.on("user-joined", handleUserJoined);
    socket.on("room-users", handleRoomUsers);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("room-users", handleRoomUsers);
      socket.off("user-left", handleUserLeft);
    };
  }, [socket, createOffer, isInCall, userId, localStream]);

  // Create offers to existing users when we have a local stream and are in a call
  useEffect(() => {
    if (localStream && isInCall) {
      console.log('Local stream available, creating offers to existing users:', remoteUsers.length);
      // Small delay to ensure the stream is fully set up
      setTimeout(() => {
        remoteUsers.forEach((user) => {
          console.log(`Creating offer to user: ${user.username} (${user.userId})`);
          createOffer(user.userId);
        });
      }, 100);
    }
  }, [localStream, isInCall, remoteUsers, createOffer]);

  // Update remote audio elements when peers change
  useEffect(() => {
    console.log("Peers updated:", peers.size);
    peers.forEach((peer, peerId) => {
      const user = remoteUsers.find(u => u.userId === peerId);
      console.log(`Peer ${peerId} (${user?.username || 'unknown'}):`, {
        hasStream: !!peer.stream,
        streamId: peer.stream?.id,
        tracks: peer.stream
          ?.getTracks()
          .map((t) => ({
            kind: t.kind,
            enabled: t.enabled,
            readyState: t.readyState,
            id: t.id,
          })),
        hasAudioElement: remoteAudioRefs.current.has(peerId),
      });

      if (peer.stream) {
        const audioElement = remoteAudioRefs.current.get(peerId);
        if (audioElement && audioElement.srcObject !== peer.stream) {
          console.log(`Setting stream for audio element of ${user?.username || peerId}`);
          audioElement.srcObject = peer.stream;
          void audioElement.play().catch((error) => {
            console.warn(`Failed to play remote audio stream for ${user?.username || peerId}:`, error);
          });
        }
      }
    });
  }, [peers, remoteUsers]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
      closeAllConnections?.();
    };
  }, [localStream, closeAllConnections]);

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
      remoteUsers.forEach((user) => {
        createOffer(user.userId);
      });

      console.log("Joined call successfully");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Failed to access microphone. Please check your permissions.");
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
    console.log("Left call");
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);

        // Notify server about mute status
        if (socket) {
          socket.emit("toggle-mute", { isMuted: !audioTrack.enabled });
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

      {error && <div className="error-message">{error}</div>}

      <div className="controls">
        {!isInCall ? (
          <button onClick={joinCall} className="btn btn-primary">
            🎤 Join Voice Call
          </button>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className={`btn ${isMuted ? "btn-danger" : "btn-secondary"}`}
            >
              {isMuted ? "🔇 Unmute" : "🎤 Mute"}
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
          {isInCall &&
            remoteUsers.map((user) => (
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
