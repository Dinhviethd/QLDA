import React from 'react';

function MessageList({ messages, loading }) {
  return (
    <div className="message-list">
      {messages.map((msg, idx) => (
        <div key={idx} className={`message ${msg.role}`}>
          <div className="message-content">
            {msg.content}
          </div>
          <span className="message-time">
            {new Date(msg.created_at).toLocaleTimeString()}
          </span>
        </div>
      ))}
      {loading && (
        <div className="message loading">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      )}
    </div>
  );
}

export default MessageList;
