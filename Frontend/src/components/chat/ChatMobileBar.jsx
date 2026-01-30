import React from 'react';
import { motion } from 'framer-motion';
import './ChatMobileBar.css';
import './ChatLayout.css';

const ChatMobileBar = ({ onToggleSidebar, onNewChat }) => (
  <motion.header 
    className="chat-mobile-bar"
    initial={{ y: -60 }}
    animate={{ y: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    <motion.button 
      className="chat-icon-btn" 
      onClick={onToggleSidebar} 
      aria-label="Toggle chat history"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 12h18M3 6h18M3 18h18" />
      </svg>
    </motion.button>
    <h1 className="chat-app-title">Jarvis AI</h1>
    <motion.button 
      className="chat-icon-btn" 
      onClick={onNewChat} 
      aria-label="New chat"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </motion.button>
  </motion.header>
);

export default ChatMobileBar;
