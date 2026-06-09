import React, { useState, useEffect, useRef } from 'react';
import { Peer } from 'peerjs';
import './App.css';
import DropZone from './components/DropZone';
import DeviceConnector from './components/DeviceConnector';
import FileList from './components/FileList';
import ReceivedFiles from './components/ReceivedFiles';
import SharedText from './components/SharedText';

function App() {
  const [myId, setMyId] = useState('');
  const [peer, setPeer] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const [filesToSend, setFilesToSend] = useState([]);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [sharedText, setSharedText] = useState('');

  useEffect(() => {
    // Generate a simple 6-digit ID
    const id = Math.floor(100000 + Math.random() * 900000).toString();
    setMyId(id);

    const newPeer = new Peer(id);

    newPeer.on('open', (openedId) => {
      console.log('My peer ID is: ' + openedId);
    });

    // Listen for incoming connections
    newPeer.on('connection', (conn) => {
      console.log('Incoming connection...');
      setupConnection(conn);
    });

    setPeer(newPeer);

    return () => {
      newPeer.destroy();
    };
  }, []);

  const setupConnection = (conn) => {
    conn.on('open', () => {
      setIsConnected(true);
      setConnection(conn);
    });

    conn.on('data', (data) => {
      if (data.type === 'file') {
        const fileBlob = new Blob([data.file]);
        const fileUrl = URL.createObjectURL(fileBlob);
        
        setReceivedFiles(prev => [...prev, {
          name: data.filename,
          url: fileUrl,
          size: fileBlob.size,
          mimeType: data.mimeType
        }]);
      } else if (data.type === 'text') {
        setSharedText(data.content);
      }
    });

    conn.on('close', () => {
      setIsConnected(false);
      setConnection(null);
    });
  };

  const connectToPeer = (targetId) => {
    if (!peer) return;
    const conn = peer.connect(targetId);
    setupConnection(conn);
  };

  const handleFilesAdded = (newFiles) => {
    setFilesToSend((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (indexToRemove) => {
    setFilesToSend((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleDisconnect = () => {
    if (connection) {
      connection.close();
    }
    setIsConnected(false);
    setConnection(null);
  };

  const handleTextChange = (newText) => {
    setSharedText(newText);
    if (connection) {
      connection.send({ type: 'text', content: newText });
    }
  };

  return (
    <div className="app-container">
      <header className="header animate-slide-up">
        <h1>Share</h1>
        <div className="header-avatar"></div>
      </header>

      <main className="main-content">
        <DeviceConnector 
          myId={myId}
          isConnected={isConnected} 
          onConnect={connectToPeer} 
          onDisconnect={handleDisconnect}
        />
        
        {isConnected && (
          <>
            <SharedText sharedText={sharedText} onTextChange={handleTextChange} />
            <DropZone onFilesAdded={handleFilesAdded} />
            {filesToSend.length > 0 && (
              <FileList 
                files={filesToSend} 
                connection={connection} 
                onRemoveFile={handleRemoveFile} 
              />
            )}
            {receivedFiles.length > 0 && (
              <ReceivedFiles files={receivedFiles} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
