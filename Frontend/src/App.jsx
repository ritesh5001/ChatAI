import { useEffect } from 'react';

import './App.css'
import  AppRoutes  from "./AppRoutes";

function App() {
  useEffect(() => {
    const setSystemTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    };
    setSystemTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setSystemTheme);
    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', setSystemTheme);
    };
  }, []);

  return (
    <>
      <AppRoutes />
    </>
  );
}

export default App
