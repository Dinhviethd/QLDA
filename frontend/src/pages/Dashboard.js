import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user info
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  return (
    <div className="app-container">
      <Header />
      <div className="app-main">
        <aside className="app-sidebar">
          <div className="sidebar-section">
            <h3>Quick Actions</h3>
            <ul>
              <li><a href="/chat">💬 Start Chat</a></li>
              <li><a href="/documents">📄 Documents</a></li>
              <li><a href="#profile">👤 Profile</a></li>
              <li><a href="#settings">⚙️ Settings</a></li>
            </ul>
          </div>
          {user && (
            <div className="sidebar-section">
              <h4>Current User</h4>
              <p>{user.email}</p>
            </div>
          )}
        </aside>
        <div className="app-content">
          <div className="dashboard-header">
            <h2>Welcome to AI Virtual Assistant for eOffice</h2>
            <p>Your intelligent assistant for office automation and productivity</p>
          </div>
          
          <div className="dashboard-sections">
            <section className="dashboard-section">
              <h3>📊 Quick Summary</h3>
              <div className="summary-cards">
                <div className="card">
                  <h4>Recent Chats</h4>
                  <p>Start a new conversation with AI</p>
                  <button onClick={() => window.location.href = '/chat'}>Open Chat</button>
                </div>
                <div className="card">
                  <h4>Documents</h4>
                  <p>Manage your documents and files</p>
                  <button onClick={() => window.location.href = '/documents'}>View Documents</button>
                </div>
                <div className="card">
                  <h4>Help & Support</h4>
                  <p>Learn how to use the assistant</p>
                  <button>Get Help</button>
                </div>
              </div>
            </section>

            <section className="dashboard-section">
              <h3>📈 Features</h3>
              <div className="features-grid">
                <div className="feature-item">
                  <span className="feature-icon">🤖</span>
                  <h4>AI Powered</h4>
                  <p>Powered by advanced AI technology</p>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📄</span>
                  <h4>Document Management</h4>
                  <p>Upload and analyze documents</p>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔐</span>
                  <h4>Secure</h4>
                  <p>Your data is encrypted and secure</p>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <h4>Fast</h4>
                  <p>Get instant responses</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
