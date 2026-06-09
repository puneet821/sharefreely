import React, { useState } from 'react';
import './FileList.css';

const FileList = ({ files, connection, onRemoveFile, onSendComplete }) => {
  const [sendingStatus, setSendingStatus] = useState(false);
  const [progresses, setProgresses] = useState({});

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
    
    const CHUNK_SIZE = 128 * 1024; // 128KB chunks
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      
      // For empty files
      if (file.size === 0) {
        connection.send({
          type: 'file', // Fallback to old method for empty files to avoid math errors
          filename: file.name,
          mimeType: file.type,
          file: new ArrayBuffer(0)
        });
        setProgresses(prev => ({ ...prev, [i]: 100 }));
        continue;
      }
      
      connection.send({
        type: 'file-start',
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        totalChunks: totalChunks
      });
      
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunkBlob = file.slice(start, end);
        const arrayBuffer = await chunkBlob.arrayBuffer();
        
        connection.send({
          type: 'file-chunk',
          filename: file.name,
          chunkIndex: chunkIndex,
          data: arrayBuffer
        });
        
        // Yield to event loop to prevent freezing and avoid overwhelming the connection buffer
        await new Promise(r => setTimeout(r, 5));
        
        const percent = Math.round(((chunkIndex + 1) / totalChunks) * 100);
        setProgresses(prev => ({ ...prev, [i]: percent }));
      }
      
      connection.send({
        type: 'file-end',
        filename: file.name
      });
    }

    setTimeout(() => {
      setSendingStatus(false);
      setProgresses({});
      if (onSendComplete) {
        onSendComplete(files);
      }
    }, 500);
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

          const progress = progresses[index];

          return (
            <div key={index} className="file-item">
              <div className="file-preview">
                <button 
                  className="remove-file-button" 
                  onClick={() => onRemoveFile(index)}
                  title="Remove file"
                  disabled={sendingStatus}
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
                
                {sendingStatus && progress !== undefined && (
                  <div className="upload-progress-overlay">
                    <div className="upload-progress-bar" style={{ width: `${progress}%` }}></div>
                    <span className="upload-progress-text">{progress}%</span>
                  </div>
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
