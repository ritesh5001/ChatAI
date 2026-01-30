import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config/api';
import './ChatSidebar.css';

const ChatSidebar = ({ chats, activeChatId, onSelectChat, onNewChat, open }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Still redirect on error since we want to clear local state
      navigate('/login');
    }
  };

  return (
    <aside className={"chat-sidebar " + (open ? 'open' : '')} aria-label="Previous chats">
      <div className="sidebar-header">
        <h2>Chats</h2>
        <motion.button 
          className="new-chat-btn" 
          onClick={onNewChat}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New
        </motion.button>
      </div>
      <nav className="chat-list" aria-live="polite">
        <AnimatePresence>
          {chats.map((c, index) => (
            <motion.button
              key={c._id}
              className={"chat-list-item " + (c._id === activeChatId ? 'active' : '')}
              onClick={() => onSelectChat(c._id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="title-line">{c.title}</span>
            </motion.button>
          ))}
        </AnimatePresence>
        {chats.length === 0 && (
          <motion.p 
            className="empty-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No chats yet. Start a conversation!
          </motion.p>
        )}
      </nav>
      <div className="sidebar-footer">
        <motion.button 
          className="logout-btn" 
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </motion.button>
      </div>
    </aside>
  );
};

export default ChatSidebar;
