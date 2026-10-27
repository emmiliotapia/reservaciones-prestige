import React, { useState, useEffect } from 'react';
import TableManager from './components/TableManager';
import LoginScreen from './components/LoginScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('mkt_session') === 'authenticated_2026';
  });

  const handleLogout = () => {
    localStorage.removeItem('mkt_session');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return <TableManager onLogout={handleLogout} />;
}
