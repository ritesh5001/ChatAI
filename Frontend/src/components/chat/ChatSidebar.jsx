import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config/api';
import './ChatSidebar.css';

const ChatSidebar = ({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onRenameChat, open }) => {
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, chatId: null, chatTitle: '' });
  const contextMenuRef = useRef(null);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/login');
    }
  };

  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      chatId: chat._id,
      chatTitle: chat.title
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, chatId: null, chatTitle: '' });
  };

  const handleRename = async () => {
    const newTitle = window.prompt('Enter new chat name:', contextMenu.chatTitle);
    if (newTitle && newTitle.trim() && newTitle !== contextMenu.chatTitle) {
      try {
        await axios.put(`${API_URL}/api/chat/${contextMenu.chatId}`, {
          title: newTitle.trim()
        }, { withCredentials: true });
        
        if (onRenameChat) {
          onRenameChat(contextMenu.chatId, newTitle.trim());
        }
      } catch (err) {
        console.error('Failed to rename chat:', err);
        alert('Failed to rename chat');
      }
    }
    closeContextMenu();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this chat? This cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/api/chat/${contextMenu.chatId}`, { withCredentials: true });
        
        if (onDeleteChat) {
          onDeleteChat(contextMenu.chatId);
        }
      } catch (err) {
        console.error('Failed to delete chat:', err);
        alert('Failed to delete chat');
      }
    }
    closeContextMenu();
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        closeContextMenu();
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', closeContextMenu);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', closeContextMenu);
    };
  }, [contextMenu.visible]);

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
              onContextMenu={(e) => handleContextMenu(e, c)}
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
      
      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu.visible && (
          <motion.div
            ref={contextMenuRef}
            className="context-menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
          >
            <button className="context-menu-item" onClick={handleRename}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Rename
            </button>
            <button className="context-menu-item delete" onClick={handleDelete}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
