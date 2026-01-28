import React from 'react';
import './ChatMessage.css';

export interface ChatMessageProps {
  /** The sender's name */
  sender: string;
  /** The message content */
  message: string;
  /** Timestamp of the message */
  timestamp?: Date;
  /** Whether this is the current user's message */
  isOwn?: boolean;
  /** Character/role name (for D&D context) */
  characterName?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  sender,
  message,
  timestamp,
  isOwn = false,
  characterName,
}) => {
  const formattedTime = timestamp
    ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`chat-message ${isOwn ? 'own-message' : 'other-message'}`}>
      <div className="message-header">
        <span className="sender-name">{sender}</span>
        {characterName && (
          <span className="character-name">({characterName})</span>
        )}
        {timestamp && <span className="message-time">{formattedTime}</span>}
      </div>
      <div className="message-content">{message}</div>
    </div>
  );
};
