import React, { useState } from 'react';
import Header from '../components/Header';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response || data.message || 'No response', timestamp: new Date() }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { role: 'error', content: 'Failed to get response. Make sure backend is running.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Header />
      <div className="app-main">
        <aside className="app-sidebar">
          <div className="sidebar-section">
            <h3>Chat Options</h3>
            <ul>
              <li><a href="/">← Back to Dashboard</a></li>
              <li><a href="#new-chat">+ New Chat</a></li>
              <li><a href="/documents">📄 Documents</a></li>
            </ul>
          </div>
          <div className="sidebar-section">
            <h4>Tips</h4>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              • Be specific with your questions<br/>
              • Attach documents for context<br/>
              • Clear chat to start fresh
            </p>
          </div>
        </aside>
        <div className="app-content">
          <div className="dashboard-header">
            <h2>💬 Chat with AI Assistant</h2>
            <p>Ask questions, get instant responses powered by AI</p>
          </div>
          
          <div style={{ background: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <div className="messages" style={{ height: '400px', overflowY: 'auto', marginBottom: '1.5rem', borderRadius: '8px', background: '#f9f9f9', padding: '1rem' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', paddingTop: '2rem' }}>
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} style={{
                    marginBottom: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: msg.role === 'user' ? '#667eea' : msg.role === 'error' ? '#e74c3c' : '#f0f0f0',
                    color: msg.role === 'user' ? 'white' : msg.role === 'error' ? 'white' : '#333',
                    wordWrap: 'break-word'
                  }}>
                    <strong>{msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'AI' : 'Error'}:</strong> {msg.content}
                    <small style={{ opacity: 0.7, display: 'block', marginTop: '0.25rem' }}>
                      {msg.timestamp?.toLocaleTimeString()}
                    </small>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: loading ? '#ccc' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
