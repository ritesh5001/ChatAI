import React, { useCallback, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import './ChatComposer.css';

const ChatComposer = ({ input, setInput, onSend, isSending }) => {
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [input]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) onSend();
    }
  }, [onSend, input]);

  return (
    <motion.form 
      className="composer" 
      onSubmit={e => { e.preventDefault(); if (input.trim()) onSend(); }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div 
        className="composer-surface"
        whileHover={{ scale: 1.005 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="composer-field">
          <textarea
            ref={textareaRef}
            className="composer-input"
            placeholder="Ask Jarvis anything..."
            aria-label="Message"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            spellCheck
            autoComplete="off"
          />
          <div className="composer-hint" aria-hidden="true">
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
        <motion.button
          type="submit"
          className="send-btn"
          disabled={!input.trim() || isSending}
          aria-label={isSending ? 'Sending…' : 'Send message'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="send-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </span>
        </motion.button>
      </motion.div>
    </motion.form>
  );
};

export default ChatComposer;
