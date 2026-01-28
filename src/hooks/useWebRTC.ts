import { useState, useEffect, useRef, useCallback } from "react";
import { Socket } from "socket.io-client";

interface UseWebRTCProps {
  socket: Socket | null;
  localStream: MediaStream | null;
}

interface PeerConnection {
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

const configuration: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useWebRTC = ({ socket, localStream }: UseWebRTCProps) => {
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map());
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());

  useEffect(() => {
    peersRef.current = peers;
  }, [peers]);

  const createPeerConnection = useCallback(
    (targetUserId: string): RTCPeerConnection => {
      const peerConnection = new RTCPeerConnection(configuration);
      
      // Store pending ICE candidates
      const pendingCandidates: RTCIceCandidate[] = [];
      let isRemoteDescriptionSet = false;

      // Add local stream tracks to the connection
      if (localStream) {
        console.log(`Adding ${localStream.getTracks().length} tracks to peer ${targetUserId}`);
        localStream.getTracks().forEach((track) => {
          console.log(`Adding track: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
          peerConnection.addTrack(track, localStream);
        });
      } else {
        console.warn(`No local stream available when creating peer connection for ${targetUserId}`);
      }

      // Handle incoming stream
      peerConnection.ontrack = (event) => {
        console.log("ontrack fired for", targetUserId, {
          streams: event.streams.length,
          track: event.track.kind,
          trackEnabled: event.track.enabled,
          trackReadyState: event.track.readyState
        });
        const [remoteStream] = event.streams;
        if (remoteStream) {
          setPeers((prev) => {
            const newPeers = new Map(prev);
            const peer = newPeers.get(targetUserId);
            if (peer) {
              // Create a NEW object so React detects the change
              newPeers.set(targetUserId, { ...peer, stream: remoteStream });
            }
            return newPeers;
          });
        }
      };

      // Handle ICE candidates with buffering
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("webrtc-ice-candidate", {
            targetId: targetUserId,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        console.log(
          `ICE connection state for ${targetUserId}: ${peerConnection.iceConnectionState}`,
        );
        
        if (peerConnection.iceConnectionState === 'failed') {
          console.warn(`ICE connection failed for ${targetUserId}, attempting to restart`);
          // Attempt to restart ICE
          peerConnection.restartIce();
        }
      };
      
      // Enhanced logging for connection state
      peerConnection.onconnectionstatechange = () => {
        console.log(
          `Connection state for ${targetUserId}: ${peerConnection.connectionState}`,
        );
      };

      return peerConnection;
    },
    [localStream, socket],
  );

  const createOffer = useCallback(
    async (targetUserId: string) => {
      if (!socket) {
        console.warn('Cannot create offer: no socket connection');
        return;
      }
      
      if (!localStream) {
        console.warn('Cannot create offer: no local stream available');
        return;
      }

      console.log(`Creating offer for ${targetUserId}`);
      const peerConnection = createPeerConnection(targetUserId);
      setPeers((prev) =>
        new Map(prev).set(targetUserId, { connection: peerConnection }),
      );

      try {
        // Create offer with audio constraints
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false
        });
        await peerConnection.setLocalDescription(offer);
        
        console.log(`Sending offer to ${targetUserId}:`, offer.type);
        socket.emit("webrtc-offer", {
          targetId: targetUserId,
          offer: offer,
        });
      } catch (error) {
        console.error("Error creating offer for", targetUserId, ":", error);
        // Clean up failed peer connection
        setPeers((prev) => {
          const newPeers = new Map(prev);
          newPeers.delete(targetUserId);
          return newPeers;
        });
      }
    },
    [socket, createPeerConnection, localStream],
  );

  const handleOffer = useCallback(
    async (data: { userId: string; offer: RTCSessionDescriptionInit }) => {
      if (!socket) {
        console.warn('Cannot handle offer: no socket connection');
        return;
      }
      
      if (!localStream) {
        console.warn('Cannot handle offer: no local stream available');
        return;
      }

      const { userId: senderId, offer } = data;
      console.log(`Received offer from ${senderId}:`, offer.type);
      
      const peerConnection = createPeerConnection(senderId);
      setPeers((prev) =>
        new Map(prev).set(senderId, { connection: peerConnection }),
      );

      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer),
        );
        
        const answer = await peerConnection.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false
        });
        await peerConnection.setLocalDescription(answer);
        
        console.log(`Sending answer to ${senderId}:`, answer.type);
        socket.emit("webrtc-answer", {
          targetId: senderId,
          answer: answer,
        });
      } catch (error) {
        console.error("Error handling offer from", senderId, ":", error);
        // Clean up failed peer connection
        setPeers((prev) => {
          const newPeers = new Map(prev);
          newPeers.delete(senderId);
          return newPeers;
        });
      }
    },
    [socket, createPeerConnection, localStream],
  );

  const handleAnswer = useCallback(
    async (data: { userId: string; answer: RTCSessionDescriptionInit }) => {
      const { userId: senderId, answer } = data;
      console.log(`Received answer from ${senderId}:`, answer.type);
      const peer = peersRef.current.get(senderId);

      if (peer) {
        try {
          await peer.connection.setRemoteDescription(
            new RTCSessionDescription(answer),
          );
          console.log(`Successfully set remote description for ${senderId}`);
        } catch (error) {
          console.error("Error handling answer from", senderId, ":", error);
        }
      } else {
        console.warn(`No peer connection found for ${senderId} when handling answer`);
      }
    },
    [],
  );

  const handleIceCandidate = useCallback(
    async (data: { userId: string; candidate: RTCIceCandidateInit }) => {
      const { userId: senderId, candidate } = data;
      const peer = peersRef.current.get(senderId);

      if (peer) {
        try {
          // Check if remote description is set before adding candidate
          if (peer.connection.remoteDescription) {
            await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
            console.log(`Added ICE candidate from ${senderId}`);
          } else {
            console.warn(`Remote description not set yet for ${senderId}, candidate will be added automatically`);
          }
        } catch (error) {
          console.error("Error adding ICE candidate from", senderId, ":", error);
        }
      } else {
        console.warn(`No peer connection found for ${senderId} when handling ICE candidate`);
      }
    },
    [],
  );

  const closePeerConnection = useCallback((targetUserId: string) => {
    const peer = peersRef.current.get(targetUserId);
    if (peer) {
      peer.connection.close();
      setPeers((prev) => {
        const newPeers = new Map(prev);
        newPeers.delete(targetUserId);
        return newPeers;
      });
    }
  }, []);

  const closeAllConnections = useCallback(() => {
    peersRef.current.forEach((peer) => {
      peer.connection.close();
    });
    setPeers(new Map());
  }, []);
  
  // Update all existing peer connections with new local stream
  const updatePeerConnectionsWithStream = useCallback((stream: MediaStream | null) => {
    peersRef.current.forEach(async (peer, targetUserId) => {
      const senders = peer.connection.getSenders();
      
      // Remove existing tracks
      for (const sender of senders) {
        if (sender.track) {
          try {
            await peer.connection.removeTrack(sender);
          } catch (error) {
            console.warn('Error removing track:', error);
          }
        }
      }
      
      // Add new tracks if stream exists
      if (stream) {
        for (const track of stream.getTracks()) {
          try {
            peer.connection.addTrack(track, stream);
            console.log(`Added ${track.kind} track to existing peer ${targetUserId}`);
          } catch (error) {
            console.error('Error adding track to existing peer:', error);
          }
        }
      }
    });
  }, []);
  
  // Update peer connections when local stream changes
  useEffect(() => {
    if (localStream) {
      updatePeerConnectionsWithStream(localStream);
    }
  }, [localStream, updatePeerConnectionsWithStream]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("webrtc-offer", handleOffer);
    socket.on("webrtc-answer", handleAnswer);
    socket.on("webrtc-ice-candidate", handleIceCandidate);

    return () => {
      socket.off("webrtc-offer", handleOffer);
      socket.off("webrtc-answer", handleAnswer);
      socket.off("webrtc-ice-candidate", handleIceCandidate);
    };
  }, [socket, handleOffer, handleAnswer, handleIceCandidate]);

  return {
    peers,
    createOffer,
    closePeerConnection,
    closeAllConnections,
  };
};
