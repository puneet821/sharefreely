import React from 'react';
import './SentFiles.css';

const SentFiles = ({ files }) => {
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="sent-files-container animate-slide-up">
      <div className="sent-header">
        <h3>Sent Files ({files.length})</h3>
      </div>
      
      <div className="sent-grid">
        {files.map((file, index) => {
          const isImage = file.mimeType?.startsWith('image/');
          const isVideo = file.mimeType?.startsWith('video/');

          return (
            <div key={index} className="sent-item">
              <div className="sent-preview">
                {isImage && <img src={file.url} alt={file.name} />}
                {isVideo && <video src={file.url} />}
                {!isImage && !isVideo && (
                  <div className="generic-icon">📤</div>
                )}
              </div>
              <div className="sent-info">
                <span className="sent-name" title={file.name}>{file.name}</span>
                <span className="sent-size">{formatSize(file.size)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SentFiles;
