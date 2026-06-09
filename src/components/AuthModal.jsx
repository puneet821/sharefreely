import React, { useState } from 'react';
import './AuthModal.css';

const AuthModal = ({ onClose, onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    // Since we are mocking auth without a backend, we'll store users in localStorage
    const usersStr = localStorage.getItem('mockUsers');
    const users = usersStr ? JSON.parse(usersStr) : {};

    if (isRegistering) {
      if (users[username]) {
        setError('Username already exists. Try logging in.');
      } else {
        users[username] = { password };
        localStorage.setItem('mockUsers', JSON.stringify(users));
        onLogin(username);
      }
    } else {
      if (users[username] && users[username].password === password) {
        onLogin(username);
      } else {
        setError('Invalid username or password.');
      }
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal animate-slide-up">
        <button className="close-button" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="auth-subtitle">
          {isRegistering 
            ? 'Register to keep track of your sent and received files securely.'
            : 'Login to access your file transfer history.'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="auth-submit-btn">
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="auth-switch">
          {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
          <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); }}>
            {isRegistering ? 'Login here' : 'Register here'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
