import React from 'react';
import './ReceivedFiles.css';

const ReceivedFiles = ({ files, onRemove }) => {
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (file) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    files.forEach((file, index) => {
      setTimeout(() => {
        handleDownload(file);
      }, index * 200);
    });
  };

  return (
    <div className="received-files-container animate-slide-up">
      <div className="received-header">
        <h3>Received Files ({files.length})</h3>
        {files.length > 1 && (
          <button 
            className="download-all-button"
            onClick={handleDownloadAll}
            title="Download all files at once"
          >
            Download All
          </button>
        )}
      </div>
      
      <div className="received-grid">
        {files.map((file, index) => {
          const isImage = file.mimeType?.startsWith('image/');
          const isVideo = file.mimeType?.startsWith('video/');

          return (
            <div key={index} className="received-item">
              <div className="received-preview">
                {isImage && <img src={file.url} alt={file.name} />}
                {isVideo && <video src={file.url} />}
                {!isImage && !isVideo && (
                  <div className="generic-icon">📥</div>
                )}
                <button 
                  className="remove-file-button" 
                  onClick={() => onRemove(index)}
                  title="Remove from history"
                >
                  ✕
                </button>
              </div>
              <div className="received-info">
                <span className="received-name" title={file.name}>{file.name}</span>
                <span className="received-size">{formatSize(file.size)}</span>
                <button 
                  className="download-button"
                  onClick={() => handleDownload(file)}
                >
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReceivedFiles;
