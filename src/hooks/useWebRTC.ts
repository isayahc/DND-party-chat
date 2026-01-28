import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

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
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
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

      // Add local stream tracks to the connection
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });
      }

      // Handle incoming stream
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setPeers((prev) => {
          const newPeers = new Map(prev);
          const peer = newPeers.get(targetUserId);
          if (peer) {
            peer.stream = remoteStream;
          }
          return newPeers;
        });
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('webrtc-ice-candidate', {
            targetId: targetUserId,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        console.log(`ICE connection state: ${peerConnection.iceConnectionState}`);
      };

      return peerConnection;
    },
    [localStream, socket]
  );

  const createOffer = useCallback(
    async (targetUserId: string) => {
      if (!socket) return;

      const peerConnection = createPeerConnection(targetUserId);
      setPeers((prev) => new Map(prev).set(targetUserId, { connection: peerConnection }));

      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket.emit('webrtc-offer', {
          targetId: targetUserId,
          offer: offer,
        });
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    },
    [socket, createPeerConnection]
  );

  const handleOffer = useCallback(
    async (data: { userId: string; offer: RTCSessionDescriptionInit }) => {
      if (!socket) return;

      const { userId: senderId, offer } = data;
      const peerConnection = createPeerConnection(senderId);
      setPeers((prev) => new Map(prev).set(senderId, { connection: peerConnection }));

      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit('webrtc-answer', {
          targetId: senderId,
          answer: answer,
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    },
    [socket, createPeerConnection]
  );

  const handleAnswer = useCallback(
    async (data: { userId: string; answer: RTCSessionDescriptionInit }) => {
      const { userId: senderId, answer } = data;
      const peer = peersRef.current.get(senderId);

      if (peer) {
        try {
          await peer.connection.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
          console.error('Error handling answer:', error);
        }
      }
    },
    []
  );

  const handleIceCandidate = useCallback(
    async (data: { userId: string; candidate: RTCIceCandidateInit }) => {
      const { userId: senderId, candidate } = data;
      const peer = peersRef.current.get(senderId);

      if (peer) {
        try {
          await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    },
    []
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

  // Set up socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);

    return () => {
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleIceCandidate);
    };
  }, [socket, handleOffer, handleAnswer, handleIceCandidate]);

  return {
    peers,
    createOffer,
    closePeerConnection,
    closeAllConnections,
  };
};
