import React from 'react';

function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>eOffice AI Assistant</h1>
        <nav className="header-nav">
          <a href="/">Dashboard</a>
          <a href="/chat">Chat</a>
          <a href="/documents">Documents</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
