import React from 'react';
import './VoiceCallControls.css';

export interface VoiceCallControlsProps {
  /** Whether the microphone is currently muted */
  isMuted?: boolean;
  /** Whether the user is currently in a call */
  isInCall?: boolean;
  /** Whether the speaker is enabled */
  isSpeakerOn?: boolean;
  /** Callback when mute button is clicked */
  onMuteToggle?: () => void;
  /** Callback when call button is clicked */
  onCallToggle?: () => void;
  /** Callback when speaker button is clicked */
  onSpeakerToggle?: () => void;
}

export const VoiceCallControls: React.FC<VoiceCallControlsProps> = ({
  isMuted = false,
  isInCall = false,
  isSpeakerOn = true,
  onMuteToggle,
  onCallToggle,
  onSpeakerToggle,
}) => {
  return (
    <div className="voice-controls">
      <button
        className={`control-button ${isMuted ? 'muted' : 'unmuted'}`}
        onClick={onMuteToggle}
        disabled={!isInCall}
        aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? '🔇' : '🎤'}
      </button>

      <button
        className={`control-button call-button ${isInCall ? 'in-call' : 'not-in-call'}`}
        onClick={onCallToggle}
        aria-label={isInCall ? 'Leave call' : 'Join call'}
        title={isInCall ? 'Leave Call' : 'Join Call'}
      >
        {isInCall ? '📞' : '📞'}
      </button>

      <button
        className={`control-button ${isSpeakerOn ? 'speaker-on' : 'speaker-off'}`}
        onClick={onSpeakerToggle}
        disabled={!isInCall}
        aria-label={isSpeakerOn ? 'Turn speaker off' : 'Turn speaker on'}
        title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
      >
        {isSpeakerOn ? '🔊' : '🔈'}
      </button>
    </div>
  );
};
