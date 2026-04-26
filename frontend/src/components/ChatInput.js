import React from 'react';

function ChatInput({ value, onChange, onSubmit, disabled }) {
  return (
    <form className="chat-input-form" onSubmit={onSubmit}>
      <input
        type="text"
        className="chat-input"
        value={value}
        onChange={onChange}
        placeholder="Type your message..."
        disabled={disabled}
      />
      <button
        type="submit"
        className="chat-submit"
        disabled={disabled}
      >
        {disabled ? '...' : 'Send'}
      </button>
    </form>
  );
}

export default ChatInput;
