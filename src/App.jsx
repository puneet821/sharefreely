import React, { useState, useEffect, useRef } from 'react';
import { Peer } from 'peerjs';
import localforage from 'localforage';
import './App.css';
import DropZone from './components/DropZone';
import DeviceConnector from './components/DeviceConnector';
import FileList from './components/FileList';
import ReceivedFiles from './components/ReceivedFiles';
import SentFiles from './components/SentFiles';
import SharedText from './components/SharedText';
import BottomNav from './components/BottomNav';
import AuthModal from './components/AuthModal';

// Configure localforage to use IndexedDB
localforage.config({
  name: 'ShareFreelyApp'
});

function App() {
  const [myId, setMyId] = useState('');
  const [peer, setPeer] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const [filesToSend, setFilesToSend] = useState([]);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [sentFiles, setSentFiles] = useState([]);
  const [sharedText, setSharedText] = useState('');

  const incomingFiles = useRef({});

  const [activeTab, setActiveTab] = useState('home');
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (activeTab === 'received') {
      setUnreadCount(0);
    }
  }, [activeTab]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Helper to get namespaced cache keys
  const getCacheKey = (key) => currentUser ? `${currentUser}_${key}` : `guest_${key}`;

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

    // Load cached history on startup or user change
    const loadCache = async () => {
      try {
        const cachedSent = await localforage.getItem(getCacheKey('sentFiles'));
        const cachedReceived = await localforage.getItem(getCacheKey('receivedFiles'));

        if (cachedSent) {
          const restoredSent = cachedSent.map(item => ({
            ...item,
            url: URL.createObjectURL(item.fileBlob)
          }));
          setSentFiles(restoredSent);
        } else {
          setSentFiles([]);
        }

        if (cachedReceived) {
          const restoredReceived = cachedReceived.map(item => ({
            ...item,
            url: URL.createObjectURL(item.fileBlob)
          }));
          setReceivedFiles(restoredReceived);
        } else {
          setReceivedFiles([]);
        }
      } catch (err) {
        console.error("Error loading cache", err);
      }
    };
    loadCache();

    return () => {
      newPeer.destroy();
    };
  }, [currentUser]);

  const setupConnection = (conn) => {
    conn.on('open', () => {
      setIsConnected(true);
      setConnection(conn);
    });

    conn.on('data', (data) => {
      if (data.type === 'file') {
        // Fallback for old single-blob sending (like empty files)
        const fileBlob = new Blob([data.file]);
        const fileUrl = URL.createObjectURL(fileBlob);
        
        setReceivedFiles(prev => {
          const newFiles = [...prev, {
            name: data.filename,
            url: fileUrl,
            fileBlob: fileBlob,
            size: fileBlob.size,
            mimeType: data.mimeType
          }];
          localforage.setItem(getCacheKey('receivedFiles'), newFiles.map(f => ({ ...f, url: null })));
          setUnreadCount(prev => prev + 1);
          return newFiles;
        });
      } else if (data.type === 'file-start') {
        incomingFiles.current[data.filename] = {
          chunks: new Array(data.totalChunks),
          mimeType: data.mimeType,
          size: data.size
        };
      } else if (data.type === 'file-chunk') {
        if (incomingFiles.current[data.filename]) {
          incomingFiles.current[data.filename].chunks[data.chunkIndex] = data.data;
        }
      } else if (data.type === 'file-end') {
        const fileData = incomingFiles.current[data.filename];
        if (fileData) {
          const fileBlob = new Blob(fileData.chunks, { type: fileData.mimeType });
          const fileUrl = URL.createObjectURL(fileBlob);
          
          setReceivedFiles(prev => {
            const newFiles = [...prev, {
              name: data.filename,
              url: fileUrl,
              fileBlob: fileBlob,
              size: fileBlob.size,
              mimeType: fileData.mimeType
            }];
            localforage.setItem(getCacheKey('receivedFiles'), newFiles.map(f => ({ ...f, url: null })));
            setUnreadCount(prev => prev + 1);
            return newFiles;
          });
          
          delete incomingFiles.current[data.filename];
        }
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

  const handleSendComplete = (files) => {
    setSentFiles((prev) => {
      const newSentFiles = files.map(file => {
        const fileBlob = new Blob([file]);
        return {
          name: file.name,
          url: URL.createObjectURL(fileBlob),
          fileBlob: fileBlob,
          size: file.size,
          mimeType: file.type
        };
      });
      
      const updatedFiles = [...prev, ...newSentFiles];
      localforage.setItem(getCacheKey('sentFiles'), updatedFiles.map(f => ({ ...f, url: null })));
      return updatedFiles;
    });
    setFilesToSend([]);
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

  const handleLogin = (username) => {
    setCurrentUser(username);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="app-container" style={{ paddingBottom: '80px' }}>
      {!currentUser && (
        <div className="marquee-container">
          <div className="marquee-content">
            <span>Register to keep a track on your sent and received files</span>
            <span>Register to keep a track on your sent and received files</span>
            <span>Register to keep a track on your sent and received files</span>
            <span>Register to keep a track on your sent and received files</span>
          </div>
        </div>
      )}

      <header className="header animate-slide-up">
        <h1>ShareFreely</h1>
        {currentUser ? (
          <div 
            className="header-avatar clickable" 
            onClick={handleLogout}
            title="Click to Logout"
          >
            {currentUser.charAt(0).toUpperCase()}
          </div>
        ) : (
          <button 
            className="header-auth-btn" 
            onClick={() => setShowAuthModal(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Register / Login</span>
          </button>
        )}
      </header>

      <main className="main-content">
        {activeTab === 'home' && (
          <>
            {unreadCount > 0 && (
              <div className="new-file-alert animate-slide-up" onClick={() => setActiveTab('received')}>
                <div className="alert-icon">🔔</div>
                <div className="alert-text">
                  <strong>New File Received!</strong>
                  <span>You have {unreadCount} new file{unreadCount > 1 ? 's' : ''} waiting.</span>
                </div>
                <button className="view-btn">View</button>
              </div>
            )}
            
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
                    onSendComplete={handleSendComplete}
                  />
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'sent' && (
          <SentFiles files={sentFiles} />
        )}

        {activeTab === 'received' && (
          <ReceivedFiles files={receivedFiles} />
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} unreadCount={unreadCount} />
      
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}

export default App;
