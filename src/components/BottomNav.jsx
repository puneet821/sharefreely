import React from 'react';
import './BottomNav.css';

const BottomNav = ({ activeTab, onTabChange, unreadCount = 0 }) => {
  return (
    <div className="bottom-nav">
      <button 
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onTabChange('home')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>Share</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'sent' ? 'active' : ''}`}
        onClick={() => onTabChange('sent')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
        <span>Sent</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'received' ? 'active' : ''}`}
        onClick={() => onTabChange('received')}
      >
        <div className="icon-wrapper">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
        </div>
        <span>Received</span>
      </button>
    </div>
  );
};

export default BottomNav;
