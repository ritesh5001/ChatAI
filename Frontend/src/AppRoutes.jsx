
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';

const RequireAuth = ({ children }) => {
  const [ status, setStatus ] = useState('checking');

  useEffect(() => {
    let isActive = true;

    axios.get("https://jarvis-ai-3cl2.onrender.com/api/chat", { withCredentials: true })
      .then(() => {
        if (isActive) setStatus('authed');
      })
      .catch((err) => {
        if (!isActive) return;
        const code = err?.response?.status;
        if (code === 401 || code === 403) {
          setStatus('unauth');
        } else {
          setStatus('authed');
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (status === 'checking') {
    return null;
  }

  if (status === 'unauth') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        } />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
