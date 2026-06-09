import React, { useState } from 'react';
import './FileList.css';

const FileList = ({ files, connection, onRemoveFile }) => {
  const [sendingStatus, setSendingStatus] = useState(false);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSendAll = async () => {
    if (!connection) return;
    setSendingStatus(true);
    
    for (let file of files) {
      // In a real app we'd chunk this for large files, but for small files we can just send the blob
      const arrayBuffer = await file.arrayBuffer();
      
      connection.send({
        type: 'file',
        filename: file.name,
        mimeType: file.type,
        file: arrayBuffer
      });
    }

    setTimeout(() => {
      setSendingStatus(false);
      // Optional: empty the files list or mark them as sent
    }, 1000);
  };

  return (
    <div className="file-list-container animate-slide-up">
      <div className="file-list-header">
        <h3>Selected Files ({files.length})</h3>
        <button 
          className="send-button" 
          onClick={handleSendAll}
          disabled={sendingStatus || !connection}
        >
          {sendingStatus ? 'Sending...' : 'Send All'}
        </button>
      </div>
      
      <div className="file-grid">
        {files.map((file, index) => {
          const isImage = file.type.startsWith('image/');
          const isVideo = file.type.startsWith('video/');
          let previewUrl = null;
          
          if (isImage || isVideo) {
            previewUrl = URL.createObjectURL(file);
          }

          return (
            <div key={index} className="file-item">
              <div className="file-preview">
                <button 
                  className="remove-file-button" 
                  onClick={() => onRemoveFile(index)}
                  title="Remove file"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                {isImage && <img src={previewUrl} alt={file.name} />}
                {isVideo && <video src={previewUrl} />}
                {!isImage && !isVideo && (
                  <div className="generic-icon">📄</div>
                )}
              </div>
              <div className="file-info">
                <span className="file-name" title={file.name}>{file.name}</span>
                <span className="file-size">{formatSize(file.size)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileList;
