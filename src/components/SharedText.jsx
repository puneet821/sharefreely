import React, { useState } from 'react';
import './SharedText.css';

const SharedText = ({ sharedText, onTextChange }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sharedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="shared-text-container animate-slide-up">
      <div className="shared-text-header">
        <h3>Live Shared Clipboard</h3>
        <button 
          className="copy-button" 
          onClick={handleCopy}
          disabled={!sharedText}
        >
          {copied ? 'Copied!' : 'Copy Text'}
        </button>
      </div>
      <textarea
        className="shared-textarea"
        value={sharedText}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Type or paste text here to share it instantly with the connected device..."
      />
    </div>
  );
};

export default SharedText;
