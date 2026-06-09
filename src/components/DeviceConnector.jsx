import React, { useState } from 'react';
import './DeviceConnector.css';

const DeviceConnector = ({ myId, isConnected, onConnect, onDisconnect }) => {
  const [targetId, setTargetId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (targetId.length === 6) {
      onConnect(targetId);
    }
  };

  if (isConnected) {
    return (
      <div className="connector-status animate-slide-up">
        <div className="status-info">
          <div className="status-indicator connected"></div>
          <span>Securely Connected</span>
        </div>
        <button className="disconnect-button" onClick={onDisconnect}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="device-connector animate-slide-up">
      <h2>Your Code: <span style={{color: 'var(--accent-color)', letterSpacing: '0.2em'}}>{myId || '...'}</span></h2>
      <p>Enter the 6-digit code of the other device to connect and share files instantly.</p>
      
      <form onSubmit={handleSubmit} className="connector-form">
        <div className="code-input-wrapper">
          <input 
            type="text" 
            maxLength={6} 
            placeholder="000000" 
            value={targetId}
            onChange={(e) => setTargetId(e.target.value.replace(/[^0-9]/g, ''))}
            className="code-input"
          />
        </div>
        <button 
          type="submit" 
          disabled={targetId.length !== 6}
          className="connect-button"
        >
          Connect
        </button>
      </form>
    </div>
  );
};

export default DeviceConnector;
